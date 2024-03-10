const expressWinston = require("express-winston");
const { format, transports } = require("winston");
const { combine, timestamp, prettyPrint, metadata } = format;
const config = require("config");
const expressWinstonLogger = expressWinston.logger({
  transports: [
    new transports.File({
      filename: "log/xato.log",
      options: { useUnifiedTopology: true },
    }),
    new transports.Console(),
  ],
  format: combine(timestamp(), prettyPrint(), metadata()),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    return false;
  },
});

const expressWinstonErrorLogger = expressWinston.errorLogger({
  transports: [
    new transports.File({ filename: "log/express_error.log", level: "error" }),
  ],
  format: combine(prettyPrint()),
});

module.exports = {
  expressWinstonLogger,
  expressWinstonErrorLogger,
};
