#!/bin/bash

CHALLENGE=1234

echo "Generate keys for bank"
heimdalljs key new bank_issuer > bank_issuer_sk.txt
heimdalljs key pub < bank_issuer_sk.txt > bank_issuer_pk.json
heimdalljs key new bank_holder > bank_holder_sk.txt
heimdalljs key pub < bank_holder_sk.txt > bank_holder_pk.json

echo "Writing financial attributes for the credential"
cat <<EOM >$(pwd)/bank_attr_issuer.json
[
    "John",
    "Jones",
    "50000",
    "750",
    "3",
    "2024-01-01",
    "2024-12-31",
    "123456789"
]
EOM

echo "Creating financial credential"
heimdalljs cred new \
  --attributes bank_attr_issuer.json \
  --id 1234502 \
  --publicKey bank_holder_pk.json \
  --expiration 365 \
  --type BankStatement \
  --delegatable 0 \
  --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
  --secretKey bank_issuer_sk.txt \
  --destination bank_cred_holder.json

echo "Generate the presentation of the financial attribute"
heimdalljs pres attribute 2 \
  --expiration 100 \
  --challenge $CHALLENGE \
  --credential bank_cred_holder.json \
  --destination bank_pres_attribute.json \
  --secretKey bank_holder_sk.txt \
  --issuerPK

echo "Verify the financial attribute presentation"
heimdalljs verify bank_pres_attribute.json 