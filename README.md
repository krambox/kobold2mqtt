# VR200 to mqtt

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![NPM version](https://badge.fury.io/js/kobold2mqtt.svg)](http://badge.fury.io/js/kobold2mqtt)
[![Dependency Status](https://img.shields.io/gemnasium/krambox/kobold2mqtt.svg?maxAge=2592000)](https://gemnasium.com/github.com/krambox/kobold2mqtt)
[![Build Status](https://travis-ci.org/krambox/kobold2mqtt.svg?branch=master)](https://travis-ci.org/krambox/kobold2mqtt)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Written and (C) Kai Kramer on top of https://github.com/nicoh88/node-kobold from Arne Blumentritt and Nico Hartung. Build with https://github.com/hobbyquaker/xyz2mqtt-skeleton from Sebastian Raff.

Provided under the terms of the MIT license.

## Overview

kobold2mqtt is a gateway between a Kobold VR200 vacuum and MQTT with the  https://github.com/mqtt-smarthome topic and payload format.

## Prerequisites

If you use the MyKobold app, you will probably need to login via OAuth2. For this you will have to 
obtain a token. Instructions for obtaining such a token can be found
[here](https://github.com/nicoh88/node-kobold).

## Installation

The recommended away is via docker hub.

    docker run --rm --env-file ./vr200.env -it krambox/kobold2mqtt

Or via direct call

    ./kobold2mqtt.js -u mqtt://192.168.1.13 -e <EMail> -p <pwd>

Or via direct call (OAuth2 token)

    ./kobold2mqtt.js -u mqtt://192.168.1.13 -t <token>

## Config

Example Env file for docker run --env-file

    VR200_url=mqtt://192.168.1.13
    VR200_password=<Vorwerk password>
    VR200_email=<Vorwerk username>

Example Env file for docker run --env-file with OAuth2


    VR200_url=mqtt://192.168.1.13
    VR200_token=<Vorwerk token>


## Start

Set env variable koboldconfig to config.yml

Start kobold2mqtt.js

## Docker

    docker build -t kobold2mqtt .

    docker run --rm --env-file ./vr200.env -it kobold2mqtt

## Topics

kobold2mqtt respects the smarthome2mqtt scheme and exposes the vacuum cleaners state exemplarily:

    Topic: vr200/status/<Kobold Name> 
    
    Message:
    {
      "ts": 1575615863,
      "isCharging": false,
      "isDocked": true,
      "isScheduleEnabled":true,
      "charge":93,
      "state":"stopped",
      "action":0
    }

Changing the state is possible with the following set values on topic vr200/set/<Kobold Name>:

- start
- stop
- pause
- resume
- doc

So to start the Vorwerk200, publish this message:

    Topic: vr200/set/<Kobold Name>
    Message: start


