import { and, eq, inArray, notInArray } from 'drizzle-orm';
import { db } from '../db/database';
import { DEFAULT_STOCK_RANGE, stock, type Stock, type StockRange } from '../db/schema';

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
