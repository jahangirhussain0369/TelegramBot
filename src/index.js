// Import dependencies
const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const winston = require('winston');
const startCommand = require('./commands/start');
const infoCommand = require('./commands/info');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/user');
const Event = require('./models/event');

// Load environment variables from .env file
dotenv.config();

// Create a logger using winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        logger.info('Connected to MongoDB');
    })
    .catch((err) => {
        logger.error('Error connecting to MongoDB:', err);
    });

// Initialize the bot using the token from .env file
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware: Store User and Event in MongoDB
bot.use(async (ctx, next) => {
    try {
        const { id, first_name, last_name, username } = ctx.from;
        // Store user in DB
        let user = await User.findOne({ telegramId: id });
        if (!user) {
            user = new User({ telegramId: id, firstName: first_name, lastName: last_name, username });
            await user.save();
            logger.info(`New user saved: ${first_name} ${last_name}`);
        }

        // Log events
        const event = new Event({
            telegramId: id,
            message: ctx.message?.text || 'No message text',
            eventType: ctx.updateType,
        });
        await event.save();
        logger.info(`Event logged: ${ctx.updateType} from ${username || 'unknown'}`);
    } catch (err) {
        logger.error('Error storing user/event:', err);
    }

    return next();
});

// Command handlers
bot.start(startCommand);
bot.command('info', infoCommand);

// Global error handler
bot.catch(errorHandler);

// Launch the bot
bot.launch()
    .then(() => {
        logger.info('Bot is up and running!');
        console.log('Bot is up and running!');
    })
    .catch(err => {
        logger.error('Error launching bot:', err);
        console.error('Error launching bot:', err);
    });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
