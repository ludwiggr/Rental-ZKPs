# Rental-ZKPs Documentation

## 1. Project Overview

Rental-ZKPs is a platform for privacy-preserving rental processes using Zero-Knowledge Proofs (ZKPs). It enables
landlords and renters to verify sensitive information (e.g., income, employment) without revealing underlying data. The
system leverages ZKP circuits, a modular backend, and multiple client applications.

## 2. Technology Stack

- **Languages:** JavaScript, Node.js
- **Frontend:** React (for landlord, renter, and login clients)
- **Backend:** Node.js/Express
- **ZKP Circuits:** Circom
- **Containerization:** Docker, Docker Compose
- **Other:** Nginx (reverse proxy), Shell scripts

## 3. Project Structure

- `clients/` – Frontend clients for landlord, renter, and login
- `servers/` – Backend services (main backend, bank API)
- `heimdall/` – ZKP circuits, scripts, and related logic
- `heimdalljs/` – JavaScript library for ZKP operations
- `nginx/` – Nginx configuration
- `docker-compose.yml` – Multi-service orchestration

## 4. Installation & Setup

### 4.1. Prerequisites

- Docker & Docker Compose
- Node.js (for local development)

### 4.2. Setup

- Build and start all services using Docker compose:
   ```sh
   docker-compose up --build
   ```
- Access the landlord, renter, and login clients in your browser
    - URL for registration: http://login.localhost/login
    - URL for login: http://login.localhost/register

## 5. Architecture

The Rental-ZKPs platform is composed of several services, each running in its own Docker container and orchestrated via
Docker Compose. The architecture is modular, separating frontend clients, backend APIs, and infrastructure components.
The bank API simulates a financial institution for income verification and is therefor not really part of the project
and therefor seperated from the main backend API and the main Database.
Below is an overview of the main services and their interactions:

### 5.1. Overview of Services

#### 5.1.1. ZKP Project

##### Landlord Client (`clients/landlord`):

- React frontend for landlords to manage rental applications and verify proofs.
- Communicates with the backend API for data and proof verification.

##### Renter Client (`clients/renter`):

- React frontend for renters to submit applications and present proofs.
- Interacts with the backend API for submitting data and proofs.

##### Login Client (`clients/login`):

- React frontend for user registration and authentication.
- Interfaces with the backend for user management.

##### Backend API (`servers/backend`):

- Node.js/Express service providing the main REST API for the platform.
- Handles user management, rental applications, proof requests, and verification.
- Interacts with the database and the ZKP logic (heimdall).

#### 5.1.2. Bank System

##### Bank API (`servers/bank-api`):

- Node.js/Express service simulating a bank for income verification.
- Provides endpoints for proof of income and interacts with the backend.

#### 5.1.3. Others

#### Nginx (`nginx/`):

- Acts as a reverse proxy, routing traffic to the appropriate frontend and backend services.

#### [Heimdall] (`heimdall/`):

- Not an individual service. The heimdall repo is installed and used in the bank API and backend services.
- Contains ZKP circuits (Circom), scripts, and logic for proof generation and verification.
- Used by the backend to generate and verify proofs.

### 5.2. Service Interactions

- Clients communicate with the backend API and the bank API via REST endpoints.
- The backend API and the Bank API call Heimdall scripts or uses HeimdallJS for ZKP operations.
- Nginx routes HTTP(S) requests to the correct client or API service based on the URL.

### 5.3. Endpoints

#### 5.3.1 Backend API Endpoints

Below are the main REST API endpoints exposed by the backend service ([see routes folder](servers/backend/routes)).

