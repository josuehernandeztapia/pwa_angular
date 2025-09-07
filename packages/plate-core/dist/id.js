"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVehicleId = generateVehicleId;
const crypto_1 = require("crypto");
const normalize_1 = require("./normalize");
function generateVehicleId(input) {
    const normalizedVin = (0, normalize_1.normalizeVin)(input.vin);
    const normalizedPlate = (0, normalize_1.normalizePlate)(input.plate);
    const payload = `${normalizedVin}:${normalizedPlate}`;
    const hash = (0, crypto_1.createHash)("sha256").update(payload, "utf8").digest("hex");
    return {
        id: `sha256:${hash}`,
        normalizedVin,
        normalizedPlate,
    };
}
//# sourceMappingURL=id.js.map