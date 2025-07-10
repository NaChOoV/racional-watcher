const EnvConfig = {
    timeZone: process.env.TIME_ZONE || 'GMT-3',
    databaseUrl: process.env.TURSO_DATABASE_URL || '',
    databaseToken: process.env.TURSO_AUTH_TOKEN || '',
    botToken: process.env.BOT_TOKEN || '',
    racionalBaseUrl: process.env.RACIONAL_BASE_URL || 'https://api.racional.cl/',
    racionalLoginUrl:
        process.env.RACIONAL_LOGIN_URL ||
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCHCBAaUWhTc8mGtyqfahJ4cYpeVACoCJk',
    notificationBaseUrl: process.env.NOTIFICATION_BASE_URL || 'https://api.telegram.org/bot',
    notificationUsername: process.env.NOTIFICATION_USERNAME || '',
    notificationPassword: process.env.NOTIFICATION_PASSWORD || '',
};

export default EnvConfig;
