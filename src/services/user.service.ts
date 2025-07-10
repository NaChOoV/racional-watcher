import { type User } from '../db/schema';
import type UserRepository from '../repository/user.repository';
import { runInBackground } from '../utils/utils';
import type { RacionalService } from './racional.service';

class UserService {
    private readonly userRepository: UserRepository;
    private readonly racionalService: RacionalService;
    constructor(userRepository: UserRepository, racionalService: RacionalService) {
        this.userRepository = userRepository;
        this.racionalService = racionalService;
    }

    public async processExpiredUsers(users: User[]): Promise<void> {
        const expiredUserIds = users.map((user) => user.id);
        await this.userRepository.removeTokenByUserIds(expiredUserIds);

        runInBackground(() => this.refreshTokens(users));
    }

    public async refreshTokens(users?: User[]): Promise<void> {
        if (!users || users.length === 0) users = await this.userRepository.getExpired();

        if (users.length === 0) return;

        const loginPromises = users.map((user) =>
            this.racionalService.login(user.email, user.password)
        );
        const promiseResult = await Promise.allSettled(loginPromises);

        const errors: { userId: number; error: Error }[] = [];
        const userIdToUpdate: { userId: number; token: string }[] = [];

        promiseResult.forEach((result, index) => {
            const user = users[index] as User;

            if (result.status === 'fulfilled') {
                userIdToUpdate.push({ userId: user.id, token: result.value.idToken });
            } else if (result.status === 'rejected') {
                errors.push({ userId: user.id, error: result.reason });
            }
        });

        const updatePromises = userIdToUpdate.map(({ userId, token }) =>
            this.userRepository.updateTokenByUserId(userId, token)
        );
        const updateErrorPromises = errors.map(({ userId, error }) =>
            this.userRepository.setErrorByUserId(userId, error.message)
        );

        if (updateErrorPromises.length > 0) {
            console.log(
                `[UserService] Errors occurred while refreshing tokens for users: ${errors
                    .map((e) => e.userId)
                    .join(', ')}`
            );
        }

        await Promise.all([...updatePromises, ...updateErrorPromises]);
    }
}

export default UserService;
