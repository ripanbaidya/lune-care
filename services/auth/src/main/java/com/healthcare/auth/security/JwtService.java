package com.healthcare.auth.security;

import com.healthcare.auth.config.properties.JwtSecurityProperties;
import com.healthcare.auth.config.properties.RSAProperties;
import com.healthcare.auth.entity.User;
import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.JwtAuthenticationException;
import com.healthcare.auth.util.KeyUtils;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_STATUS = "status";
    private static final String CLAIM_PHONE_NUMBER = "phoneNumber";
    private static final String CLAIM_TOKEN_TYPE = "token_type";

    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtSecurityProperties jwtProperties;
    private final RSAProperties rsaProperties;
    private final ResourceLoader resourceLoader;

    private PrivateKey privateKey;
    private PublicKey publicKey;
    private JwtParser jwtParser;

    @PostConstruct
    private void init() {
        log.info("Initializing RSA key pair for Jwt authentication...");

        String privateKeyPath = rsaProperties.privateKeyPath();
        String publicKeyPath = rsaProperties.publicKeyPath();

        if (!StringUtils.hasText(privateKeyPath) || !StringUtils.hasText(publicKeyPath)) {
            throw new IllegalStateException("RSA key paths must be configured");
        }

        // KeyLoadException (RuntimeException) propagates as-is if keys fail to load
        this.privateKey = KeyUtils.loadPrivateKey(privateKeyPath, resourceLoader);
        this.publicKey = KeyUtils.loadPublicKey(publicKeyPath, resourceLoader);

        this.jwtParser = Jwts.parser()
                .verifyWith(publicKey)
                .requireIssuer(jwtProperties.issuer())
                .clockSkewSeconds(60)
                .build();

        log.info("RSA key pair initialized successfully");
    }

    /*
     * Token Generation
     */

    public String generateAccessToken(User user) {
        String subject = user.getId();
        long expirationInMillis = jwtProperties.accessToken().expiry();

        return buildToken(subject, buildClaims(user, TOKEN_TYPE_ACCESS), expirationInMillis);
    }

    public String generateRefreshToken(User user) {
        String subject = user.getId();
        long expirationInMillis = jwtProperties.refreshToken().expiry();

        return buildToken(subject, buildClaims(user, TOKEN_TYPE_REFRESH), expirationInMillis);
    }

    /*
     * Token Validation
     */

    /**
     * Returns true only if the token parses and passes all JJWT validations.
     */
    public boolean isTokenValid(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            jwtParser.parseSignedClaims(stripBearerPrefix(token));
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT rejected — token expired: {}", ex.getMessage());
            return false;
        } catch (SignatureException ex) {
            log.warn("JWT rejected — signature invalid: {}", ex.getMessage());
            return false;
        } catch (MalformedJwtException | UnsupportedJwtException ex) {
            log.warn("JWT rejected — malformed or unsupported: {}", ex.getMessage());
            return false;
        } catch (JwtException ex) {
            log.warn("JWT rejected: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Returns true if the token's expiration is in the past.
     */
    public boolean isTokenExpired(String token) {
        try {
            return extractClaims(token).getExpiration().before(new Date());
        } catch (JwtAuthenticationException ex) {
            // Malformed or invalid tokens are treated as expired
            return true;
        }
    }

    /*
     * Claim Extraction
     */

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractClaims(token));
    }

    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_ROLE, String.class));
    }

    public String extractStatus(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_STATUS, String.class));
    }

    public String extractPhoneNumber(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_PHONE_NUMBER, String.class));
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public boolean isAccessToken(String token) {
        return TOKEN_TYPE_ACCESS.equals(extractTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return TOKEN_TYPE_REFRESH.equals(extractTokenType(token));
    }

    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    public long getRemainingValidityInMillis(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return Math.max(expiration.getTime() - System.currentTimeMillis(), 0);
    }

    /*
     * Private Helpers
     */

    private Claims extractClaims(String token) {
        try {
            return jwtParser
                    .parseSignedClaims(stripBearerPrefix(token))
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            log.debug("JWT expired: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_EXPIRED);
        } catch (SignatureException ex) {
            log.warn("JWT signature invalid: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_SIGNATURE_INVALID);
        } catch (MalformedJwtException | UnsupportedJwtException ex) {
            log.warn("JWT malformed or unsupported: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_UNSUPPORTED);
        } catch (JwtException ex) {
            log.warn("JWT parsing failed: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_INVALID);
        }
    }

    /**
     * Stripe the bearer prefix from the token if present.
     *
     * @param token the token string
     * @return stripped token string
     */
    private String stripBearerPrefix(String token) {
        if (token != null && token.startsWith(BEARER_PREFIX)) {
            return token.substring(BEARER_PREFIX.length()).trim();
        }
        return token;
    }

    /**
     * Build claims from the {@code User} object
     *
     * @param user the object of user
     * @return a map of claims to be included in the JWT token
     */
    private static Map<String, Object> buildClaims(User user, String tokenType) {
        return Map.of(
                CLAIM_ROLE, user.getRole().name(),
                CLAIM_STATUS, user.getAccountStatus().name(),
                CLAIM_PHONE_NUMBER, user.getPhoneNumber(),
                CLAIM_TOKEN_TYPE, tokenType
        );
    }

    /**
     * Builds a JWT token with the given user ID, claims, and expiration time.
     *
     * @param userId             ID of the user, use as subject
     * @param claims             custom claims to include in the token
     * @param expirationInMillis expiration time of token (access, refresh) in millis
     * @return the generated JWT token string
     */
    private String buildToken(String userId, Map<String, Object> claims, long expirationInMillis) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationInMillis);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId)
                .claims(claims)
                .issuer(jwtProperties.issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(privateKey, Jwts.SIG.RS512)
                .compact();
    }
}