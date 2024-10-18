const winston = require('winston');

// Create an error handler middleware
module.exports = (err, ctx) => {
    winston.error(`Error for ${ctx.updateType}: ${err}`);
    console.error(`Error for ${ctx.updateType}: ${err}`);
    ctx.reply('An error occurred. Please try again later.');
};
