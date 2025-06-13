#!/bin/bash

CHALLENGE=1234

echo "Generate keys for employer"
heimdalljs key new employer_issuer > employer_issuer_sk.txt
heimdalljs key pub < employer_issuer_sk.txt > employer_issuer_pk.json
heimdalljs key new employer_holder > employer_holder_sk.txt
heimdalljs key pub < employer_holder_sk.txt > employer_holder_pk.json

echo "Writing employment attributes for the credential"
cat <<EOM >$(pwd)/employer_attr_issuer.json
[
    "John",
    "Jones",
    "Software Engineer",
    "Tech Corp",
    "2020-01-01",
    "present",
    "60000",
    "full-time"
]
EOM

echo "Creating employment credential"
heimdalljs cred new \
  --attributes employer_attr_issuer.json \
  --id 1234503 \
  --publicKey employer_holder_pk.json \
  --expiration 365 \
  --type EmploymentVerification \
  --delegatable 0 \
  --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
  --secretKey employer_issuer_sk.txt \
  --destination employer_cred_holder.json

echo "Generate the presentation of the employment attribute"
heimdalljs pres attribute 2 \
  --expiration 100 \
  --challenge $CHALLENGE \
  --credential employer_cred_holder.json \
  --destination employer_pres_attribute.json \
  --secretKey employer_holder_sk.txt \
  --issuerPK

echo "Verify the employment attribute presentation"
heimdalljs verify employer_pres_attribute.json 