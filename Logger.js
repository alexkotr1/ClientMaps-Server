const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './logs/info.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      level: 'error',
      filename: './logs/error.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

module.exports = logger;
