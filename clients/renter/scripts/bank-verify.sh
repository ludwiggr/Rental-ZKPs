#!/bin/bash

# Generate keys for bank (issuer)
echo "Generating bank keys..."
heimdalljs key new issuer > bank_sk.txt
heimdalljs key pub < bank_sk.txt > bank_pk.json

# Generate keys for renter (holder)
echo "Generating renter keys..."
heimdalljs key new holder > renter_sk.txt
heimdalljs key pub < renter_sk.txt > renter_pk.json

# Create credit attributes file
echo "Creating credit attributes..."
cat <<EOM > credit_attributes.json
[
    "$1",  # Bank ID
    "$2",  # Credit Score
    "$3",  # Credit History (years)
    "$4",  # Income
    "$5",  # Last Updated
    "$6",  # Account Status
    "$7",  # Debt Ratio
    "$8"   # Payment History
]
EOM

# Create credential
echo "Creating credit credential..."
heimdalljs cred new \
    --attributes credit_attributes.json \
    --id "CREDIT-$(date +%s)" \
    --publicKey renter_pk.json \
    --expiration 365 \
    --type CreditReport \
    --delegatable 0 \
    --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
    --secretKey bank_sk.txt \
    --destination credit_credential.json

# Generate presentation
echo "Generating credit proof presentation..."
heimdalljs pres attribute 1 \
    --expiration 100 \
    --challenge "$(date +%s)" \
    --credential credit_credential.json \
    --destination credit_presentation.json \
    --secretKey renter_sk.txt \
    --issuerPK

echo "Credit verification complete. Proof saved in credit_presentation.json" 