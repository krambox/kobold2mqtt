var pkg = require('./package.json');
var config = require('yargs')
  .env('VR200')
  .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
  .describe('v', 'possible values: "error", "warn", "info", "debug"')
  .describe('n', 'instance name. used as mqtt client id and as prefix for connected topic')
  .describe('u', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
  .describe('e', 'Vorkwer user email (old auth using password)')
  .describe('p', 'Vorwerk password (old auth using password)')
  .describe('t', 'Vorwerk token (OAuth2 for i.e. MyKobold app)')
  .alias({
    'h': 'help',
    'n': 'name',
    'u': 'url',
    'e': 'email',
    'p': 'password',
    't': 'token',
    'v': 'verbosity'
  })
  .default({
    'u': 'mqtt://127.0.0.1',
    'n': 'vr200',
    'v': 'info'
  })
  .version()
  .help('help')
  .argv;

module.exports = config;
