import type { AxiosInstance } from 'axios';
import EnvConfig from '../config/enviroments';
import axios from 'axios';
import { Variation, type VariationResult } from './stock.service';

class NotificationService {
    private readonly httpService: AxiosInstance;
    constructor() {
        this.httpService = axios.create({
            baseURL: EnvConfig.notificationBaseUrl,
            timeout: 10000,
            auth: {
                username: EnvConfig.notificationUsername,
                password: EnvConfig.notificationPassword,
            },
        });
    }

    private sendNotification(chatId: string, message: string): Promise<void> {
        return this.httpService.post('webhook/whatsapp', { chatId, message });
    }

    public async notifyVariation(chatId: string, variation: VariationResult): Promise<void> {
        const variationIcon = variation.variationType > Variation.INCREASE ? '🔺' : '🔻';
        const variationPercentage = variation.variation.toFixed(2);
        const message = `${variation.assetId} ${variationIcon} ${variationPercentage}%`;

        await this.sendNotification(chatId, message);
    }
}

export default NotificationService;
