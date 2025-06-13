/**
 * @typedef {Object} RentalProof
 * @property {any} proof
 * @property {any} publicInputs
 * @property {string} renterId
 * @property {string} timestamp
 */

/**
 * @typedef {Object} LandlordProof
 * @property {any} proof
 * @property {any} publicInputs
 * @property {string} landlordId
 * @property {string} propertyId
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ProofRequest
 * @property {'landlord'|'rental'} type
 * @property {Object} criteria
 * @property {number} [criteria.minPropertyValue]
 * @property {number} [criteria.minIncome]
 * @property {number} [criteria.minCreditScore]
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ProofResponse
 * @property {boolean} success
 * @property {Object} [data]
 * @property {string} [data.verificationId]
 * @property {string} [data.timestamp]
 * @property {string} [data.signature]
 * @property {any} [data.proof]
 * @property {any} [data.publicInputs]
 * @property {string} [error]
 */

export {}; 