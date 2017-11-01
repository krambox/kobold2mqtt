# mqtt-km200

## Config

config.yml example

```
kobold:
  user: <email>
  password: <password>
mqtt:
  server: mqtt://<hostname>
```

## Docker

    docker build -t kobold2mqtt .

    docker run --env km200config=/data/config.yml  -v /Volumes/data/smarthome:/data -it kobold2mqtt 
