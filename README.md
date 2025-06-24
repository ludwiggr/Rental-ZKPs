# Rental-ZKPs: Zero-Knowledge Proofs for Rental Applications

A comprehensive system that enables privacy-preserving rental applications using zero-knowledge proofs (ZKPs). This project allows users to prove their income meets rental requirements without revealing the actual income amount, leveraging the Heimdall credential system.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Rental-ZKPs
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start all services:**
   ```bash
   npm run dev
   ```

This will start all services concurrently:
- **Renter Client** - http://localhost:3000
- **Landlord Client** - http://localhost:3001  
- **Bank API** - http://localhost:3002
- **Employer API** - http://localhost:3003
- **Landlord API** - http://localhost:3004

## 📁 Project Structure

```
Rental-ZKPs/
├── clients/                     # Frontend applications
│   ├── landlord/               # Landlord dashboard (port 3001)
│   ├── login/                  # Authentication service
│   └── renter/                 # Renter application (port 3000)
├── heimdall/                   # Zero-knowledge proof system
│   ├── circom/                 # Circuit definitions
│   └── heimdalljs/             # JavaScript implementation
├── servers/                    # Backend APIs
│   ├── backend/                # Main backend service
│   ├── bank-api/               # Bank verification API (port 3002)
│   ├── employer-api/           # Employer verification API (port 3003)
│   └── landlord-api/           # Landlord management API (port 3004)
├── shared/                     # Shared utilities and types
└── nginx/                      # Reverse proxy configuration
```

## 🛠️ Available Scripts

### Development Scripts
```bash
# Run all services concurrently
npm run dev

# Run individual services
npm run dev:employer-api      # Employer API (port 3003)
npm run dev:bank-api          # Bank API (port 3002)
npm run dev:landlord-api      # Landlord API (port 3004)
npm run dev:renter-client     # Renter client (port 3000)
npm run dev:landlord-client   # Landlord client (port 3001)
```

### Build Scripts
```bash
# Build all workspaces
npm run build:all

# Build specific components
npm run build:apis            # All APIs
npm run build:clients         # All clients
```

### Utility Scripts
```bash
# Install all dependencies
npm run install:all
```

## 🔐 Core Features

### Privacy-Preserving Income Verification
- **Zero-Knowledge Proofs**: Prove income meets requirements without revealing the amount
- **Attribute-Based Credentials**: Based on Heimdall's credential system
- **Secure Verification**: Cryptographic proofs ensure authenticity

### Multi-Party System
- **Renter**: Submit income verification requests
- **Employer**: Issue income credentials
- **Bank**: Verify financial status
- **Landlord**: Verify rental eligibility

### RESTful APIs
- **Employer API**: Income credential issuance
- **Bank API**: Financial verification
- **Landlord API**: Rental application processing

## 🔧 API Reference

### Employer API (Port 3003)

#### POST /verify-income
Generate a zero-knowledge proof for income verification.

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

### Bank API (Port 3002)
Financial verification endpoints for credit checks and account validation.

### Landlord API (Port 3004)
Rental application processing and verification endpoints.

## 🏗️ Technical Architecture

### Zero-Knowledge Proof System

The system uses **Groth16 zk-SNARKs** with the **Poseidon hash function** for efficient zero-knowledge proofs.

#### Credential Structure
Each credential contains 16 attributes (power of 2 for Merkle tree compatibility):

```
Meta Attributes (8):
[0] ID (e.g., "12345")
[1] Type (e.g., "Income")
[2] Holder public key [0]
[3] Holder public key [1]
[4] Revocation registry URL
[5] Expiration timestamp
[6] Delegatable flag
[7] Empty string

User Attributes (8):
[8]  Income value (e.g., "2500") ← Target for ZKP
[9]  First name (e.g., "John")
[10] Last name (e.g., "Jones")
[11] Status (e.g., "No Debt")
[12] Status2 (e.g., "Rich")
[13] Empty (padding)
[14] Empty (padding)
[15] Empty (padding)
```

