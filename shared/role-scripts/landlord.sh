#!/bin/bash

CHALLENGE=1234

echo "Generate keys for landlord"
heimdalljs key new landlord_issuer > landlord_issuer_sk.txt
heimdalljs key pub < landlord_issuer_sk.txt > landlord_issuer_pk.json
heimdalljs key new landlord_holder > landlord_holder_sk.txt
heimdalljs key pub < landlord_holder_sk.txt > landlord_holder_pk.json

echo "Writing landlord attributes for the credential"
cat <<EOM >$(pwd)/landlord_attr_issuer.json
[
    "John",
    "Jones",
    "789 Pine St",
    "Apt 101",
    "San Francisco",
    "CA",
    "94102",
    "2024-01-01",
    "2024-12-31",
    "2000",
    "property_verified"
]
EOM

echo "Creating landlord credential"
heimdalljs cred new \
  --attributes landlord_attr_issuer.json \
  --id 1234506 \
  --publicKey landlord_holder_pk.json \
  --expiration 365 \
  --type PropertyOwnership \
  --delegatable 0 \
  --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
  --secretKey landlord_issuer_sk.txt \
  --destination landlord_cred_holder.json

echo "Generate the presentation of the landlord attribute"
heimdalljs pres attribute 2 \
  --expiration 100 \
  --challenge $CHALLENGE \
  --credential landlord_cred_holder.json \
  --destination landlord_pres_attribute.json \
  --secretKey landlord_holder_sk.txt \
  --issuerPK

echo "Verify the landlord attribute presentation"
heimdalljs verify landlord_pres_attribute.json 