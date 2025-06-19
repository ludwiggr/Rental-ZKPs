#!/bin/bash

# Read the proof from stdin
read -r proof

# Save the proof to a temporary file
echo "$proof" > temp_proof.json

# Verify the proof using heimdalljs
result=$(heimdalljs verify temp_proof.json)

# Clean up
rm temp_proof.json

# Return the result
if [[ $result == *"true"* ]]; then
  echo '{"success": true}'
else
  echo '{"success": false, "error": "Proof verification failed"}'
fi 