#!/usr/bin/env node
var kobold = require('node-kobold');
var mqtt = require('mqtt');
require('require-yaml');

// Load config from path in koboldconfig
console.log('Starting kobold to mqtt');
if (process.env.koboldconfig == null) {
  console.error('Missing enviroment variable km200config');
  process.exit(-1);
}
console.log('Config file: ' + process.env.koboldconfig);
var config = require(process.env.koboldconfig);
console.log(config.kobold);

console.log('Connect mqtt: ' + config.mqtt.server);
var mqttCon = mqtt.connect(config.mqtt.server);

mqttCon.on('connect', () => {
  mqttCon.subscribe('vr200/set/#');
});

var robot;
var robotState = 0;
var robotDock = true;

function stateUpdate(done) {
  if (robot) {
    robot.getState(function (error, result) {
      if (!error) {
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
        mqttCon.publish('vr200/status/' + robot.name, JSON.stringify(state), { retain: true }, function () {
          // console.log(topic, value)
        });
        if (done) {
          done();
        }
      } else {
        console.error(error);
      }
    });
  }
}

mqttCon.on('message', (topic, message) => {
  console.log(topic, message.toString());
  if (topic.startsWith('vr200/set/')) {
    let name = topic.substring(10);
    if (name !== robot.name) {
      console.error('Wrong robot: ' + name + ' found ' + robot.name);
    }
    let value = message.toString();
    switch (value) {
      case 'start':
        robot.startCleaning((err, result) => {
          if (err) console.error('Start ' + err, result);
          else console.log('Start ' + result);
          stateUpdate();
        });
        break;
      case 'stop':
        robot.stopCleaning((err, result) => {
          if (err) console.error('Stop ' + err, result);
          else console.log('Stop ' + result);
          stateUpdate();
        });
        break;
      case 'pause':
        robot.pauseCleaning((err, result) => {
          if (err) console.error('Pause ' + err, result);
          else console.log('Pause ' + result);
          stateUpdate();
        });
        break;
      case 'resume':
        robot.resumeCleaning((err, result) => {
          if (err) console.error('Resume ' + err, result);
          else console.log('Resume ' + result);
          stateUpdate();
        });
        break;
      case 'dock':
        stateUpdate(() => {
          if (!robotDock) {
            if (robotState === 3) {
              robot.sendToBase((err, result) => {
                if (err) console.error('Dock ' + err, result);
                else console.log('Dock ' + result);
                stateUpdate();
              });
            } else if (robotState === 2) {
              robot.pauseCleaning(() => {
                stateUpdate(() => {
                  robot.sendToBase((err, result) => {
                    if (err) console.error('Dock ' + err, result);
                    else console.log('Dock ' + result);
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
                        if (err) console.error('Dock ' + err, result);
                        else console.log('Dock ' + result);
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
        console.error('Unknown command: ' + value);
        break;
    }
  }
});

var client = new kobold.Client();

// authorize
console.log('Connect kr200');
client.authorize(config.kobold.user, config.kobold.password, false, function (error) {
  if (error) {
    console.error(error);
    return;
  }
  console.log('connected');
  // get your robots
  client.getRobots(function (error, robots) {
    if (error) {
      console.error(error);
      return;
    }
    if (robots.length) {
      robot = robots[0];

      console.log('Found: ' + robot.name);
      stateUpdate();
    } else {
      console.error('No robots found!');
    }
  });
});

setInterval(stateUpdate, 60000);
