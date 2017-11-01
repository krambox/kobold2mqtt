#!/usr/bin/env node
var kobold = require('node-kobold');

require('require-yaml');

// Load config from path in km200_config
console.log('Starting kobold to mqtt');
if (process.env.koboldconfig == null) {
  console.error('Missing enviroment variable km200config');
  process.exit(-1);
}
console.log('Config file: ' + process.env.koboldconfig);
var config = require(process.env.koboldconfig);
console.log(config.kobold);

var client = new kobold.Client();

function stateUpdate (robot) {
  robot.getState(function (error, result) {
    if (!error) {
      var state = {
        ts: Math.floor(new Date() / 1000),
        isCahrging: robot.isCharging,
        isDocked: robot.isDocked,
        isScheduleEnabled: robot.isScheduleEnabled,
        charge: robot.charge,
        state: result.state, // cleaning:2 //pause:3 //stop:1
        action: result.action // cleaning:1 /pause:1 //stop:0
      };
      console.log(state);
      console.log(result);
    } else {
      console.error(error);
    }
  });
}

// authorize
client.authorize(config.kobold.user, config.kobold.password, false, function (error) {
  if (error) {
    console.error(error);
    return;
  }
  // get your robots
  client.getRobots(function (error, robots) {
    if (error) {
      console.error(error);
      return;
    }
    if (robots.length) {
      var robot = robots[0];
      robot.pauseCleaning(function (error, result) {
        console.log('command', error, result);
      });
      console.log(robot.name);
      stateUpdate(robot);
    }
  });
});
