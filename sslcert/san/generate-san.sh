#!/bin/bash -x
# @link http://techbrahmana.blogspot.co.uk/2013/10/creating-wildcard-self-signed.html

# NOTE: Copies of liatandco.san.key/liatandco.san.crt have been copied to /puppet/modules/sslcerts/files

cd    "$(dirname "$0")"

# Set Params
Country=GB
State=London
City=London
Organization="Crystalline Technologies"
Section=""
FQDN=liatandco.com
Email=james.mcguigan@gmail.com


## Generate Private Key
openssl genrsa -des3 -passout pass:foobar -out liatandco.san.key.password 2048

##  Convert the private key to an unencrypted format
openssl rsa -passin pass:foobar -in liatandco.san.key.password -out liatandco.san.key

##  Create the certificate signing request
openssl req -new -key liatandco.san.key -out liatandco.san.csr <<EOF
$Country
$State
$City
$Organization
$Section
$FQDN
$Email
.
.
EOF

## Sign the certificate with extensions
openssl x509 -req -extensions v3_req -days 365 -in liatandco.san.csr -signkey liatandco.san.key -out liatandco.san.crt -extfile liatandco.san.conf
#    -CA ../rootCA/liatandco.com.rootCA.crt -CAkey ../rootCA/liatandco.com.rootCA.key -CAcreateserial

#
#openssl genrsa             -out liatandco.san.key 2048
#openssl req    -new -nodes -out liatandco.san.csr -config liatandco.san.conf
#openssl x509   -req -CA ../rootCA/liatandco.com.rootCA.pem -CAkey ../rootCA/liatandco.com.rootCA.key -CAcreateserial -in liatandco.san.csr -out liatandco.san.crt -days 3650
##end

exit 0