import { and, eq, inArray, notInArray } from 'drizzle-orm';
import { db } from '../db/database';
import { stock, type Stock, type StockRange } from '../db/schema';

export const DEFAULT_STOCK_RANGE: StockRange[] = [
    { value: 10, in: false },
    { value: 9, in: false },
    { value: 8, in: false },
    { value: 7, in: false },
    { value: 6, in: false },
    { value: 5, in: false },
    { value: 4, in: false },
    { value: 3, in: false },
    { value: 2, in: false },
    { value: 1, in: false },
    { value: 0.5, in: true },
    { value: -0.5, in: true },
    { value: -1, in: false },
    { value: -2, in: false },
    { value: -3, in: false },
    { value: -4, in: false },
    { value: -5, in: false },
    { value: -6, in: false },
    { value: -7, in: false },
    { value: -8, in: false },
    { value: -9, in: false },
    { value: -10, in: false },
];

class StockRepository {
    private readonly client: typeof db;
    constructor() {
        this.client = db;
    }

    public async getStocksByUserId(userId: number): Promise<Stock[]> {
        return this.client.select().from(stock).where(eq(stock.userId, userId));
    }

    public async getStocksByUserIds(userIds: number[]): Promise<Stock[]> {
        return this.client.select().from(stock).where(inArray(stock.userId, userIds));
    }

    public getStockInByUserId(userId: number, assetIds: string[]): Promise<Stock[]> {
        return this.client
            .select()
            .from(stock)
            .where(and(eq(stock.userId, userId), inArray(stock.assetId, assetIds)));
    }

    public removeStocksByUserId(userId: number, assetIds: string[]) {
        return this.client
            .delete(stock)
            .where(and(eq(stock.userId, userId), inArray(stock.assetId, assetIds)));
    }

    public async updateStockRanges(
        variations: { userId: number; assetId: string; newRanges: StockRange[] }[]
    ) {
        return this.client.transaction(async (tx) => {
            const updates = variations.map(({ userId, assetId, newRanges }) =>
                tx
                    .update(stock)
                    .set({ ranges: newRanges })
                    .where(and(eq(stock.userId, userId), eq(stock.assetId, assetId)))
            );

            await Promise.all(updates);
        });
    }

    public syncStocks(userId: number, assetIds: string[]) {
        return this.client.transaction(async (tx) => {
            const stocksToDelete = await tx
                .select()
                .from(stock)
                .where(and(eq(stock.userId, userId), notInArray(stock.assetId, assetIds)));

            if (stocksToDelete.length > 0) {
                const assetToDelete = stocksToDelete.map((s) => s.assetId);
                await tx
                    .delete(stock)
                    .where(and(eq(stock.userId, userId), inArray(stock.assetId, assetToDelete)));
            }

            const stocksFromDb = await tx
                .select()
                .from(stock)
                .where(and(eq(stock.userId, userId)));

            if (stocksFromDb.length === assetIds.length) return;

            const assetsFromDb = stocksFromDb.map((s) => s.assetId);
            const assetsNotInDb = assetIds.filter((assetId) => !assetsFromDb.includes(assetId));

            const stocksToCreate = assetsNotInDb.map((assetId) => ({
                userId,
                assetId,
                ranges: DEFAULT_STOCK_RANGE,
            }));

            await tx.insert(stock).values(stocksToCreate);
        });
    }
}

export default StockRepository;
