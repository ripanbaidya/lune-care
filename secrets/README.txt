## Steps to Generate RSA Key Pair

=> Make sure you are in the root directory of the project.
=> Create a folder named `secrets` in the root directory and navigate to it.
   and create another folder named `keys` inside it.

```
mkdir secrets
cd secrets
mkdir keys
```

=> Make sure you have `openssl` installed on your machine, now follw the steps below.

1. Generate RSA Private Key (PKCS#1 format)

```
openssl genrsa -out private_key.pem 2048
```

2. Convert Private Key to PKCS#8 format

```
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private_key.pem -out private_key_pkcs8.pem
```

3. Extract Public Key from Private Key

```
openssl rsa -in private_key.pem -pubout -out public_key.pem
```
