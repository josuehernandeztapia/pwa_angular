import { createHash } from "crypto";
import { normalizePlate, normalizeVin } from "./normalize";

export interface NormalizedIdInput {
  vin: string;
  plate: string;
}

export interface NormalizedIdResult {
  id: string;
  normalizedVin: string;
  normalizedPlate: string;
}

export function generateVehicleId(input: NormalizedIdInput): NormalizedIdResult {
  const normalizedVin = normalizeVin(input.vin);
  const normalizedPlate = normalizePlate(input.plate);
  const payload = `${normalizedVin}:${normalizedPlate}`;
  const hash = createHash("sha256").update(payload, "utf8").digest("hex");
  return {
    id: `sha256:${hash}`,
    normalizedVin,
    normalizedPlate,
  };
}