| Method | Endpoint                 | Description                              | Defined in file        |
|--------|--------------------------|------------------------------------------|------------------------|
| POST   | /api/register            | Register a new user                      | routes/register.js     |
| POST   | /api/login               | Authenticate a user                      | routes/login.js        |
| POST   | /api/applications/verify | Verify application proofs                | routes/applications.js |
| GET    | /api/listings            | List all listings (optionally mine only) | routes/listings.js     |
| POST   | /api/listings            | Create a new listing                     | routes/listings.js     |
| GET    | /api/listings/:id        | Get details for a specific listing       | routes/listings.js     |
| DELETE | /api/listings/:id        | Delete a listing by ID                   | routes/listings.js     |
| POST   | /api/listings/:id/apply  | Apply to a listing                       | routes/listings.js     |

#### 5.3.2 Bank API Endpoints

Below are the main REST API endpoints exposed by the bank service. Is acts as a separate system and therefor has its own
user database. For the definition of the endpoints refer to: [routes folder](servers/bank-api/routes).

| Method | Endpoint             | Description                                       | Defined in file |
|--------|----------------------|---------------------------------------------------|-----------------|
| POST   | /user                | Create a user with random income and credit score | routes/user.js  |
| POST   | /proof/generateProof | Generate a ZKP proof for income or credit score   | routes/proof.js |

### 5.4. Databases

#### 5.4.1. Backend Database

The backend database uses MongoDB. All schemas are defined using Mongoose in [
`servers/backend/models`](servers/backend/models). The following main collections and fields are defined:

| Collection   | Field                  | Type / Description                                                 | Required | Description                                                        |
|--------------|------------------------|--------------------------------------------------------------------|----------|--------------------------------------------------------------------|
| users        | username               | String                                                             | Yes      | Username of the user                                               |
|              | email                  | String, unique                                                     | Yes      | Email address (unique)                                             |
|              | password               | String                                                             | Yes      | Hashed password                                                    |
| listings     | name                   | String                                                             | Yes      | Name of the listing                                                |
|              | address                | String                                                             | Yes      | Address of the property                                            |
|              | size                   | String                                                             | Yes      | Size of the property                                               |
|              | createdAt              | Date, default: Date.now                                            | No       | Creation date                                                      |
|              | createdBy              | ObjectId, ref: User                                                | Yes      | Reference to the creator (User)                                    |
|              | applications           | [ObjectId], ref: Application                                       | No       | Applications for this listing                                      |
|              | price                  | Number                                                             | Yes      | Price of the listing                                               |
|              | type                   | String, enum: flat/house/studio/apartment                          | Yes      | Type of property                                                   |
|              | incomeRequirement      | Number                                                             | No       | Minimum required income, undefined when no proof is required       |
|              | creditScoreRequirement | Number                                                             | No       | Minimum required credit score, undefined when no proof is required |
| applications | userId                 | ObjectId, ref: User                                                | Yes      | Reference to the applicant (User)                                  |
|              | status                 | String, enum: pending/verified/approved/rejected, default: pending | No       | Application status                                                 |
|              | incomeProof            | Object, default: {{}}                                              | No       | ZKP proof of income                                                |
|              | creditScoreProof       | Object, default: {{}}                                              | No       | ZKP proof of credit score                                          |
|              | createdAt/updatedAt    | Date, managed by timestamps option                                 | No       | Creation and update timestamps                                     |

#### 5.4.2. Bank Database

The bank database uses MongoDB and stores the following collection and fields (see `servers/bank-api/models/User.js`):

| Collection | Field       | Type / Description      | Required | Description            |
|------------|-------------|-------------------------|----------|------------------------|
| users      | id          | String, unique, indexed | Yes      | Unique user identifier |
|            | income      | Number                  | Yes      | User's income          |
|            | creditScore | Number                  | Yes      | User's credit score    |

- All schemas are defined using Mongoose in `servers/bank-api/models/`.
- Each user in the bank system has a unique id, an income, and a credit score.
- All private information of the users is separated from the main backend database and is only used for proof
  generation.
- User's income and credit scores are randomly generated when a user is created in the bank system.

For details, see the schema definition in the file:

- [`models/User.js`](servers/bank-api/models/User.js)

## 9. License & Contributors

- See `LICENSE` for license details
- For contributions, open issues or pull requests on GitHub
