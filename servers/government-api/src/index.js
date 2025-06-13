"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var heimdalljs_1 = require("heimdalljs");
var app = (0, express_1["default"])();
app.use((0, cors_1["default"])());
app.use(express_1["default"].json());
var PORT = process.env.PORT || 4004;
// Mock database of property records
var propertyRecords = new Map();
// Initialize Heimdall
var heimdall = new heimdalljs_1.Heimdall();
// Create property ownership verification circuit
var propertyCircuit = await heimdalljs_1.Heimdall.createCircuit('property');
// Endpoint to verify and issue property ownership proof
app.post('/api/verify-property', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, propertyAddress, city, propertyType, governmentId, verificationId, _b, proof, publicInputs, response, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, propertyAddress = _a.propertyAddress, city = _a.city, propertyType = _a.propertyType, governmentId = _a.governmentId;
                // Store property record (in real app, this would be in a database)
                propertyRecords.set(governmentId, {
                    address: propertyAddress,
                    city: city,
                    propertyType: propertyType
                });
                verificationId = "GOV-".concat(Date.now());
                return [4 /*yield*/, propertyCircuit.prove({
                        privateInputs: {
                            propertyAddress: propertyAddress
                        },
                        publicInputs: {
                            city: city,
                            propertyType: propertyType,
                            governmentVerificationId: verificationId
                        }
                    })];
            case 1:
                _b = _c.sent(), proof = _b.proof, publicInputs = _b.publicInputs;
                response = {
                    success: true,
                    message: 'Property proof verified successfully',
                    data: {
                        verificationId: verificationId,
                        timestamp: new Date().toISOString(),
                        signature: 'signature',
                        proof: proof,
                        publicInputs: publicInputs
                    }
                };
                res.json(response);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                res.status(500).json({
                    success: false,
                    error: 'Failed to verify property ownership'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Endpoint to verify a property ownership proof
app.post('/api/verify-proof', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, proof, publicInputs, isValid, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, proof = _a.proof, publicInputs = _a.publicInputs;
                return [4 /*yield*/, propertyCircuit.verify(proof, publicInputs)];
            case 1:
                isValid = _b.sent();
                res.json({
                    success: true,
                    isValid: isValid,
                    message: isValid ? 'Proof is valid' : 'Proof is invalid'
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: 'Failed to verify proof'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("Government API server running on port ".concat(PORT));
});
