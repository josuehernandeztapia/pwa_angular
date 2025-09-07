import { PlateRegistry, PlateRule, StateCode } from "./types";
export declare class InMemoryPlateRegistry implements PlateRegistry {
    private readonly stateCodeToRule;
    constructor(initialRules?: Record<string, PlateRule>);
    getRule(stateCode: StateCode): PlateRule | undefined;
    registerRule(rule: PlateRule): void;
    listStates(): StateCode[];
}
