# VR200 to mqtt

Written and (C) Kai Kramer on top of https://github.com/nicoh88/node-kobold from Arne Blumentritt and Nico Hartung. Build with https://github.com/hobbyquaker/xyz2mqtt-skeleton from Sebastian Raff.

Provided under the terms of the MIT license.

## Overview 

kobold2mqtt is a gateway between a Kobold VR200 Buderus internet gateway and MQTT with the  https://github.com/mqtt-smarthome topic and payload format.

## Installation

The recommended away is via docker hub.

    docker run --env-file ./vk200.env -it km200 krambox/kobold2mqtt

Or via direct call

    ./km200mqtt.js -u mqtt://192.168.1.13 -k 192.168.1.162 -e <EMail> -p <pwd>

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