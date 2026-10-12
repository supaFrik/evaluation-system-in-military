package com.trungdoi.danhgia.modules.auth.repository;

import com.trungdoi.danhgia.modules.auth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {
    Optional<OtpToken> findTopByIdentifierAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(String identifier, String otpCode);
    Optional<OtpToken> findTopByIdentifierAndIsUsedFalseOrderByCreatedAtDesc(String identifier);
}
