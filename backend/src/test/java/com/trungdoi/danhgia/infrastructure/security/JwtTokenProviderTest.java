package com.trungdoi.danhgia.infrastructure.security;

import com.trungdoi.danhgia.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        // 256-bit test secret (64 hex characters)
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "9a2f8c4e7b1d3f6a8e0c2b5d7e9f1a3c5b7d9e1f3a5c7b9e1f3a5c7b9e1f3a5c");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpirationInMs", 86400000L); // 24 hours
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        String token = jwtTokenProvider.generateAccessToken("thang_b1", "COMMANDER", "u-004");
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertTrue(jwtTokenProvider.validateAccessToken(token));
        assertFalse(jwtTokenProvider.validateRefreshToken(token));
        assertEquals("ACCESS", jwtTokenProvider.getTokenType(token));
        assertEquals("thang_b1", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void testGenerateAndValidateRefreshToken() {
        String refreshToken = jwtTokenProvider.generateRefreshToken("thang_b1");
        assertNotNull(refreshToken);
        assertTrue(jwtTokenProvider.validateToken(refreshToken));
        assertTrue(jwtTokenProvider.validateRefreshToken(refreshToken));
        assertFalse(jwtTokenProvider.validateAccessToken(refreshToken));
        assertEquals("REFRESH", jwtTokenProvider.getTokenType(refreshToken));
        assertEquals("thang_b1", jwtTokenProvider.getUsernameFromToken(refreshToken));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.signature"));
        assertFalse(jwtTokenProvider.validateToken(""));
    }

    @Test
    void testExpiredToken() {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(shortLivedProvider, "jwtSecret", "9a2f8c4e7b1d3f6a8e0c2b5d7e9f1a3c5b7d9e1f3a5c7b9e1f3a5c7b9e1f3a5c");
        ReflectionTestUtils.setField(shortLivedProvider, "jwtExpirationInMs", -1000L); // Expired 1 sec ago
        ReflectionTestUtils.setField(shortLivedProvider, "refreshExpirationInMs", -1000L);

        String expiredToken = shortLivedProvider.generateAccessToken("test_user", "COMMANDER", "u-test");
        assertFalse(shortLivedProvider.validateToken(expiredToken));
    }
}
