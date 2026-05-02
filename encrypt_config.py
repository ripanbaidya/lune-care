# This script automates the encryption of sensitive configuration values for a Spring Cloud Config Server
# backed by a Git repository.
# To avoid exposing or hardcoding secrets and credentials in the public repo, values must be encrypted before storage.
# The Config Server's /encrypt endpoint is used for this purpose, but manual encryption of multiple secrets is
# cumbersome and time-consuming.
# This Python script streamlines the process by reading environment variables from a .env file, encrypting sensitive ones
# via the endpoint, and generating an encrypted-config.yml file with the encrypted versions.
# Customize the script as needed for your specific requirements.

import subprocess

CONFIG_SERVER_URL = "http://localhost:8888"
ENV_FILE = "/Users/ripanbaidya/Documents/projects/lune-care/.env"
OUTPUT_FILE = "encrypted-config.yml"

# These are non-sensitive, no need to encrypt
PLAIN_KEYS = {
    "JWT_ACCESS_TOKEN_EXPIRY",
    "JWT_REFRESH_TOKEN_EXPIRY",
    "EUREKA_DEFAULT_ZONE",
    "EUREKA_HOSTNAME",
    "RABBITMQ_HOST",
    "RABBITMQ_PORT",
    "REDIS_PORT",
    "GIT_URI",
    "GIT_USERNAME",
    "UPSTASH_REDIS_REST_URL",
}

# Group keys by service for organized output
SERVICE_GROUPS = {
    "# === CLOUDINARY ===": ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
    "# === RAZORPAY ===": ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
    "# === STRIPE ===": ["STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    "# === JWT ===": ["JWT_ACCESS_TOKEN_EXPIRY", "JWT_REFRESH_TOKEN_EXPIRY"],
    "# === GIT CONFIG ===": ["GIT_URI", "GIT_USERNAME", "GIT_PASSWORD"],
    "# === AUTH DB ===": ["AUTH_DB_URL", "AUTH_DB_USERNAME", "AUTH_DB_PASSWORD"],
    "# === DOCTOR DB ===": ["DOCTOR_DB_URL", "DOCTOR_DB_USERNAME", "DOCTOR_DB_PASSWORD"],
    "# === PATIENT DB ===": ["PATIENT_DB_URL", "PATIENT_DB_USERNAME", "PATIENT_DB_PASSWORD"],
    "# === APPOINTMENT DB ===": ["APPOINTMENT_DB_URL", "APPOINTMENT_DB_USERNAME", "APPOINTMENT_DB_PASSWORD"],
    "# === PAYMENT DB ===": ["PAYMENT_DB_URL", "PAYMENT_DB_USERNAME", "PAYMENT_DB_PASSWORD"],
    "# === MONGODB ===": ["NOTIFICATION_MONGODB_URI", "FEEDBACK_MONGODB_URI"],
    "# === REDIS ===": ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "REDIS_HOST", "REDIS_PORT",
                        "REDIS_PASSWORD"],
    "# === RABBITMQ ===": ["RABBITMQ_HOST", "RABBITMQ_PORT", "RABBITMQ_USERNAME", "RABBITMQ_PASSWORD"],
    "# === EUREKA ===": ["EUREKA_DEFAULT_ZONE", "EUREKA_HOSTNAME"],
}


def encrypt_value(value):
    result = subprocess.run(
        ["curl", "-s", "-X", "POST", f"{CONFIG_SERVER_URL}/encrypt", "-d", value],
        capture_output=True, text=True
    )
    encrypted = result.stdout.strip()
    if not encrypted:
        raise Exception(f"Encryption failed. Is config server running at {CONFIG_SERVER_URL}?")
    return encrypted


def parse_env(file_path):
    props = {}
    with open(file_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                props[key.strip()] = value.strip().strip('"')
    return props


def to_yaml_key(env_key):
    return env_key.lower().replace("_", ".")


def main():
    print("Reading .env file...")
    props = parse_env(ENV_FILE)
    output_lines = []

    for group_label, keys in SERVICE_GROUPS.items():
        output_lines.append(f"\n{group_label}")
        for key in keys:
            if key not in props:
                continue
            value = props[key]
            yaml_key = to_yaml_key(key)

            if key in PLAIN_KEYS:
                output_lines.append(f"{yaml_key}: {value}")
                print(f"  [PLAIN]     {key}")
            else:
                try:
                    encrypted = encrypt_value(value)
                    output_lines.append(f"{yaml_key}: '{{cipher}}{encrypted}'")
                    print(f"  [ENCRYPTED] {key}")
                except Exception as e:
                    print(f"  [ERROR]     {key} -> {e}")
                    output_lines.append(f"# ERROR encrypting {key}")

    with open(OUTPUT_FILE, "w") as f:
        f.write("\n".join(output_lines))

    print(f"\nDone! Output written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
