import type { AxiosInstance } from 'axios';
import axios from 'axios';
import EnvConfig from '../config/enviroments';
import type { ErrorResponse, LoginResponse, Position } from '../types/racional.types';
import { HttpStatus } from '../enum/http-status.enum';

export class InvalidCredentials extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidCredentials';
    }
}

export class RacionalService {
    private readonly httpService: AxiosInstance;
    constructor() {
        this.httpService = axios.create({
            baseURL: EnvConfig.racionalBaseUrl,
            timeout: 10000,
        });
    }

    public async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(EnvConfig.racionalLoginUrl, {
                email,
                password,
                returnSecureToken: true,
            });

            return response.data;
        } catch (error) {
            if (!axios.isAxiosError(error)) {
                console.error('[RacionalService] Unknown error during login:', error);
                throw error;
            }

            if (error.response?.status === HttpStatus.BAD_REQUEST) {
                const data = error.response.data as ErrorResponse;
                if (data.error?.message === 'INVALID_PASSWORD') {
                    throw new InvalidCredentials('Invalid email or password');
                }
            }

            throw error;
        }
    }

    public async getStocks(token: string): Promise<Position[]> {
        try {
            const response = await this.httpService.get<Position[]>('/positions', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            if (!axios.isAxiosError(error)) throw error;

            if (error.response?.status === HttpStatus.FORBIDDEN) {
                throw new InvalidCredentials('Invalid token');
            }

            throw error;
        }
    }
}
