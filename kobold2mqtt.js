#!/usr/bin/env node
var pkg = require('./package.json');
var kobold = require('node-kobold');
var Mqtt = require('mqtt');
var log = require('yalm');
var config = require('./config.js');

var mqttConnected;

log.setLevel(config.verbosity);

log.info(pkg.name + ' ' + pkg.version + ' starting');
log.info('mqtt trying to connect', config.url);

var mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0', retain: true}});

mqtt.on('connect', function () {
  mqttConnected = true;

  log.info('mqtt connected', config.url);
  mqtt.publish(config.name + '/connected', '1', {retain: true});

  log.info('mqtt subscribe', config.name + '/set/#');
  mqtt.subscribe(config.name + '/set/#');

  authorizeVorwerk();
});

mqtt.on('close', function () {
  if (mqttConnected) {
    mqttConnected = false;
    log.info('mqtt closed ' + config.url);
  }
});

mqtt.on('error', function (err) {
  log.error('mqtt', err);
});

var robot;
var robotState = 0;
var robotDock = true;

function stateUpdate (done) {
  log.debug('request state');
  if (robot) {
    robot.getState(function (error, result) {
      if (!error) {
        log.debug('state', result);
        var state = {
          ts: Math.floor(new Date() / 1000),
          isCahrging: robot.isCharging,
          isDocked: robot.isDocked,
          isScheduleEnabled: robot.isScheduleEnabled,
          charge: robot.charge,
          state: result.state, // cleaning:2 //pause:3 //stop:1
          action: result.action // cleaning:1 /pause:1 //stop:0 //docking:4 charging:6
        };
        robotState = result.state;
        robotDock = robot.isDocked;
        switch (result.state) {
          case 1:
            state.state = 'stopped';
            break;
          case 2:
            state.state = 'running';
            break;
          case 3:
            state.state = 'paused';
            break;
          default:
            state.state = result.state;
        }
        mqtt.publish(config.name + '/status/' + robot.name, JSON.stringify(state), { retain: true }, function () {
          log.debug('Publich to:' + config.name + '/status/' + robot.name + ' value: ' + JSON.stringify(state));
        });
        if (done) {
          done();
        }
      } else {
        log.error(error);
      }
    });
  }
}

mqtt.on('message', (topic, message) => {
  log.info(topic, message.toString());
  let prefix = config.name + '/set/';
  if (topic.startsWith(prefix)) {
    let name = topic.substring(prefix.length);
    if (name !== robot.name) {
      log.error('Wrong robot: ' + name + ' found ' + robot.name);
    }
    let value = message.toString();
    switch (value) {
      case 'start':
        robot.startCleaning((err, result) => {
          if (err) log.error('Start ' + err, result);
          else log.info('Start ' + result);
          stateUpdate();
        });
        break;
      case 'stop':
        robot.stopCleaning((err, result) => {
          if (err) log.error('Stop ' + err, result);
          else log.info('Stop ' + result);
          stateUpdate();
        });
        break;
      case 'pause':
        robot.pauseCleaning((err, result) => {
          if (err) log.error('Pause ' + err, result);
          else log.info('Pause ' + result);
          stateUpdate();
        });
        break;
      case 'resume':
        robot.resumeCleaning((err, result) => {
          if (err) log.error('Resume ' + err, result);
          else log.info('Resume ' + result);
          stateUpdate();
        });
        break;
      case 'dock':
        stateUpdate(() => {
          if (!robotDock) {
            if (robotState === 3) {
              robot.sendToBase((err, result) => {
                if (err) log.error('Dock ' + err, result);
                else log.info('Dock ' + result);
                stateUpdate();
              });
            } else if (robotState === 2) {
              robot.pauseCleaning(() => {
                stateUpdate(() => {
                  robot.sendToBase((err, result) => {
                    if (err) log.error('Dock ' + err, result);
                    else log.info('Dock ' + result);
                    stateUpdate();
                  });
                });
              });
            } else if (robotState === 1) {
              robot.startCleaning(() => {
                stateUpdate(() => {
                  robot.pauseCleaning(() => {
                    stateUpdate(() => {
                      robot.sendToBase((err, result) => {
                        if (err) log.error('Dock ' + err, result);
                        else log.info('Dock ' + result);
                        stateUpdate();
                      });
                    });
                  });
                });
              });
            }
          }
        });
        break;
      default:
        log.error('Unknown command: ' + value);
        break;
    }
  }
});

var client = new kobold.Client();
function authorizeVorwerk () {
  // authorize
  log.info('Connect kr200');
  client.authorize(config.email, config.password, false, function (error) {
    if (error) {
      log.error(error);
      return;
    }
    log.info('connected');
    // get your robots
    client.getRobots(function (error, robots) {
      if (error) {
        log.error(error);
        return;
      }
      if (robots.length) {
        mqtt.publish(config.name + '/connected', '1', {retain: true});
        robot = robots[0];

        log.info('Found: ' + robot.name);
        stateUpdate();
        setInterval(stateUpdate, 60000);
      } else {
        log.error('No robots found!');
      }
    });
  });
}
