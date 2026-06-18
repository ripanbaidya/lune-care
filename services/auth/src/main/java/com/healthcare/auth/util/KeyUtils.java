package com.healthcare.auth.util;

import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.KeyLoadException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Utility for loading RSA keys from .pem files.
 * Supports either a Spring classpath resource (for example {@code classpath:keys/public_key.pem})
 * or a filesystem path (for example {@code /app/secrets/keys/private_key.pem}).
 * <p>Private keys should stay on the filesystem and be mounted at runtime; public keys can also
 * be mounted or bundled on the classpath if that better fits the service.
 */
@Slf4j
public final class KeyUtils {
    private static final String PRIVATE_KEY_HEADER = "-----BEGIN PRIVATE KEY-----";
    private static final String PRIVATE_KEY_FOOTER = "-----END PRIVATE KEY-----";
    private static final String PUBLIC_KEY_HEADER = "-----BEGIN PUBLIC KEY-----";
    private static final String PUBLIC_KEY_FOOTER = "-----END PUBLIC KEY-----";
    private static final String KEY_ALGORITHM = "RSA";
    private static final String CLASSPATH_PREFIX = "classpath:";
    private static final String FILE_PREFIX = "file:";

    private KeyUtils() {
    }

    /**
     * Loads an RSA private key from a PEM file.
     * <p>The private key file is expected to contain a standard {@code BEGIN PRIVATE KEY}
     * PEM block, which maps to PKCS#8 once the Base64 body is decoded.
     *
     * @param pemPath        filesystem or classpath location to the {@code .pem} file
     * @param resourceLoader Spring resource loader used to resolve classpath resources
     * @return the parsed {@link PrivateKey}
     * @throws KeyLoadException if the file is missing, unreadable, or the key is malformed
     */
    public static PrivateKey loadPrivateKey(String pemPath, ResourceLoader resourceLoader) {
        log.debug("Loading RSA private key from: {}", pemPath);

        try {
            byte[] keyBytes = decodePem(pemPath, resourceLoader, PRIVATE_KEY_HEADER, PRIVATE_KEY_FOOTER);
            PrivateKey key = KeyFactory.getInstance(KEY_ALGORITHM)
                    .generatePrivate(new PKCS8EncodedKeySpec(keyBytes));

            log.info("RSA private key loaded successfully");
            return key;

        } catch (GeneralSecurityException ex) {
            throw new KeyLoadException(
                    ErrorCode.PRIVATE_KEY_LOAD_FAILED,
                    "Failed to parse RSA private key from: %s".formatted(pemPath),
                    ex
            );
        }
    }

    /**
     * Loads an RSA public key from a PEM file.
     * <p>The public key is safe to ship via the classpath or as a mounted file.
     *
     * @param pemPath        filesystem or classpath location to the {@code .pem} file
     * @param resourceLoader Spring resource loader used to resolve classpath resources
     * @return the parsed {@link PublicKey}
     * @throws KeyLoadException if the file is missing, unreadable, or the key is malformed
     */
    public static PublicKey loadPublicKey(String pemPath, ResourceLoader resourceLoader) {
        log.debug("Loading RSA public key from: {}", pemPath);

        try {
            byte[] keyBytes = decodePem(pemPath, resourceLoader, PUBLIC_KEY_HEADER, PUBLIC_KEY_FOOTER);
            PublicKey key = KeyFactory.getInstance(KEY_ALGORITHM)
                    .generatePublic(new X509EncodedKeySpec(keyBytes));

            log.info("RSA public key loaded successfully from: {}", pemPath);
            return key;

        } catch (GeneralSecurityException ex) {
            throw new KeyLoadException(
                    ErrorCode.PUBLIC_KEY_LOAD_FAILED,
                    "Failed to parse RSA public key from: %s".formatted(pemPath),
                    ex
            );
        }
    }

    // Private helpers

    /**
     * Reads a PEM file, strips its header/footer, and Base64-decodes the body
     * into the raw DER bytes expected by {@link java.security.spec.EncodedKeySpec}.
     */
    private static byte[] decodePem(String pemPath, ResourceLoader resourceLoader,
                                    String header, String footer) {
        String raw = readPemContent(pemPath, resourceLoader);
        String base64Body = raw
                .replace(header, "")
                .replace(footer, "")
                .replaceAll("\\s", "");

        try {
            return Base64.getDecoder().decode(base64Body);
        } catch (IllegalArgumentException ex) {
            throw new KeyLoadException(
                    ErrorCode.INVALID_KEY_FORMAT,
                    "PEM file contains invalid Base64 content: %s".formatted(pemPath),
                    ex
            );
        }
    }

    /**
     * Reads raw PEM text from either the classpath or the filesystem.
     */
    private static String readPemContent(String location, ResourceLoader resourceLoader) {
        Resource resource = resolveResource(location, resourceLoader);

        if (!resource.exists()) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_NOT_FOUND,
                    "Key file not found: %s".formatted(location)
            );
        }

        if (!resource.isReadable()) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_NOT_READABLE,
                    "Key file exists but is not readable: %s".formatted(location)
            );
        }

        try (InputStream in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_READ_FAILED,
                    "Failed to read key file: %s".formatted(location),
                    ex
            );
        }
    }

    /**
     * Resolves a resource from either the classpath or the filesystem.
     */
    private static Resource resolveResource(String location, ResourceLoader resourceLoader) {
        if (location.startsWith(CLASSPATH_PREFIX) || location.startsWith(FILE_PREFIX)) {
            return resourceLoader.getResource(location);
        }

        Path path = Paths.get(location);
        if (path.isAbsolute() || Files.exists(path)) {
            return new FileSystemResource(path);
        }

        return resourceLoader.getResource(location);
    }
}
