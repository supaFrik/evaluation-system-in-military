package com.trungdoi.danhgia.modules.auth.security;

import com.trungdoi.danhgia.modules.auth.entity.UserAccount;
import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final String id;
    private final String username;
    private final String password;
    private final String name;
    private final String rank;
    private final UserRole role;
    private final String roleTitle;
    private final String soldierId;
    private final String platoonId;
    private final UnitTier unitScopeTier;
    private final String assignedUnitId;
    private final String avatarUrl;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(UserAccount account) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + account.getRole().name());
        return new UserPrincipal(
                account.getId(),
                account.getUsername(),
                account.getPassword(),
                account.getName(),
                account.getRank(),
                account.getRole(),
                account.getRoleTitle(),
                account.getSoldierId(),
                account.getPlatoonId(),
                account.getUnitScopeTier(),
                account.getAssignedUnitId(),
                account.getAvatarUrl(),
                Collections.singletonList(authority)
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
