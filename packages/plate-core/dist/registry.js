"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPlateRegistry = void 0;
const rules_1 = require("./rules");
class InMemoryPlateRegistry {
    constructor(initialRules) {
        this.stateCodeToRule = new Map();
        const rules = initialRules ?? rules_1.defaultRules;
        for (const [state, rule] of Object.entries(rules)) {
            this.stateCodeToRule.set(state, rule);
        }
    }
    getRule(stateCode) {
        return this.stateCodeToRule.get(stateCode);
    }
    registerRule(rule) {
        this.stateCodeToRule.set(rule.stateCode, rule);
    }
    listStates() {
        return Array.from(this.stateCodeToRule.keys()).sort();
    }
}
exports.InMemoryPlateRegistry = InMemoryPlateRegistry;
//# sourceMappingURL=registry.js.map