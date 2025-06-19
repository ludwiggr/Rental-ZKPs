#!/bin/bash

CHALLENGE=1234

echo "Generate keys for government"
heimdalljs key new gov_issuer > gov_issuer_sk.txt
heimdalljs key pub < gov_issuer_sk.txt > gov_issuer_pk.json
heimdalljs key new gov_holder > gov_holder_sk.txt
heimdalljs key pub < gov_holder_sk.txt > gov_holder_pk.json

echo "Writing government attributes for the credential"
cat <<EOM >$(pwd)/gov_attr_issuer.json
[
    "John",
    "Jones",
    "1980-01-01",
    "123 Main St",
    "New York",
    "NY",
    "10001",
    "USA",
    "SSN123456789"
]
EOM

echo "Creating government credential"
heimdalljs cred new \
  --attributes gov_attr_issuer.json \
  --id 1234504 \
  --publicKey gov_holder_pk.json \
  --expiration 365 \
  --type GovernmentID \
  --delegatable 0 \
  --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
  --secretKey gov_issuer_sk.txt \
  --destination gov_cred_holder.json

echo "Generate the presentation of the government attribute"
heimdalljs pres attribute 2 \
  --expiration 100 \
  --challenge $CHALLENGE \
  --credential gov_cred_holder.json \
  --destination gov_pres_attribute.json \
  --secretKey gov_holder_sk.txt \
  --issuerPK

echo "Verify the government attribute presentation"
heimdalljs verify gov_pres_attribute.json 