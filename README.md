# Rental-ZKPs: Zero-Knowledge Proofs for Rental Applications

This project implements zero-knowledge proofs (ZKPs) for rental applications using the Heimdall credential system. It allows users to prove their income meets certain criteria without revealing the actual income amount.

## Project Structure

```
Rental-ZKPs/
├── heimdall/                    # Heimdall credential system
│   └── heimdalljs/
│       └── heimdall/
│           ├── src/             # Source code
│           └── cli/             # Command-line tools
├── servers/
│   └── employer-api/            # Employer verification API
│       ├── src/
│       └── temp/                # Generated files
└── README.md
```

## Features

- **Income Verification**: Generate ZKPs to prove income meets rental requirements
- **Privacy-Preserving**: Income amount is never revealed, only that it meets criteria
- **Credential System**: Based on Heimdall's attribute-based credential system
- **REST API**: Simple HTTP API for income verification

## API Endpoints

### POST /verify-income

Verifies that a user's income meets the rental requirements.

**Request:**
```json
{
  "income": "2500",
  "employerId": "42"
}
```

**Response:**
```json
{
  "success": true,
  "proof": {
    "type": "attribute",
    "output": {
      "meta": {
        "type": "Income",
        "revoked": false,
        "delegatable": false
      },
      "content": {
        "attribute": "2500",
        "position": 8
      }
    },
    "proof": {
      "pi_a": [...],
      "pi_b": [...],
      "pi_c": [...]
    },
    "publicSignals": [...]
  }
}
```

## Heimdall System Modifications

### Overview

The Heimdall credential system was modified to support income verification use cases. Key changes include:

1. **Credential ID Management**: Fixed revocation tree index overflow issues
2. **Attribute Padding**: Ensured Merkle tree compatibility with power-of-2 requirements
3. **File Path Management**: Improved file generation and storage locations

### Technical Details

#### 1. Credential Structure

Heimdall credentials have the following structure:
- **Meta attributes (8)**: ID, type, public keys, registry, expiration, delegatable, empty
- **User attributes (8)**: Income, name, status, etc. (padded to ensure power-of-2 total)

```
Credential attributes (16 total):
[0]  ID (e.g., "12345")
[1]  Type (e.g., "Income")
[2]  Holder public key [0]
[3]  Holder public key [1]
[4]  Revocation registry URL
[5]  Expiration timestamp
[6]  Delegatable flag
[7]  Empty string
[8]  Income value (e.g., "2500") ← Target for ZKP
[9]  First name (e.g., "John")
[10] Last name (e.g., "Jones")
[11] Status (e.g., "No Debt")
[12] Status2 (e.g., "Rich")
[13] Empty (padding)
[14] Empty (padding)
[15] Empty (padding)
```

#### 2. Revocation Tree Constraints

- **Maximum credential ID**: `2^13 * 252 = 2,064,384`
- **Revocation tree size**: 8192 leaves (2^13)
- **Leaf size**: 252 bits per leaf

**Issue Fixed**: Original implementation used `Date.now()` for credential IDs, which exceeded the revocation tree limits.

**Solution**: Use smaller, sequential IDs (e.g., 12345) that fit within the revocation tree constraints.

#### 3. Merkle Tree Requirements

- **Input length**: Must be a power of 2
- **Supported sizes**: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, etc.

**Issue Fixed**: Original attribute arrays didn't result in power-of-2 totals.

**Solution**: Pad user attributes to ensure total count is a power of 2 (16 in this case).

#### 4. File Management

**Issue Fixed**: Files were being generated in incorrect locations.

**Solution**: 
- Use absolute paths in CLI commands
- Generate all files in `/temp` directory
- Ensure consistent file locations across the system

### Modified Files

#### `heimdall/heimdalljs/heimdall/cli/heimdalljs-pres-attribute.js`
- Removed debug logging
- Improved error handling

#### `heimdall/heimdalljs/heimdall/src/presentation/attribute.js`
- Removed debug logging
- Cleaned up AttributePresentation constructor

#### `heimdall/heimdalljs/heimdall/src/crypto/merkleTree.js`
- Removed debug logging
- Cleaned up MerkleTree constructor and generateProof method

#### `servers/employer-api/src/index.ts`
- Fixed credential ID generation (use 12345 instead of timestamp)
- Added attribute padding (8 elements instead of 5)
- Fixed file path construction
- Improved presentation generation script
- Removed debug logging

## Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Rental-ZKPs
```

2. Install dependencies:
```bash
<<<<<<< HEAD
# Install client dependencies
cd clients/renter && npm install
cd ../backend && npm install

# Install server dependencies
cd ../../servers/employer-api && npm install
cd ../bank-api && npm install
cd ../government-api && npm install
=======
cd servers/employer-api
npm install
>>>>>>> master
```

3. Start the API server:
```bash
npm start
```

The server will run on `http://localhost:3003`.

## Usage

<<<<<<< HEAD
# Start bank API
cd ../bank-api && npm start

# Start government API
cd ../government-api && npm start
```

2. Start the client applications:
```bash
# Start renter client
cd clients/renter && npm start

# Start backend client
cd ../backend && npm start
```

## Development

### Adding New Proof Types

To add a new type of proof:

1. Create a new script in `shared/role-scripts/` following the pattern of existing scripts
2. Update the client services to use the new script
3. Add appropriate UI components in the client applications

### Testing

Each component has its own test suite. Run tests using:
=======
### Generate Income Proof
>>>>>>> master

```bash
curl -X POST http://localhost:3003/verify-income \
  -H "Content-Type: application/json" \
  -d '{"income": "2500", "employerId": "42"}'
```

### Verify Generated Files

All generated files are stored in `servers/employer-api/temp/`:

- `employer_attr_issuer.json` - Input attributes
- `employer_cred_holder.json` - Generated credential
- `employer_holder_pk.json` - Holder public key
- `employer_holder_sk.txt` - Holder secret key
- `employer_issuer_pk.json` - Issuer public key
- `employer_issuer_sk.txt` - Issuer secret key
- `employer_pres_attribute.json` - Generated presentation

## Troubleshooting

### Common Issues

1. **"No valid in index" error**: 
   - Ensure credential ID is less than 2,064,384
   - Check that attributes array results in power-of-2 total

2. **"Length of input must be pow of two" error**:
   - Pad user attributes to ensure total count is 16 (or other power of 2)

3. **"Proof file was not generated" error**:
   - Check file paths in CLI commands
   - Ensure all files are generated in `/temp` directory

### Debug Mode

To enable debug logging, add console.log statements to the relevant files:

```javascript
// In heimdalljs-pres-attribute.js
console.log("Credential attributes:", credential.attributes);

// In attribute.js
console.log("Merkle tree input:", cred.attributes);

// In merkleTree.js
console.log("MerkleTree input length:", input.length);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]

## Acknowledgments

- Based on the Heimdall credential system
- Uses Poseidon hash function for zero-knowledge proofs
- Implements Groth16 zk-SNARK protocol
