#!/bin/bash

CHALLENGE=1234

echo "Generate keys for renter"
heimdalljs key new renter_issuer > renter_issuer_sk.txt
heimdalljs key pub < renter_issuer_sk.txt > renter_issuer_pk.json
heimdalljs key new renter_holder > renter_holder_sk.txt
heimdalljs key pub < renter_holder_sk.txt > renter_holder_pk.json

echo "Writing renter attributes for the credential"
cat <<EOM >$(pwd)/renter_attr_issuer.json
[
    "John",
    "Jones",
    "2020-01-01",
    "2023-12-31",
    "456 Oak St",
    "Apt 789",
    "Chicago",
    "IL",
    "60601",
    "no_damages",
    "paid_on_time"
]
EOM

echo "Creating renter credential"
heimdalljs cred new \
  --attributes renter_attr_issuer.json \
  --id 1234505 \
  --publicKey renter_holder_pk.json \
  --expiration 365 \
  --type RentalHistory \
  --delegatable 0 \
  --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
  --secretKey renter_issuer_sk.txt \
  --destination renter_cred_holder.json

echo "Generate the presentation of the renter attribute"
heimdalljs pres attribute 2 \
  --expiration 100 \
  --challenge $CHALLENGE \
  --credential renter_cred_holder.json \
  --destination renter_pres_attribute.json \
  --secretKey renter_holder_sk.txt \
  --issuerPK

echo "Verify the renter attribute presentation"
heimdalljs verify renter_pres_attribute.json 