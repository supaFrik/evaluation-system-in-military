package com.trungdoi.danhgia.modules.auth.repository;

import com.trungdoi.danhgia.modules.auth.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, String> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByUsernameIgnoreCase(String username);
    boolean existsByUsername(String username);
}
