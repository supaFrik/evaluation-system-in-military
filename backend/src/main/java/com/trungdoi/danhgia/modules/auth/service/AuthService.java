package com.trungdoi.danhgia.modules.auth.service;

import com.trungdoi.danhgia.common.enums.UserRole;
import com.trungdoi.danhgia.common.exception.BadRequestException;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.common.exception.UnauthorizedException;
import com.trungdoi.danhgia.infrastructure.mail.EmailService;
import com.trungdoi.danhgia.infrastructure.security.JwtTokenProvider;
import com.trungdoi.danhgia.modules.auth.dto.request.LoginRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.RefreshTokenRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.RegisterRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.ResendOtpRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.VerifyOtpRequest;
import com.trungdoi.danhgia.modules.auth.dto.response.AuthResponse;
import com.trungdoi.danhgia.modules.auth.dto.response.UserResponseDto;
import com.trungdoi.danhgia.modules.auth.entity.OtpToken;
import com.trungdoi.danhgia.modules.auth.entity.UserAccount;
import com.trungdoi.danhgia.modules.auth.repository.OtpTokenRepository;
import com.trungdoi.danhgia.modules.auth.repository.UserAccountRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.modules.auth.dto.request.AssignSoldierRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.AssignUnitsRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.UpdateRoleScopeRequest;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserAccountRepository userAccountRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final SoldierRepository soldierRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String loginIdentifier = request.getUsername().trim();

        // Tìm UserAccount tương ứng trước để lấy username chính xác (nếu người dùng đăng nhập bằng Email hoặc SĐT)
        UserAccount userAccount = userAccountRepository.findByUsername(loginIdentifier)
                .or(() -> userAccountRepository.findByUsernameIgnoreCase(loginIdentifier))
                .or(() -> userAccountRepository.findByEmail(loginIdentifier))
                .or(() -> userAccountRepository.findByPhone(loginIdentifier))
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản hoặc mật khẩu không chính xác"));

        if ("PENDING".equalsIgnoreCase(userAccount.getStatus())) {
            throw new UnauthorizedException("Tài khoản chưa được kích hoạt qua mã OTP Gmail. Vui lòng xác thực tài khoản trước khi đăng nhập.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userAccount.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(
                userAccount.getUsername(),
                userAccount.getRole().name(),
                userAccount.getId()
        );

        String refreshToken = tokenProvider.generateRefreshToken(userAccount.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationInSeconds())
                .user(mapToUserResponseDto(userAccount))
                .build();
    }

    @Transactional
    public UserResponseDto register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        String phone = request.getPhone() != null ? request.getPhone().trim() : null;

        if ((email == null || email.isBlank()) && (phone == null || phone.isBlank())) {
            throw new BadRequestException("Vui lòng cung cấp ít nhất một phương thức đăng ký: Gmail hoặc Số điện thoại");
        }

        if (email != null && !email.isBlank()) {
            if (userAccountRepository.existsByEmail(email)) {
                throw new BadRequestException("Địa chỉ Gmail này đã được đăng ký trong hệ thống");
            }
        }

        if (phone != null && !phone.isBlank()) {
            if (userAccountRepository.existsByPhone(phone)) {
                throw new BadRequestException("Số điện thoại này đã được đăng ký trong hệ thống");
            }
        }

        String username = request.getUsername();
        if (username == null || username.isBlank()) {
            username = (email != null && !email.isBlank()) ? email.split("@")[0] : phone;
        }
        username = username.trim().toLowerCase();

        if (userAccountRepository.existsByUsername(username)) {
            // Thêm hậu tố ngẫu nhiên nếu trùng username tự sinh
            username = username + "_" + (RANDOM.nextInt(9000) + 1000);
        }

        boolean hasEmail = (email != null && !email.isBlank());
        String initialStatus = hasEmail ? "PENDING" : "ACTIVE";

        UserAccount newAccount = UserAccount.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName().trim())
                .email(email)
                .phone(phone)
                .role(UserRole.USER) // Luôn luôn là USER, không thể đăng ký ADMIN
                .roleTitle("Quân nhân / Người dùng")
                .status(initialStatus)
                .avatarUrl("/default-avatar.png")
                .build();

        UserAccount savedAccount = userAccountRepository.save(newAccount);

        // Nếu đăng ký qua Gmail -> Sinh OTP và gửi qua EmailService
        if (hasEmail) {
            String otpCode = String.format("%06d", RANDOM.nextInt(1000000));
            OtpToken otpToken = OtpToken.builder()
                    .id(UUID.randomUUID().toString())
                    .identifier(email)
                    .otpCode(otpCode)
                    .expiryTime(LocalDateTime.now().plusMinutes(10))
                    .isUsed(false)
                    .build();
            otpTokenRepository.save(otpToken);

            emailService.sendOtpEmail(email, otpCode);
        }

        return mapToUserResponseDto(savedAccount);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String identifier = request.getIdentifier().trim();
        String code = request.getOtpCode().trim();

        OtpToken otpToken = otpTokenRepository.findTopByIdentifierAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(identifier, code)
                .orElseThrow(() -> new BadRequestException("Mã xác thực OTP không chính xác"));

        if (otpToken.isExpired()) {
            throw new BadRequestException("Mã xác thực OTP đã hết hạn (quá 10 phút). Vui lòng yêu cầu gửi lại mã mới.");
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        UserAccount userAccount = userAccountRepository.findByEmail(identifier)
                .or(() -> userAccountRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản tương ứng với mã OTP"));

        userAccount.setStatus("ACTIVE");
        userAccountRepository.save(userAccount);

        String accessToken = tokenProvider.generateAccessToken(
                userAccount.getUsername(),
                userAccount.getRole().name(),
                userAccount.getId()
        );
        String refreshToken = tokenProvider.generateRefreshToken(userAccount.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationInSeconds())
                .user(mapToUserResponseDto(userAccount))
                .build();
    }

    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        String identifier = request.getIdentifier().trim();

        UserAccount userAccount = userAccountRepository.findByEmail(identifier)
                .or(() -> userAccountRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + identifier));

        if ("ACTIVE".equalsIgnoreCase(userAccount.getStatus())) {
            throw new BadRequestException("Tài khoản này đã được kích hoạt trước đó");
        }

        String email = userAccount.getEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Tài khoản không có địa chỉ Gmail hợp lệ để nhận mã OTP");
        }

        String otpCode = String.format("%06d", RANDOM.nextInt(1000000));
        OtpToken otpToken = OtpToken.builder()
                .id(UUID.randomUUID().toString())
                .identifier(email)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otpCode);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!tokenProvider.validateRefreshToken(token)) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String username = tokenProvider.getUsernameFromToken(token);
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .or(() -> userAccountRepository.findByUsernameIgnoreCase(username))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng cho refresh token"));

        String newAccessToken = tokenProvider.generateAccessToken(
                userAccount.getUsername(),
                userAccount.getRole().name(),
                userAccount.getId()
        );

        String newRefreshToken = tokenProvider.generateRefreshToken(userAccount.getUsername());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationInSeconds())
                .user(mapToUserResponseDto(userAccount))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUser(String username) {
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .or(() -> userAccountRepository.findByUsernameIgnoreCase(username))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        return mapToUserResponseDto(userAccount);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers(UserRole role, String status, String search) {
        List<UserAccount> users = userAccountRepository.findAll();
        return users.stream()
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> status == null || status.isBlank() || (u.getStatus() != null && u.getStatus().equalsIgnoreCase(status)))
                .filter(u -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase().trim();
                    return (u.getUsername() != null && u.getUsername().toLowerCase().contains(s))
                            || (u.getName() != null && u.getName().toLowerCase().contains(s))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(s))
                            || (u.getPhone() != null && u.getPhone().contains(s));
                })
                .map(this::mapToUserResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDto assignSoldier(String userId, AssignSoldierRequest request) {
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng với id: " + userId));

        Soldier soldier = soldierRepository.findById(request.getSoldierId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ quân nhân với id: " + request.getSoldierId()));

        userAccount.setSoldierId(soldier.getId());
        userAccount.setName(soldier.getName());
        if (soldier.getRank() != null && !soldier.getRank().isBlank()) {
            userAccount.setRank(soldier.getRank());
        }
        if (soldier.getRoleTitle() != null && !soldier.getRoleTitle().isBlank()) {
            userAccount.setRoleTitle(soldier.getRoleTitle());
        }
        if (soldier.getPlatoonId() != null) {
            userAccount.setPlatoonId(soldier.getPlatoonId());
        }

        UserAccount saved = userAccountRepository.save(userAccount);
        log.info("Linked user {} with soldier {} ({})", userAccount.getUsername(), soldier.getName(), soldier.getId());
        return mapToUserResponseDto(saved);
    }

    @Transactional
    public UserResponseDto updateRoleScope(String userId, UpdateRoleScopeRequest request) {
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng với id: " + userId));

        if (request.getRole() != null) {
            userAccount.setRole(request.getRole());
        }
        if (request.getRoleTitle() != null) {
            userAccount.setRoleTitle(request.getRoleTitle());
        }
        if (request.getUnitScopeTier() != null) {
            userAccount.setUnitScopeTier(request.getUnitScopeTier());
        }
        if (request.getAssignedUnitId() != null) {
            userAccount.setAssignedUnitId(request.getAssignedUnitId());
        }
        if (request.getAssignedUnitIds() != null) {
            userAccount.setAssignedUnitIdsJson(serializeUnitIds(request.getAssignedUnitIds()));
            if (!request.getAssignedUnitIds().isEmpty() && (request.getAssignedUnitId() == null || request.getAssignedUnitId().isBlank())) {
                userAccount.setAssignedUnitId(request.getAssignedUnitIds().get(0));
            }
        }
        if (request.getPlatoonId() != null) {
            userAccount.setPlatoonId(request.getPlatoonId());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            userAccount.setStatus(request.getStatus());
        }

        UserAccount saved = userAccountRepository.save(userAccount);
        log.info("Updated role/scope for user {}: role={}, scopeTier={}, assignedUnit={}",
                userAccount.getUsername(), userAccount.getRole(), userAccount.getUnitScopeTier(), userAccount.getAssignedUnitId());
        return mapToUserResponseDto(saved);
    }

    @Transactional
    public UserResponseDto assignUnitsToUser(String userId, AssignUnitsRequest request) {
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng với id: " + userId));

        List<String> unitIds = request != null && request.getUnitIds() != null ? request.getUnitIds() : Collections.emptyList();
        userAccount.setAssignedUnitIdsJson(serializeUnitIds(unitIds));
        userAccount.setAssignedUnitId(unitIds.isEmpty() ? null : unitIds.get(0));

        UserAccount saved = userAccountRepository.save(userAccount);
        log.info("Assigned units {} to user {}", unitIds, userAccount.getUsername());
        return mapToUserResponseDto(saved);
    }

    @Transactional
    public void deleteUser(String userId, String currentUsername) {
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id: " + userId));

        if (userAccount.getUsername().equalsIgnoreCase(currentUsername)) {
            throw new BadRequestException("Không thể tự xóa tài khoản của chính mình");
        }

        userAccountRepository.delete(userAccount);
        log.info("Deleted user {} by admin {}", userAccount.getUsername(), currentUsername);
    }

    private String serializeUnitIds(List<String> unitIds) {
        try {
            return objectMapper.writeValueAsString(unitIds != null ? unitIds : Collections.emptyList());
        } catch (Exception e) {
            log.warn("Failed to serialize assignedUnitIds", e);
            return "[]";
        }
    }

    private List<String> deserializeUnitIds(UserAccount userAccount) {
        if (userAccount.getAssignedUnitIdsJson() != null && !userAccount.getAssignedUnitIdsJson().isBlank()) {
            try {
                return objectMapper.readValue(userAccount.getAssignedUnitIdsJson(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse assignedUnitIdsJson for user {}", userAccount.getUsername());
            }
        }
        if (userAccount.getAssignedUnitId() != null && !userAccount.getAssignedUnitId().isBlank()) {
            return List.of(userAccount.getAssignedUnitId());
        }
        return new ArrayList<>();
    }

    public UserResponseDto mapToUserResponseDto(UserAccount userAccount) {
        List<String> assignedIds = deserializeUnitIds(userAccount);
        return UserResponseDto.builder()
                .id(userAccount.getId())
                .username(userAccount.getUsername())
                .name(userAccount.getName())
                .rank(userAccount.getRank())
                .role(userAccount.getRole().name())
                .roleTitle(userAccount.getRoleTitle())
                .soldierId(userAccount.getSoldierId())
                .platoonId(userAccount.getPlatoonId())
                .unitScopeTier(userAccount.getUnitScopeTier() != null ? userAccount.getUnitScopeTier().name() : null)
                .assignedUnitId(userAccount.getAssignedUnitId() != null ? userAccount.getAssignedUnitId() : (assignedIds.isEmpty() ? null : assignedIds.get(0)))
                .assignedUnitIds(assignedIds)
                .phone(userAccount.getPhone())
                .email(userAccount.getEmail())
                .status(userAccount.getStatus())
                .avatarUrl(userAccount.getAvatarUrl())
                .build();
    }
}
