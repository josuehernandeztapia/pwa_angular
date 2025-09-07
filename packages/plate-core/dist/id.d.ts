export interface NormalizedIdInput {
    vin: string;
    plate: string;
}
export interface NormalizedIdResult {
    id: string;
    normalizedVin: string;
    normalizedPlate: string;
}
export declare function generateVehicleId(input: NormalizedIdInput): NormalizedIdResult;
