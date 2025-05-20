# Rental-ZKPs

A zero-knowledge proof system for rental applications, allowing secure verification of income, credit scores, and property ownership without revealing sensitive information.

## Prerequisites

- Node.js v16.20.2 or later
- heimdalljs command-line tool installed and available in PATH
- MongoDB 7.8.7 or later

## Project Structure

```
.
├── clients/
│   ├── renter/          # Renter client application
│   └── landlord/        # Landlord client application
├── servers/
│   ├── employer-api/    # Employer verification API
│   ├── bank-api/        # Bank verification API
│   └── government-api/  # Government property verification API
└── shared/
    └── role-scripts/    # heimdalljs scripts for each role
```

## Zero-Knowledge Proof Flows

### 1. Income Verification Flow
1. Renter requests income proof from employer
2. Employer generates proof using `employer-verify.sh`
3. Renter verifies proof using `verify-proof.sh`
4. Renter sends proof to landlord
5. Landlord verifies proof using `verify-proof.sh`

### 2. Credit Check Flow
1. Renter requests credit proof from bank
2. Bank generates proof using `bank-verify.sh`
3. Renter verifies proof using `verify-proof.sh`
4. Renter sends proof to landlord
5. Landlord verifies proof using `verify-proof.sh`

### 3. Property Ownership Flow
1. Landlord requests property proof from government
2. Government generates proof using `government-verify.sh`
3. Landlord verifies proof using `verify-proof.sh`
4. Landlord sends proof to renter
5. Renter verifies proof using `verify-proof.sh`

## Role Scripts

The `shared/role-scripts/` directory contains the following heimdalljs scripts:

- `employer-verify.sh`: Generates income verification proofs
- `bank-verify.sh`: Generates credit score verification proofs
- `government-verify.sh`: Generates property ownership proofs
- `verify-proof.sh`: Verifies any type of proof

Each script follows the heimdalljs command-line pattern:
1. Generate keys for issuer and holder
2. Create credential attributes
3. Generate credential
4. Create proof presentation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Rental-ZKPs.git
cd Rental-ZKPs
```

2. Install dependencies for each component:
```bash
# Install client dependencies
cd clients/renter && npm install
cd ../landlord && npm install

# Install server dependencies
cd ../../servers/employer-api && npm install
cd ../bank-api && npm install
cd ../government-api && npm install
```

3. Make the role scripts executable:
```bash
chmod +x shared/role-scripts/*.sh
```

## Running the Application

1. Start the server APIs:
```bash
# Start employer API
cd servers/employer-api && npm start

# Start bank API
cd ../bank-api && npm start

# Start government API
cd ../government-api && npm start
```

2. Start the client applications:
```bash
# Start renter client
cd clients/renter && npm start

# Start landlord client
cd ../landlord && npm start
```

## Development

### Adding New Proof Types

To add a new type of proof:

1. Create a new script in `shared/role-scripts/` following the pattern of existing scripts
2. Update the client services to use the new script
3. Add appropriate UI components in the client applications

### Testing

Each component has its own test suite. Run tests using:

```bash
npm test
```

## Security Considerations

- All proofs are generated using heimdalljs command-line tool
- Private keys are stored securely and never exposed
- Proofs are verified locally before being shared
- All sensitive data is kept private and only proven, never revealed

## License

MIT
