package com.trungdoi.danhgia.modules.auth.service;

import com.trungdoi.danhgia.modules.auth.dto.request.LoginRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.RefreshTokenRequest;
import com.trungdoi.danhgia.modules.auth.dto.response.AuthResponse;
import com.trungdoi.danhgia.modules.auth.dto.response.UserResponseDto;
import com.trungdoi.danhgia.modules.auth.entity.UserAccount;
import com.trungdoi.danhgia.common.exception.BadRequestException;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.common.exception.UnauthorizedException;
import com.trungdoi.danhgia.modules.auth.repository.UserAccountRepository;
import com.trungdoi.danhgia.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserAccountRepository userAccountRepository;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserAccount userAccount = userAccountRepository.findByUsername(request.getUsername())
                .or(() -> userAccountRepository.findByUsernameIgnoreCase(request.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + request.getUsername()));

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

    public UserResponseDto mapToUserResponseDto(UserAccount userAccount) {
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
                .assignedUnitId(userAccount.getAssignedUnitId())
                .phone(userAccount.getPhone())
                .avatarUrl(userAccount.getAvatarUrl())
                .build();
    }
}
