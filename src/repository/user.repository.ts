import { and, eq, isNotNull, inArray, isNull } from 'drizzle-orm';
import { db } from '../db/database';
import { user, type User } from '../db/schema';

class UserRepository {
    private readonly client: typeof db;
    constructor() {
        this.client = db;
    }

    public get(): Promise<User[]> {
        return this.client
            .select()
            .from(user)
            .where(and(eq(user.enabled, true), isNotNull(user.token)));
    }

    public async removeTokenByUserIds(userIds: number[]): Promise<void> {
        await this.client
            .update(user)
            .set({ token: null })
            .where(and(eq(user.enabled, true), inArray(user.id, userIds)));
    }

    public getExpired(): Promise<User[]> {
        return this.client
            .select()
            .from(user)
            .where(and(eq(user.enabled, true), isNull(user.token)));
    }

    public async updateTokenByUserId(userId: number, token: string): Promise<void> {
        await this.client.update(user).set({ token }).where(eq(user.id, userId));
    }

    public async setErrorByUserId(userId: number, error: string | null): Promise<void> {
        await this.client.update(user).set({ error }).where(eq(user.id, userId));
    }
}

export default UserRepository;
