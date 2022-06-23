const winston = require('winston')

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info
    const ts = timestamp.slice(0, 19).replace('T', ' ')
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`
  }),
)

module.exports = winston.createLogger({
  level: 'info',
  format: alignedWithColorsAndTime,
  transports: [
    new winston.transports.Console({
      colorize: true,
      timestamp: function () {
        return (new Date()).toLocaleTimeString()
      },
      prettyPrint: true
    })
  ]
})
