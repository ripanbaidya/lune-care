package com.healthcare.gateway.security;

import com.healthcare.gateway.enums.ErrorCode;
import com.healthcare.gateway.exception.JwtAuthenticationException;
import com.healthcare.gateway.util.KeyUtils;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.PublicKey;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String BEARER_PREFIX = "Bearer ";

    @Value("${app.security.jwt.issuer}")
    private String jwtIssuer;

    @Value("${app.security.rsa.public-key-path}")
    private String publicKeyPath;

    private PublicKey publicKey;
    private JwtParser jwtParser;

    private final ResourceLoader resourceLoader;

    @PostConstruct
    private void init() {
        log.info("Initializing RSA public key for JWT authentication...");

        if (!StringUtils.hasText(publicKeyPath)) {
            throw new IllegalStateException("RSA public key path must be configured");
        }

        this.publicKey = KeyUtils.loadPublicKey(publicKeyPath, resourceLoader);

        this.jwtParser = Jwts.parser()
                .verifyWith(publicKey)
                .requireIssuer(jwtIssuer)
                .clockSkewSeconds(60)
                .build();

        log.info("RSA public key initialized successfully");
    }

    /**
     * Returns the full Claims object. Caller extracts whatever fields it needs.
     *
     * @param token
     * @return
     */
    public Claims extractAllClaims(String token) {
        try {
            return jwtParser
                    .parseSignedClaims(stripBearerPrefix(token))
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            log.warn("JWT rejected - token expired: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_EXPIRED);
        } catch (SignatureException ex) {
            log.warn("JWT rejected - signature invalid: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_SIGNATURE_INVALID);
        } catch (MalformedJwtException | UnsupportedJwtException ex) {
            log.warn("JWT rejected - malformed or unsupported: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_UNSUPPORTED);
        } catch (JwtException ex) {
            log.warn("JWT rejected: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_INVALID);
        }
    }

    /*
     * Extract claims
     */
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    /*
     * Helpers
     */
    private String stripBearerPrefix(String token) {
        if (token != null && token.startsWith(BEARER_PREFIX)) {
            return token.substring(BEARER_PREFIX.length()).trim();
        }
        return token;
    }
}