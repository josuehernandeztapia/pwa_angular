"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRules = void 0;
const normalize_1 = require("./normalize");
function buildValidator(stateCode, pattern, reserved) {
    return {
        stateCode,
        pattern,
        reserved,
        normalize: normalize_1.normalizePlate,
        validate: (plateRaw) => {
            const normalized = (0, normalize_1.normalizePlate)(plateRaw);
            const reasons = [];
            const warnings = [];
            if (normalized.length === 0) {
                reasons.push({ code: "EMPTY", message: "Plate is empty after normalization" });
            }
            if (!pattern.test(normalized)) {
                reasons.push({ code: "PATTERN_MISMATCH", message: `Plate does not match pattern for ${stateCode}` });
            }
            if (reserved && reserved.has(normalized)) {
                reasons.push({ code: "RESERVED", message: "Plate is reserved or blocked" });
            }
            if (normalized !== plateRaw) {
                warnings.push({ code: "NORMALIZED", message: "Input plate was normalized" });
            }
            return {
                isValid: reasons.length === 0,
                normalizedPlate: normalized,
                stateCode,
                reasons,
                warnings,
            };
        },
    };
}
// Minimal starter rules. Extend with real per-state patterns as needed.
exports.defaultRules = {
    // Mexico City example: 3 letters + 3 digits (simplified)
    "MX-CMX": buildValidator("MX-CMX", /^[A-Z]{3}[0-9]{3}$/),
    // Generic Latin America format fallback: alphanumeric 5-8
    "LATAM-GENERIC": buildValidator("LATAM-GENERIC", /^[A-Z0-9]{5,8}$/),
    // US generic: 1-7 alphanumeric
    "US-GENERIC": buildValidator("US-GENERIC", /^[A-Z0-9]{1,7}$/),
};
//# sourceMappingURL=rules.js.map