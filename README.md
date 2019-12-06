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


## Installation

The recommended away is via docker hub.

    docker run --env-file ./vk200.env -it km200 krambox/kobold2mqtt

Or via direct call

    ./kobold200mqtt.js -u mqtt://192.168.1.13 -k 192.168.1.162 -e <EMail> -p <pwd>

## Config

Example Env file for docker run --env-file

```
VR200_url=mqtt://192.168.1.13
KM200_password=<Vorwerk password>
KM200_email=<Vorwerk username>
```

## Start

Set env variable koboldconfig to config.yml

Start kobold2mqtt.js

## Docker

    docker build -t kobold2mqtt .

    docker run --env-file ./vk200.env -it kobold2mqtt

## Topics

kobold2mqtt respects the smarthome2mqtt scheme and exposes the vacuum cleaners state exemplarily:

    vr200/status/<Kobold Name> {"ts":1575615863,"isCahrging":false,"isDocked":true,"isScheduleEnabled":true,"charge":93,"state":"stopped","action":0}

Changing the state is possible with the following set values on topic vr200/set/<Kobold Name>:

- start
- stop
- pause
- resume
- doc
