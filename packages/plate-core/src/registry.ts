import { PlateRegistry, PlateRule, StateCode } from "./types";
import { defaultRules } from "./rules";

export class InMemoryPlateRegistry implements PlateRegistry {
  private readonly stateCodeToRule: Map<StateCode, PlateRule> = new Map();

  constructor(initialRules?: Record<string, PlateRule>) {
    const rules = initialRules ?? defaultRules;
    for (const [state, rule] of Object.entries(rules)) {
      this.stateCodeToRule.set(state, rule);
    }
  }

  getRule(stateCode: StateCode): PlateRule | undefined {
    return this.stateCodeToRule.get(stateCode);
  }

  registerRule(rule: PlateRule): void {
    this.stateCodeToRule.set(rule.stateCode, rule);
  }

  listStates(): StateCode[] {
    return Array.from(this.stateCodeToRule.keys()).sort();
  }
}
