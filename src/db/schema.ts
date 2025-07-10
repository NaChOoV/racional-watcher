import { int, sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { type InferSelectModel } from 'drizzle-orm';

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

export const user = sqliteTable(
    'user',
    {
        id: int().primaryKey({ autoIncrement: true }),
        chatId: text('chat_id').notNull().unique(),
        email: text().notNull().unique(),
        password: text().notNull(),
        token: text().unique(),
        enabled: integer({ mode: 'boolean' }).default(true),
        error: text('error').$type<string | null>().default(null),
    },
    (t) => [unique().on(t.chatId, t.email)]
);

export const stock = sqliteTable(
    'stock',
    {
        id: int().primaryKey({ autoIncrement: true }),
        userId: integer('user_id').notNull(),
        assetId: text('asset_id').notNull(),
        ranges: text('ranges', { mode: 'json' })
            .$type<StockRange[]>()
            .notNull()
            .default(DEFAULT_STOCK_RANGE),
    },
    (t) => [unique().on(t.userId, t.assetId)]
);

export type StockRange = { value: number; in: boolean };
export type Stock = InferSelectModel<typeof stock>;

export type User = InferSelectModel<typeof user>;
