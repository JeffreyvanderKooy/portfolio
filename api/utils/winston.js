// # ________________________________IMPORTS______________________________________ # //
const { createLogger, format } = require('winston');
const { combine, timestamp, printf } = format;
const axios = require('axios');
const Transport = require('winston-transport');

// # ________________________________CONFIG DATADOG CONNECTION______________________________________ # //

// Sends data to Datadogs server for logging
const sendDatadog = async payload => {
  const { level, message, timestamp, stack } = payload;

  const messageDate = `[${level}] --  ${message} -- [${new Date().toISOString()}] ${
    stack ? `\n ${stack}` : ''
  }`;
  console.log(messageDate);
  const data = [
    {
      level: level,
      message: messageDate,
      service: process.env.DD_APP_NAME,
      ddsource: 'nodejs',
      ddtags: `env:${process.env.NODE_ENV}`,
      timestamp: timestamp,
    },
  ];

  return await axios.post(
    'https://http-intake.logs.datadoghq.eu/api/v2/logs',
    data,
    {
      headers: {
        'DD-API-KEY': process.env.DD_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
};

/**
 * @class
 * @description creates a custom transport to mount on the logger, sends logs in form of HTTP request to the Datadog API
 */
class DDTransport extends Transport {
  log(payload, cb) {
    // Call datadog messages
    sendDatadog(payload);
    cb(null);
  }
}

// # ________________________________CONFIG LOGGER______________________________________ # //

const logger = createLogger({
  level: 'info',
  format: combine(timestamp()),
  transports: [new DDTransport()],
});

module.exports = logger;
