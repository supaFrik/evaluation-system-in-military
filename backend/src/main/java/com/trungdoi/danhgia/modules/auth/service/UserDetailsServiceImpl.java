package com.trungdoi.danhgia.modules.auth.service;

import com.trungdoi.danhgia.modules.auth.security.UserPrincipal;

import com.trungdoi.danhgia.modules.auth.entity.UserAccount;
import com.trungdoi.danhgia.modules.auth.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount account = userAccountRepository.findByUsername(username)
                .or(() -> userAccountRepository.findByUsernameIgnoreCase(username))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với tên đăng nhập: " + username));

        return UserPrincipal.create(account);
    }
}
