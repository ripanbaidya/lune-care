package com.healthcare.auth.util;

import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.KeyLoadException;
import lombok.extern.slf4j.Slf4j;
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
 * Utility for loading RSA keys from PEM files.
 * Supports two path schemes:
 * {@code classpath:keys/public_key.pem} — loaded from the JAR (safe for public keys only)
 * {@code /run/secrets/private_key.pem} — loaded from the filesystem (required for private keys)
 * <p>Private keys must never be bundled inside the JAR. Always supply them via a filesystem path
 * backed by an environment variable or a secrets' manager.
 */
@Slf4j
public final class KeyUtils {

    private static final String PRIVATE_KEY_HEADER = "-----BEGIN PRIVATE KEY-----";
    private static final String PRIVATE_KEY_FOOTER = "-----END PRIVATE KEY-----";
    private static final String PUBLIC_KEY_HEADER = "-----BEGIN PUBLIC KEY-----";
    private static final String PUBLIC_KEY_FOOTER = "-----END PUBLIC KEY-----";
    private static final String KEY_ALGORITHM = "RSA";
    private static final String CLASSPATH_PREFIX = "classpath:";

    private KeyUtils() {
    }

    /**
     * Loads an RSA private key in PKCS#8 PEM format.
     * <p>The path must point to a filesystem location — private keys must not
     * be bundled in the classpath. Inject the path via an environment variable
     * in all deployed environments.
     *
     * @param pemPath        filesystem path to the {@code .pem} file
     * @param resourceLoader Spring resource loader (used for classpath fallback in tests)
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
     * Loads an RSA public key in X.509 PEM format.
     * <p>The public key is safe to bundle in the classpath (e.g. inside the JAR)
     * because it carries no secret material. Services that only verify JWTs
     * can use a {@code classpath:} path here.
     *
     * @param pemPath        classpath or filesystem path to the {@code .pem} file
     * @param resourceLoader Spring resource loader
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
     * Reads raw PEM text from either the classpath or the filesystem,
     * determined by whether the path starts with {@code classpath:}.
     */
    private static String readPemContent(String location, ResourceLoader resourceLoader) {
        return location.startsWith(CLASSPATH_PREFIX)
                ? readFromClasspath(location, resourceLoader)
                : readFromFilesystem(location);
    }

    /**
     * Loads a classpath resource using Spring's {@link ResourceLoader}.
     * Suitable for public keys shipped inside the application JAR.
     */
    private static String readFromClasspath(String location, ResourceLoader resourceLoader) {
        Resource resource = resourceLoader.getResource(location);

        if (!resource.exists()) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_NOT_FOUND,
                    "Classpath key resource not found: %s".formatted(location)
            );
        }

        try (InputStream in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_READ_FAILED,
                    "Failed to read classpath key resource: %s".formatted(location),
                    ex
            );
        }
    }

    /**
     * Loads a PEM file from an absolute or relative filesystem path.
     * Required for private keys, which must not be bundled in the JAR.
     */
    private static String readFromFilesystem(String location) {
        Path path = Paths.get(location);

        if (!Files.exists(path)) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_NOT_FOUND,
                    "Key file not found at filesystem path: %s".formatted(location)
            );
        }

        if (!Files.isReadable(path)) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_NOT_READABLE,
                    "Key file exists but is not readable (check file permissions): %s".formatted(location)
            );
        }

        try {
            return Files.readString(path);
        } catch (IOException ex) {
            throw new KeyLoadException(
                    ErrorCode.KEY_FILE_READ_FAILED,
                    "IO error while reading key file: %s".formatted(location),
                    ex
            );
        }
    }
}