#### System Constraints
- **Maximum credential ID**: 2,064,384 (2^13 × 252)
- **Revocation tree size**: 8,192 leaves (2^13)
- **Leaf size**: 252 bits per leaf
- **Merkle tree input**: Must be power of 2

### File Management
All generated files are stored in `servers/employer-api/temp/`:
- `employer_attr_issuer.json` - Input attributes
- `employer_cred_holder.json` - Generated credential
- `employer_holder_pk.json` - Holder public key
- `employer_holder_sk.txt` - Holder secret key
- `employer_issuer_pk.json` - Issuer public key
- `employer_issuer_sk.txt` - Issuer secret key
- `employer_pres_attribute.json` - Generated presentation

## 🧪 Testing

### Manual Testing

1. **Start all services:**
   ```bash
   npm run dev
   ```

2. **Test income verification:**
   ```bash
   curl -X POST http://localhost:3003/verify-income \
     -H "Content-Type: application/json" \
     -d '{"income": "2500", "employerId": "42"}'
   ```

3. **Access applications:**
   - Renter Client: http://localhost:3000
   - Landlord Client: http://localhost:3001

### Verify Generated Files
Check the `servers/employer-api/temp/` directory for generated proof files after successful verification.

## 🐛 Troubleshooting

### Common Issues

#### 1. "No valid in index" Error
**Cause**: Credential ID exceeds revocation tree limits
**Solution**: Ensure credential ID is less than 2,064,384

#### 2. "Length of input must be pow of two" Error
**Cause**: Attribute array doesn't result in power-of-2 total
**Solution**: Pad user attributes to ensure total count is 16 (or other power of 2)

#### 3. "Proof file was not generated" Error
**Cause**: Incorrect file paths in CLI commands
**Solution**: Ensure all files are generated in `/temp` directory

#### 4. Port Conflicts
**Cause**: Services trying to use same port
**Solution**: Check that no other services are running on ports 3000-3004

### Debug Mode
To enable debug logging, add console.log statements:

```javascript
// In heimdalljs-pres-attribute.js
console.log("Credential attributes:", credential.attributes);

// In attribute.js
console.log("Merkle tree input:", cred.attributes);

// In merkleTree.js
console.log("MerkleTree input length:", input.length);
```

### Logs and Monitoring
- Check individual service logs in their respective directories
- Monitor file generation in `servers/employer-api/temp/`
- Verify API responses with curl or Postman

## 🔒 Security Considerations

### Privacy Features
- **Zero-knowledge proofs** ensure income amount is never revealed
- **Cryptographic credentials** prevent forgery
- **Revocation support** for compromised credentials

### Best Practices
- Store sensitive keys securely
- Use HTTPS in production
- Implement proper authentication
- Regular credential rotation

## 🚀 Deployment

### Production Setup
1. Build all services: `npm run build:all`
2. Configure environment variables
3. Set up reverse proxy (nginx)
4. Deploy to your hosting platform

### Environment Variables
Create `.env` files in each service directory with appropriate configuration.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all services start correctly

## 📚 Additional Resources

### Documentation
- [Heimdall Credential System](https://github.com/applied-crypto/heimdall)
- [Zero-Knowledge Proofs](https://z.cash/technology/zksnarks/)
- [Groth16 Protocol](https://eprint.iacr.org/2016/260.pdf)

### Related Technologies
- **Circom**: Circuit compiler for zk-SNARKs
- **SnarkJS**: JavaScript implementation of zk-SNARKs
- **Poseidon**: Hash function optimized for zero-knowledge proofs

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- **Heimdall Team**: For the credential system foundation
- **Applied Crypto Group**: For zero-knowledge proof implementations
- **Zcash Foundation**: For zk-SNARK research and development

---

**Need help?** Open an issue or check the troubleshooting section above.
