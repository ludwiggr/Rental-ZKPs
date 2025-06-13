#!/bin/bash

# Generate keys for employer (issuer)
echo "Generating employer keys..."
heimdalljs key new issuer > employer_sk.txt
heimdalljs key pub < employer_sk.txt > employer_pk.json

# Generate keys for renter (holder)
echo "Generating renter keys..."
heimdalljs key new holder > renter_sk.txt
heimdalljs key pub < renter_sk.txt > renter_pk.json

# Create income attributes file
echo "Creating income attributes..."
cat <<EOM > income_attributes.json
[
    "$1",  # Employer ID
    "$2",  # Employee Name
    "$3",  # Position
    "$4",  # Monthly Income
    "$5",  # Employment Start Date
    "$6",  # Employment Type
    "$7",  # Department
    "$8"   # Last Updated
]
EOM

# Create credential
echo "Creating income credential..."
heimdalljs cred new \
    --attributes income_attributes.json \
    --id "INCOME-$(date +%s)" \
    --publicKey renter_pk.json \
    --expiration 365 \
    --type IncomeVerification \
    --delegatable 0 \
    --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
    --secretKey employer_sk.txt \
    --destination income_credential.json

# Generate presentation
echo "Generating income proof presentation..."
heimdalljs pres attribute 3 \
    --expiration 100 \
    --challenge "$(date +%s)" \
    --credential income_credential.json \
    --destination income_presentation.json \
    --secretKey renter_sk.txt \
    --issuerPK

echo "Income verification complete. Proof saved in income_presentation.json" 