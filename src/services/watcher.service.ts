import type UserRepository from '../repository/user.repository';
import { runInBackground } from '../utils/utils';
import type NotificationService from './notification.service';
import type StockService from './stock.service';
import type UserService from './user.service';

class WatcherService {
    private readonly stockService: StockService;
    private readonly userService: UserService;
    private readonly userRepository: UserRepository;
    private readonly notificationService: NotificationService;

    constructor(
        stockService: StockService,
        userService: UserService,
        userRepository: UserRepository,
        notificationService: NotificationService
    ) {
        this.stockService = stockService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public async checkStocks() {
        const users = await this.userRepository.get();
        if (users.length === 0) return;

        const { expiredUsers, stockResults, errors } = await this.stockService.getUserStocks(users);
        if (expiredUsers.length > 0) {
            runInBackground(() => this.userService.processExpiredUsers(expiredUsers));
        }

        if (errors.length > 0) {
            errors.forEach(({ userId, error }) => {
                console.error(`Error fetching stocks for user ${userId}:`, error);
            });
        }

        if (stockResults.length === 0) return;

        const syncStockPromises = stockResults.map(({ userId, stocks }) => {
            return this.stockService.syncUserStocks(
                userId,
                stocks.map((stock) => stock.assetId)
            );
        });

        await Promise.all(syncStockPromises);

        const variationPromises = stockResults.map(({ userId, stocks }) => {
            return this.stockService.compareStocksByTotalRevenue(userId, stocks);
        });
        const variations = (await Promise.all(variationPromises)).flat();

        if (variations.length === 0) return;
        await this.stockService.updateStockRanges(variations);

        const userMap = new Map<number, string>();
        users.forEach((user) => userMap.set(user.id, user.chatId));

        const notificationPromises = variations.map((variation) => {
            const chatId = userMap.get(variation.userId) as string;
            return this.notificationService.notifyVariation(chatId, variation);
        });
        await Promise.all(notificationPromises);
    }
}

export default WatcherService;
