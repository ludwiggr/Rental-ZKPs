#!/bin/bash

# Generate keys for government (issuer)
echo "Generating government keys..."
heimdalljs key new issuer > government_sk.txt
heimdalljs key pub < government_sk.txt > government_pk.json

# Generate keys for landlord (holder)
echo "Generating landlord keys..."
heimdalljs key new holder > landlord_sk.txt
heimdalljs key pub < landlord_sk.txt > landlord_pk.json

# Create property attributes file
echo "Creating property attributes..."
cat <<EOM > property_attributes.json
[
    "$1",  # Government ID
    "$2",  # Property Address
    "$3",  # Owner Name
    "$4",  # Property Type
    "$5",  # Purchase Date
    "$6",  # Property Value
    "$7",  # Tax Status
    "$8"   # Last Updated
]
EOM

# Create credential
echo "Creating property ownership credential..."
heimdalljs cred new \
    --attributes property_attributes.json \
    --id "PROPERTY-$(date +%s)" \
    --publicKey landlord_pk.json \
    --expiration 365 \
    --type PropertyOwnership \
    --delegatable 0 \
    --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
    --secretKey government_sk.txt \
    --destination property_credential.json

# Generate presentation
echo "Generating property ownership proof presentation..."
heimdalljs pres attribute 1 \
    --expiration 100 \
    --challenge "$(date +%s)" \
    --credential property_credential.json \
    --destination property_presentation.json \
    --secretKey landlord_sk.txt \
    --issuerPK

echo "Property ownership verification complete. Proof saved in property_presentation.json" 