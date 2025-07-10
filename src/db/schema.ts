import { int, sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql, type InferSelectModel } from 'drizzle-orm';
import { DEFAULT_STOCK_RANGE } from '../repository/stock.repository';

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
        ranges: text('ranges', { mode: 'json' }).$type<StockRange[]>().notNull(),
    },
    (t) => [unique().on(t.userId, t.assetId)]
);

export type StockRange = { value: number; in: boolean };
export type Stock = InferSelectModel<typeof stock>;

export type User = InferSelectModel<typeof user>;
