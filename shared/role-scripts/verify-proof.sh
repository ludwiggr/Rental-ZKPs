#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <proof_file>"
    echo "Example: $0 income_presentation.json"
    exit 1
fi

PROOF_FILE=$1

echo "Verifying proof from $PROOF_FILE..."
heimdalljs verify "$PROOF_FILE"

if [ $? -eq 0 ]; then
    echo "Proof is valid!"
else
    echo "Proof is invalid!"
fi 