import { describe, test, expect, beforeEach, afterEach, spyOn, type Mock } from 'bun:test';
import WatcherService from '../watcher.service';
import type StockService from '../stock.service';
import type UserService from '../user.service';
import type UserRepository from '../../repository/user.repository';
import type NotificationService from '../notification.service';
import type { User } from '../../db/schema';
import type { Position } from '../../types/racional.types';
import type { VariationResult } from '../stock.service';

// Mock dependencies
const mockStockService = {
    getUserStocks: () => Promise.resolve({ expiredUsers: [], stockResults: [], errors: [] }),
    syncUserStocks: () => Promise.resolve(),
    compareStocksByTotalRevenue: () => Promise.resolve([]),
    updateStockRanges: () => Promise.resolve(),
} as unknown as StockService;

const mockUserService = {
    processExpiredUsers: () => Promise.resolve(),
} as unknown as UserService;

const mockUserRepository = {
    get: () => Promise.resolve([]),
} as unknown as UserRepository;

const mockNotificationService = {
    notifyVariation: () => Promise.resolve(),
} as unknown as NotificationService;

describe('WatcherService', () => {
    let watcherService: WatcherService;
    let getUserStocksMock: Mock<typeof mockStockService.getUserStocks>;
    let syncUserStocksMock: Mock<typeof mockStockService.syncUserStocks>;
    let compareStocksByTotalRevenueMock: Mock<typeof mockStockService.compareStocksByTotalRevenue>;
    let updateStockRangesMock: Mock<typeof mockStockService.updateStockRanges>;
    let processExpiredUsersMock: Mock<typeof mockUserService.processExpiredUsers>;
    let getUsersMock: Mock<typeof mockUserRepository.get>;
    let notifyVariationMock: Mock<typeof mockNotificationService.notifyVariation>;

    beforeEach(() => {
        // Reset all mocks
        getUserStocksMock = spyOn(mockStockService, 'getUserStocks').mockReturnValue(
            Promise.resolve({ expiredUsers: [], stockResults: [], errors: [] })
        );
        syncUserStocksMock = spyOn(mockStockService, 'syncUserStocks').mockReturnValue(
            Promise.resolve()
        );
        compareStocksByTotalRevenueMock = spyOn(
            mockStockService,
            'compareStocksByTotalRevenue'
        ).mockReturnValue(Promise.resolve([]));
        updateStockRangesMock = spyOn(mockStockService, 'updateStockRanges').mockReturnValue(
            Promise.resolve()
        );
        processExpiredUsersMock = spyOn(mockUserService, 'processExpiredUsers').mockReturnValue(
            Promise.resolve()
        );
        getUsersMock = spyOn(mockUserRepository, 'get').mockReturnValue(Promise.resolve([]));
        notifyVariationMock = spyOn(mockNotificationService, 'notifyVariation').mockReturnValue(
            Promise.resolve()
        );

        watcherService = new WatcherService(
            mockStockService,
            mockUserService,
            mockUserRepository,
            mockNotificationService
        );
    });

    afterEach(() => {
        // Clear all mock call history
        getUserStocksMock.mockClear();
        syncUserStocksMock.mockClear();
        compareStocksByTotalRevenueMock.mockClear();
        updateStockRangesMock.mockClear();
        processExpiredUsersMock.mockClear();
        getUsersMock.mockClear();
        notifyVariationMock.mockClear();
    });

    describe('checkStocks', () => {
        test('should return early when no users exist', async () => {
            getUsersMock.mockReturnValue(Promise.resolve([]));

            await watcherService.checkStocks();

            expect(getUsersMock).toHaveBeenCalledTimes(1);
            expect(getUserStocksMock).not.toHaveBeenCalled();
        });

        test('should process expired users when they exist', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
                {
                    id: 2,
                    chatId: 'chat2',
                    email: 'user2@test.com',
                    password: 'pass',
                    token: 'token2',
                    enabled: true,
                    error: null,
                },
            ];
            const expiredUsers: User[] = [users[1]!];

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers,
                    stockResults: [],
                    errors: [],
                })
            );

            await watcherService.checkStocks();

            expect(processExpiredUsersMock).toHaveBeenCalledWith(expiredUsers);
        });

        test('should log errors when they exist', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
            ];
            const errors = [{ userId: 1, error: new Error('API Error') }];

            const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers: [],
                    stockResults: [],
                    errors,
                })
            );

            await watcherService.checkStocks();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching stocks for user 1:',
                errors[0]!.error
            );
            consoleErrorSpy.mockRestore();
        });

        test('should return early when no stock results exist', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
            ];

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers: [],
                    stockResults: [],
                    errors: [],
                })
            );

            await watcherService.checkStocks();

            expect(syncUserStocksMock).not.toHaveBeenCalled();
            expect(compareStocksByTotalRevenueMock).not.toHaveBeenCalled();
        });

        test('should sync user stocks when stock results exist', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
                {
                    id: 2,
                    chatId: 'chat2',
                    email: 'user2@test.com',
                    password: 'pass',
                    token: 'token2',
                    enabled: true,
                    error: null,
                },
            ];

            const stocks1: Position[] = [
                {
                    assetId: 'AAPL',
                    amountOfShares: 10,
                    sharePriceOriginalCurrency: 150,
                    amountUSD: 1500,
                    unrealizedPL: 100,
                    unrealizedPLPercent: 7.14,
                    unrealizedDayPLPercent: 2.5,
                    unrealizedDayPL: 25,
                    lastUpdated: '2025-01-01',
                    weight: 50,
                },
                {
                    assetId: 'GOOGL',
                    amountOfShares: 5,
                    sharePriceOriginalCurrency: 2800,
                    amountUSD: 14000,
                    unrealizedPL: -200,
                    unrealizedPLPercent: -1.41,
                    unrealizedDayPLPercent: -0.5,
                    unrealizedDayPL: -70,
                    lastUpdated: '2025-01-01',
                    weight: 50,
                },
            ];

            const stocks2: Position[] = [
                {
                    assetId: 'TSLA',
                    amountOfShares: 20,
                    sharePriceOriginalCurrency: 800,
                    amountUSD: 16000,
                    unrealizedPL: 500,
                    unrealizedPLPercent: 3.23,
                    unrealizedDayPLPercent: 1.2,
                    unrealizedDayPL: 192,
                    lastUpdated: '2025-01-01',
                    weight: 100,
                },
            ];

            const stockResults = [
                { userId: 1, stocks: stocks1 },
                { userId: 2, stocks: stocks2 },
            ];

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers: [],
                    stockResults,
                    errors: [],
                })
            );
            compareStocksByTotalRevenueMock.mockReturnValue(Promise.resolve([]));

            await watcherService.checkStocks();

            expect(syncUserStocksMock).toHaveBeenCalledTimes(2);
            expect(syncUserStocksMock).toHaveBeenCalledWith(1, ['AAPL', 'GOOGL']);
            expect(syncUserStocksMock).toHaveBeenCalledWith(2, ['TSLA']);
            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledTimes(2);
            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledWith(1, stocks1);
            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledWith(2, stocks2);
        });

        test('should return early when no variations exist', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
            ];

            const stocks: Position[] = [
                {
                    assetId: 'AAPL',
                    amountOfShares: 10,
                    sharePriceOriginalCurrency: 150,
                    amountUSD: 1500,
                    unrealizedPL: 100,
                    unrealizedPLPercent: 7.14,
                    unrealizedDayPLPercent: 2.5,
                    unrealizedDayPL: 25,
                    lastUpdated: '2025-01-01',
                    weight: 100,
                },
            ];

            const stockResults = [{ userId: 1, stocks }];

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers: [],
                    stockResults,
                    errors: [],
                })
            );
            compareStocksByTotalRevenueMock.mockReturnValue(Promise.resolve([]));

            await watcherService.checkStocks();

            expect(updateStockRangesMock).not.toHaveBeenCalled();
            expect(notifyVariationMock).not.toHaveBeenCalled();
        });

        test('should update stock ranges and send notifications when variations exist', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
                {
                    id: 2,
                    chatId: 'chat2',
                    email: 'user2@test.com',
                    password: 'pass',
                    token: 'token2',
                    enabled: true,
                    error: null,
                },
            ];

            const stocks1: Position[] = [
                {
                    assetId: 'AAPL',
                    amountOfShares: 10,
                    sharePriceOriginalCurrency: 150,
                    amountUSD: 1500,
                    unrealizedPL: 100,
                    unrealizedPLPercent: 7.14,
                    unrealizedDayPLPercent: 2.5,
                    unrealizedDayPL: 25,
                    lastUpdated: '2025-01-01',
                    weight: 50,
                },
            ];

            const stocks2: Position[] = [
                {
                    assetId: 'GOOGL',
                    amountOfShares: 5,
                    sharePriceOriginalCurrency: 2800,
                    amountUSD: 14000,
                    unrealizedPL: -200,
                    unrealizedPLPercent: -1.41,
                    unrealizedDayPLPercent: -0.5,
                    unrealizedDayPL: -70,
                    lastUpdated: '2025-01-01',
                    weight: 100,
                },
            ];

            const variations1: VariationResult[] = [
                {
                    userId: 1,
                    assetId: 'AAPL',
                    newValue: 7.14,
                    variation: 2.5,
                    newRanges: [
                        { value: 2, in: true },
                        { value: 1, in: true },
                    ],
                },
            ];

            const variations2: VariationResult[] = [
                {
                    userId: 2,
                    assetId: 'GOOGL',
                    newValue: -1.41,
                    variation: -0.5,
                    newRanges: [
                        { value: -1, in: true },
                        { value: -2, in: true },
                    ],
                },
            ];

            const stockResults = [
                { userId: 1, stocks: stocks1 },
                { userId: 2, stocks: stocks2 },
            ];

            const allVariations = [...variations1, ...variations2];

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers: [],
                    stockResults,
                    errors: [],
                })
            );
            compareStocksByTotalRevenueMock
                .mockReturnValueOnce(Promise.resolve(variations1))
                .mockReturnValueOnce(Promise.resolve(variations2));

            await watcherService.checkStocks();

            expect(updateStockRangesMock).toHaveBeenCalledWith(allVariations);
            expect(notifyVariationMock).toHaveBeenCalledTimes(2);
            expect(notifyVariationMock).toHaveBeenCalledWith('chat1', variations1[0]);
            expect(notifyVariationMock).toHaveBeenCalledWith('chat2', variations2[0]);
        });

        test('should handle complete workflow with all scenarios', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
                {
                    id: 2,
                    chatId: 'chat2',
                    email: 'user2@test.com',
                    password: 'pass',
                    token: 'token2',
                    enabled: true,
                    error: null,
                },
                {
                    id: 3,
                    chatId: 'chat3',
                    email: 'user3@test.com',
                    password: 'pass',
                    token: 'token3',
                    enabled: true,
                    error: null,
                },
            ];

            const expiredUsers: User[] = [users[2]!]; // User 3 is expired

            const errors = [{ userId: 2, error: new Error('Network timeout') }];

            const stocks1: Position[] = [
                {
                    assetId: 'AAPL',
                    amountOfShares: 10,
                    sharePriceOriginalCurrency: 150,
                    amountUSD: 1500,
                    unrealizedPL: 100,
                    unrealizedPLPercent: 7.14,
                    unrealizedDayPLPercent: 2.5,
                    unrealizedDayPL: 25,
                    lastUpdated: '2025-01-01',
                    weight: 100,
                },
            ];

            const stockResults = [{ userId: 1, stocks: stocks1 }];

            const variations: VariationResult[] = [
                {
                    userId: 1,
                    assetId: 'AAPL',
                    newValue: 7.14,
                    variation: 2.5,
                    newRanges: [
                        { value: 2, in: true },
                        { value: 1, in: true },
                    ],
                },
            ];

            const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers,
                    stockResults,
                    errors,
                })
            );
            compareStocksByTotalRevenueMock.mockReturnValue(Promise.resolve(variations));

            await watcherService.checkStocks();

            // Verify all operations were called correctly
            expect(processExpiredUsersMock).toHaveBeenCalledWith(expiredUsers);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching stocks for user 2:',
                errors[0]!.error
            );
            expect(syncUserStocksMock).toHaveBeenCalledWith(1, ['AAPL']);
            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledWith(1, stocks1);
            expect(updateStockRangesMock).toHaveBeenCalledWith(variations);
            expect(notifyVariationMock).toHaveBeenCalledWith('chat1', variations[0]);

            consoleErrorSpy.mockRestore();
        });

        test('should handle multiple users with multiple stocks and variations', async () => {
            const users: User[] = [
                {
                    id: 1,
                    chatId: 'chat1',
                    email: 'user1@test.com',
                    password: 'pass',
                    token: 'token1',
                    enabled: true,
                    error: null,
                },
                {
                    id: 2,
                    chatId: 'chat2',
                    email: 'user2@test.com',
                    password: 'pass',
                    token: 'token2',
                    enabled: true,
                    error: null,
                },
            ];

            const stocks1: Position[] = [
                {
                    assetId: 'AAPL',
                    amountOfShares: 10,
                    sharePriceOriginalCurrency: 150,
                    amountUSD: 1500,
                    unrealizedPL: 100,
                    unrealizedPLPercent: 7.14,
                    unrealizedDayPLPercent: 2.5,
                    unrealizedDayPL: 25,
                    lastUpdated: '2025-01-01',
                    weight: 60,
                },
                {
                    assetId: 'MSFT',
                    amountOfShares: 15,
                    sharePriceOriginalCurrency: 300,
                    amountUSD: 4500,
                    unrealizedPL: -50,
                    unrealizedPLPercent: -1.1,
                    unrealizedDayPLPercent: -0.3,
                    unrealizedDayPL: -13.5,
                    lastUpdated: '2025-01-01',
                    weight: 40,
                },
            ];

            const stocks2: Position[] = [
                {
                    assetId: 'GOOGL',
                    amountOfShares: 5,
                    sharePriceOriginalCurrency: 2800,
                    amountUSD: 14000,
                    unrealizedPL: 200,
                    unrealizedPLPercent: 1.45,
                    unrealizedDayPLPercent: 0.8,
                    unrealizedDayPL: 112,
                    lastUpdated: '2025-01-01',
                    weight: 70,
                },
                {
                    assetId: 'TSLA',
                    amountOfShares: 8,
                    sharePriceOriginalCurrency: 900,
                    amountUSD: 7200,
                    unrealizedPL: -100,
                    unrealizedPLPercent: -1.37,
                    unrealizedDayPLPercent: -1.1,
                    unrealizedDayPL: -79.2,
                    lastUpdated: '2025-01-01',
                    weight: 30,
                },
            ];

            const variations1: VariationResult[] = [
                {
                    userId: 1,
                    assetId: 'AAPL',
                    newValue: 7.14,
                    variation: 2.5,
                    newRanges: [
                        { value: 2, in: true },
                        { value: 1, in: true },
                    ],
                },
                {
                    userId: 1,
                    assetId: 'MSFT',
                    newValue: -1.1,
                    variation: -0.3,
                    newRanges: [
                        { value: -1, in: true },
                        { value: -2, in: false },
                    ],
                },
            ];

            const variations2: VariationResult[] = [
                {
                    userId: 2,
                    assetId: 'TSLA',
                    newValue: -1.37,
                    variation: -1.1,
                    newRanges: [
                        { value: -1, in: true },
                        { value: -2, in: true },
                    ],
                },
            ];

            const stockResults = [
                { userId: 1, stocks: stocks1 },
                { userId: 2, stocks: stocks2 },
            ];

            const allVariations = [...variations1, ...variations2];

            getUsersMock.mockReturnValue(Promise.resolve(users));
            getUserStocksMock.mockReturnValue(
                Promise.resolve({
                    expiredUsers: [],
                    stockResults,
                    errors: [],
                })
            );
            compareStocksByTotalRevenueMock
                .mockReturnValueOnce(Promise.resolve(variations1))
                .mockReturnValueOnce(Promise.resolve(variations2));

            await watcherService.checkStocks();

            expect(syncUserStocksMock).toHaveBeenCalledTimes(2);
            expect(syncUserStocksMock).toHaveBeenCalledWith(1, ['AAPL', 'MSFT']);
            expect(syncUserStocksMock).toHaveBeenCalledWith(2, ['GOOGL', 'TSLA']);

            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledTimes(2);
            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledWith(1, stocks1);
            expect(compareStocksByTotalRevenueMock).toHaveBeenCalledWith(2, stocks2);

            expect(updateStockRangesMock).toHaveBeenCalledWith(allVariations);

            expect(notifyVariationMock).toHaveBeenCalledTimes(3);
            expect(notifyVariationMock).toHaveBeenCalledWith('chat1', variations1[0]);
            expect(notifyVariationMock).toHaveBeenCalledWith('chat1', variations1[1]);
            expect(notifyVariationMock).toHaveBeenCalledWith('chat2', variations2[0]);
        });
    });
});
