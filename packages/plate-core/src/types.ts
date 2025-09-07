export type StateCode = string;

export interface ValidationMessage {
  code: string;
  message: string;
}

export interface PlateValidationResult {
  isValid: boolean;
  normalizedPlate: string;
  stateCode: StateCode;
  reasons: ValidationMessage[];
  warnings: ValidationMessage[];
}

export interface PlateRule {
  stateCode: StateCode;
  /** Pattern applied after normalization */
  pattern: RegExp;
  /** Optional list of reserved/blocked normalized plates */
  reserved?: Set<string>;
  normalize: (plateRaw: string) => string;
  validate: (plateRaw: string) => PlateValidationResult;
}

export interface PlateRegistry {
  getRule: (stateCode: StateCode) => PlateRule | undefined;
  registerRule: (rule: PlateRule) => void;
  listStates: () => StateCode[];
}
