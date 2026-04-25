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

@Slf4j
@Service
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

    /**
     * RSA key pair initialization
     *
     * @throws IllegalStateException if RSA key paths are not configured
     */
    @PostConstruct
    private void init() {
        log.info("Initializing RSA key pair for JWT authentication");

        String privateKeyPath = rsaProperties.privateKeyPath();
        String publicKeyPath = rsaProperties.publicKeyPath();

        if (!StringUtils.hasText(privateKeyPath) || !StringUtils.hasText(publicKeyPath)) {
            throw new IllegalStateException("RSA key paths must be configured. Check rsa.private-key-path and rsa.public-key-path.");
        }

        this.privateKey = KeyUtils.loadPrivateKey(privateKeyPath, resourceLoader);
        this.publicKey = KeyUtils.loadPublicKey(publicKeyPath, resourceLoader);

        this.jwtParser = Jwts.parser()
                .verifyWith(publicKey)
                .requireIssuer(jwtProperties.issuer())
                .clockSkewSeconds(60)
                .build();

        log.info("RSA key pair initialized successfully.");
    }

    /**
     * ------- Token Generation -------
     * <p>Note: for both access and refresh tokens, the same user ID is used as the subject.
     * The expiration time is set based on the token type (access or refresh) and the expiry
     * is in milliseconds.
     */

    public String generateAccessToken(User user) {
        return buildToken(
                user.getId(),
                buildClaims(user, TOKEN_TYPE_ACCESS),
                jwtProperties.accessToken().expiry()
        );
    }

    public String generateRefreshToken(User user) {
        return buildToken(
                user.getId(),
                buildClaims(user, TOKEN_TYPE_REFRESH),
                jwtProperties.refreshToken().expiry()
        );
    }

    /**
     * ------- Token Validation -------
     * <p>Validates that the token is well-formed, correctly signed, not expired, and
     * issued by this service.
     *
     * @return true if the token is valid, false for any failure instead.
     */
    public boolean isTokenValid(String token) {
        if (!StringUtils.hasText(token)) {
            log.debug("Token validation failed — token is null or blank.");
            return false;
        }
        try {
            jwtParser.parseSignedClaims(stripBearerPrefix(token));
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT validation failed — token expired: {}", ex.getMessage());
        } catch (SignatureException ex) {
            log.warn("JWT validation failed — invalid RSA signature: {}", ex.getMessage());
        } catch (MalformedJwtException | UnsupportedJwtException ex) {
            log.warn("JWT validation failed — malformed or unsupported format: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.warn("JWT validation failed — general JWT error: {}", ex.getMessage());
        }
        return false;
    }

    /*
     * ------- Claim Extraction -------
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

    /**
     * Checks whether a token carries the {@code token_type=access} claim.
     */
    public boolean isAccessToken(String token) {
        return TOKEN_TYPE_ACCESS.equals(extractTokenType(token));
    }

    /**
     * Checks whether a token carries the {@code token_type=refresh} claim.
     */
    public boolean isRefreshToken(String token) {
        return TOKEN_TYPE_REFRESH.equals(extractTokenType(token));
    }

    /**
     * Extracts the JWT ID ({@code jti}) claim.
     */
    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    /**
     * Returns how many milliseconds remain until the token expires.
     * Returns {@code 0} if the token is already expired.
     */
    public long getRemainingValidityInMillis(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return Math.max(expiration.getTime() - System.currentTimeMillis(), 0);
    }

    /*
     * ------- Private Helpers -------
     */

    /**
     * Parses the token and returns its {@link Claims} payload.
     */
    private Claims extractClaims(String token) {
        try {
            return jwtParser
                    .parseSignedClaims(stripBearerPrefix(token))
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            log.debug("Claims extraction failed — token expired for jti: {}", safeExtractJtiFromExpired(ex));
            throw new JwtAuthenticationException(ErrorCode.TOKEN_EXPIRED);
        } catch (SignatureException ex) {
            log.warn("Claims extraction failed — RSA signature mismatch.");
            throw new JwtAuthenticationException(ErrorCode.TOKEN_SIGNATURE_INVALID);
        } catch (MalformedJwtException | UnsupportedJwtException ex) {
            log.warn("Claims extraction failed — token is malformed or uses unsupported algorithm.");
            throw new JwtAuthenticationException(ErrorCode.TOKEN_UNSUPPORTED);
        } catch (JwtException ex) {
            log.warn("Claims extraction failed — general JWT error: {}", ex.getMessage());
            throw new JwtAuthenticationException(ErrorCode.TOKEN_INVALID);
        }
    }

    /**
     * Strips the {@code Bearer } prefix from the token if present.
     * Handles both prefixed and raw token strings safely.
     */
    private String stripBearerPrefix(String token) {
        if (token != null && token.startsWith(BEARER_PREFIX)) {
            return token.substring(BEARER_PREFIX.length()).trim();
        }
        return token;
    }

    /**
     * Builds the custom claims map for the given user and token type.
     * All values are non-null by contract — {@code role} and {@code accountStatus}
     * are enums so they are always present on a valid {@link User}.
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
     * Assembles and signs a JWT with the provided subject, claims, and TTL.
     *
     * @param userId             used as JWT {@code sub} claim
     * @param claims             additional payload claims
     * @param expirationInMillis token lifetime from now, in milliseconds
     * @return compact, signed JWT string
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

    /**
     * Safely extracts the JTI from an expired token for logging purposes.
     * The claims are still accessible from {@link ExpiredJwtException} even after expiry.
     */
    private String safeExtractJtiFromExpired(ExpiredJwtException ex) {
        try {
            return ex.getClaims().getId();
        } catch (Exception ignored) {
            return "unknown";
        }
    }
}