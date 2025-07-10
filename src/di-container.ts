import { stock, user } from './db/schema';
import StockRepository from './repository/stock.repository';
import UserRepository from './repository/user.repository';
import CronJobService from './services/cron.service';
import NotificationService from './services/notification.service';
import { RacionalService } from './services/racional.service';
import StockService from './services/stock.service';
import UserService from './services/user.service';
import WatcherService from './services/watchet.service';

const racionalService = new RacionalService();

const userRepository = new UserRepository();
const stockRepository = new StockRepository();
const notificationService = new NotificationService();

const stockService = new StockService(racionalService, stockRepository);
const userService = new UserService(userRepository, racionalService);

const watcherService = new WatcherService(
    stockService,
    userService,
    userRepository,
    notificationService
);
const cronjobService = new CronJobService(watcherService, userService);

export {
    userService,
    stockService,
    racionalService,
    userRepository,
    cronjobService,
    watcherService,
};
