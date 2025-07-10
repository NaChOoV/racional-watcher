import { CronJob } from 'cron';
import { sleep } from 'bun';
import { getSleepSeconds } from '../utils/sleep-time';
import EnvConfig from '../config/enviroments';
import type WatcherService from './watcher.service';
import type UserService from './user.service';

class CronJobService {
    private readonly watcherService: WatcherService;
    private readonly userService: UserService;
    constructor(watcherService: WatcherService, userService: UserService) {
        this.watcherService = watcherService;
        this.userService = userService;
    }
    public setup() {
        const _ = CronJob.from({
            cronTime: '*/5 * * * * *',
            onTick: async () => this.checkUserStocks(),
            start: true,
            waitForCompletion: true,
        });

        console.log('[CronJobService] Running.');
    }

    private async checkUserStocks() {
        await this.checkSleepTime('checkUserStocks');
        try {
            await this.watcherService.checkStocks();
        } catch (error) {
            console.error('[CronJobService] Error checking user stocks:', error);
        }

        await this.userService.refreshTokens();
    }

    private async checkSleepTime(name: string) {
        const secondsLeft = getSleepSeconds(EnvConfig.timeZone);
        if (secondsLeft > 0) {
            const hours = (secondsLeft / 60 / 60).toFixed(1);
            console.log(`[CronJobService] Cron: ${name} paused for ${hours} hours.`);
        }

        await sleep(secondsLeft * 1000);
    }
}

export default CronJobService;
