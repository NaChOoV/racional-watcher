export interface LoginResponse {
    kind: string;
    localId: string;
    email: string;
    displayName: string;
    idToken: string;
    registered: boolean;
    refreshToken: string;
    expiresIn: string;
}

export interface ErrorResponse {
    error: Error;
}

export interface Error {
    code: number;
    message: string;
    errors: {
        message: string;
        domain: string;
        reason: string;
    }[];
}

export interface Position {
    assetId: string;
    amountOfShares: number;
    sharePriceOriginalCurrency: number;
    amountUSD: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
    unrealizedDayPLPercent: number;
    unrealizedDayPL: number;
    lastUpdated: string;
    weight: number;
}
