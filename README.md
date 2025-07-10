# Racional Watcher 📈

A TypeScript-based stock monitoring service that tracks portfolio positions from Racional.cl and sends notifications when stock variations exceed configured thresholds.

## 🚀 Features

- **Automated Stock Monitoring**: Continuously monitors user stock positions from Racional.cl
- **Configurable Thresholds**: Set custom variation ranges for each stock
- **Real-time Notifications**: Receives WhatsApp/Telegram notifications when stocks move outside defined ranges
- **User Management**: Supports multiple users with individual portfolios
- **Token Management**: Automatic token refresh and expired credential handling
- **Database Integration**: SQLite database with Drizzle ORM for data persistence
- **Cron Job Scheduling**: Automated monitoring with configurable intervals

## ⚡ Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/racional-watcher.git
cd racional-watcher
bun install

# Set up your .env file (see Installation section for details)
cp .env.example .env  # Edit with your configuration

# Run database migrations
bun migration:generate

# Start in development mode
bun dev

# Or start in production mode
bun start
```

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Language**: TypeScript
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **HTTP Client**: Axios
- **Scheduling**: [node-cron](https://www.npmjs.com/package/cron)
- **Notifications**: Telegram Bot API / WhatsApp API
- **Testing**: Bun Test

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/racional-watcher.git
   cd racional-watcher
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   TURSO_DATABASE_URL=your_database_url
   TURSO_AUTH_TOKEN=your_database_token
   
   # Racional API Configuration
   RACIONAL_BASE_URL=https://api.racional.cl/
   RACIONAL_LOGIN_URL=https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=YOUR_API_KEY
   
   # Notification Configuration
   NOTIFICATION_BASE_URL=https://api.telegram.org/bot
   NOTIFICATION_USERNAME=your_notification_username
   NOTIFICATION_PASSWORD=your_notification_password
   BOT_TOKEN=your_telegram_bot_token
   
   # Timezone Configuration
   TIME_ZONE=GMT-3
   ```

4. **Run database migrations**:
   ```bash
   bun migration:generate
   ```

5. **Start the application**:
   ```bash
   # Development mode (with hot reload)
   bun dev
   
   # Production mode
   bun start
   ```
   NOTIFICATION_USERNAME=your_notification_username
   NOTIFICATION_PASSWORD=your_notification_password
   BOT_TOKEN=your_telegram_bot_token
   
   # Timezone Configuration
   TIME_ZONE=GMT-3
   ```

4. **Run database migrations**:
   ```bash
   bun run migration:generate
   ```

## 🚦 Usage

### Development Mode
Run the application with hot reload for development:
```bash
bun dev
```

### Production Mode
Run the application in production:
```bash
bun start
```

### Running Tests
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch
```

### Database Operations
```bash
# Generate database migrations
bun migration:generate
```

## 📊 How It Works

1. **User Registration**: Users register with their Racional.cl credentials
2. **Stock Monitoring**: The service periodically fetches user portfolios from Racional.cl
3. **Variation Detection**: Compares current stock positions against configured ranges
4. **Notification Trigger**: When a stock moves outside its defined range, a notification is sent
5. **Range Update**: Updates the stock ranges based on the new position

### Stock Range Configuration

Each stock has configurable ranges that determine when notifications are triggered:

```typescript
type StockRange = {
    value: number;    // Percentage threshold (e.g., 2.0 for 2%)
    in: boolean;      // Whether this range is currently active
};
```

Example configuration:
```typescript
const ranges: StockRange[] = [
    { value: 2, in: false },     // +2% threshold
    { value: 1, in: false },     // +1% threshold
    { value: 0.5, in: true },    // +0.5% threshold (active)
    { value: -0.5, in: true },   // -0.5% threshold (active)
    { value: -1, in: false },    // -1% threshold
    { value: -2, in: false },    // -2% threshold
];
```

## 📁 Project Structure

```
racional-watcher/
├── src/
│   ├── config/
│   │   └── enviroments.ts          # Environment configuration
│   ├── db/
│   │   ├── database.ts             # Database connection
│   │   └── schema.ts               # Database schema definitions
│   ├── enum/
│   │   └── http-status.enum.ts     # HTTP status codes
│   ├── repository/
│   │   ├── stock.repository.ts     # Stock data access layer
│   │   └── user.repository.ts      # User data access layer
│   ├── services/
│   │   ├── cron.service.ts         # Cron job management
│   │   ├── notification.service.ts # Notification handling
│   │   ├── racional.service.ts     # Racional API integration
│   │   ├── stock.service.ts        # Stock monitoring logic
│   │   ├── user.service.ts         # User management
│   │   └── watchet.service.ts      # Main watcher orchestration
│   ├── types/
│   │   └── racional.types.ts       # TypeScript type definitions
│   ├── utils/
│   │   ├── sleep-time.ts           # Sleep time calculations
│   │   └── utils.ts                # General utilities
│   └── di-container.ts             # Dependency injection container
├── drizzle/                        # Database migrations
├── main.ts                         # Application entry point
└── package.json
```

## 🔧 Configuration

### Cron Job Schedule
The default monitoring interval is every 5 seconds. You can modify this in `src/services/cron.service.ts`:

```typescript
const cronJob = CronJob.from({
    cronTime: '*/5 * * * * *',  // Every 5 seconds
    onTick: async () => this.checkUserStocks(),
    start: true,
});
```

### Notification Thresholds
Default stock ranges are defined in `src/repository/stock.repository.ts` and can be customized per user/stock.

## 🧪 Testing

The project includes comprehensive tests for the core stock monitoring logic:

```bash
# Run stock service tests
bun test src/services/__tests__/stock.service.test.ts

# Run all tests with coverage
bun test --coverage
```

## 📈 API Integration

### Racional.cl API
- **Login**: Authenticates users and retrieves access tokens
- **Positions**: Fetches current stock positions and unrealized P&L

### Notification APIs
- **WhatsApp**: Sends notifications via WhatsApp webhook
- **Telegram**: Sends notifications via Telegram Bot API

## 🔐 Security

- User credentials are stored securely in the database
- API tokens are automatically refreshed when expired
- All external API calls include proper error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Tests for `getVariation` method need to be updated to match the current implementation
- Token refresh logic could be optimized for better performance

## 🗺️ Roadmap

- [ ] Add support for more notification channels (Discord, Slack)
- [ ] Implement web dashboard for configuration
- [ ] Add more sophisticated trading indicators
- [ ] Support for multiple exchanges beyond Racional.cl
- [ ] Real-time WebSocket integration for faster updates

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the maintainers.

---

**Note**: This project is designed to work with Racional.cl's API. Make sure you have valid credentials and comply with their terms of service.
