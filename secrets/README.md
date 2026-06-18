<h2><p align="center">Generate RSA Key Pair</p></h2>

Before generating the keys, make sure you are in the root directory of the project.

Create the required folders:

```bash
mkdir -p secrets/keys
cd secrets/keys
```

Make sure **OpenSSL** is installed on your machine.

1. Generate the RSA private key:

   ```bash
   openssl genrsa -out private_key.pem 2048
   ```

2. Generate the public key from the private key:

   ```bash
   openssl rsa -in private_key.pem -pubout -out public_key.pem
   ```

After running the commands, the `secrets/keys` folder will contain:

```text
secrets/
|-- keys/
    |-- private_key.pem
    |-- public_key.pem
```

Keep the `private_key.pem` file secure and do not commit it to version control.

The `public_key.pem` file can be shared with services that need to verify tokens or signatures generated using the private key.
