@echo off
echo Generating SSL certificates for Nginx...

REM Create certs directory if it doesn't exist
if not exist nginx\certs mkdir nginx\certs

REM Create a temporary OpenSSL config file
echo [req] > openssl.cnf
echo distinguished_name = req_distinguished_name >> openssl.cnf
echo x509_extensions = v3_req >> openssl.cnf
echo prompt = no >> openssl.cnf
echo [req_distinguished_name] >> openssl.cnf
echo C = US >> openssl.cnf
echo ST = State >> openssl.cnf
echo L = City >> openssl.cnf
echo O = Organization >> openssl.cnf
echo CN = localhost >> openssl.cnf
echo [v3_req] >> openssl.cnf
echo subjectAltName = @alt_names >> openssl.cnf
echo [alt_names] >> openssl.cnf
echo DNS.1 = localhost >> openssl.cnf
echo DNS.2 = tradeforge.apextradelogic.com >> openssl.cnf

REM Generate self-signed certificates using the temporary config file
openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
  -keyout nginx\certs\nginx-selfsigned.key ^
  -out nginx\certs\nginx-selfsigned.crt ^
  -config openssl.cnf

REM Clean up the temporary config file
del openssl.cnf

echo.
echo SSL certificates have been generated in the nginx\certs directory.
echo Certificate: nginx\certs\nginx-selfsigned.crt
echo Private Key: nginx\certs\nginx-selfsigned.key
echo. 