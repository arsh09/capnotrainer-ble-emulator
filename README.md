# CapnoTrainer P6.0 BLE Simulator

### Introduction: 

This project uses *bleno-mac* to simulate the ble services and characteristics of CapnoTrainer P6.0 device. 
This helps in testing the devive desktop and mobile software in case of device absence. 

### Setup 

You will require node v10.22.0 as this node version was used for testing. 

### Run 

Start your Bluetooth on MacOS 

```bash
$ cd ~/Documents/
$ git clone -b main https://github.com/arsh09/capnotrainer-ble-emulator.git
$ cd capnotrainer-ble-emulator
$ npm install
$ npm run capno
```

### Testing and Usage: 

You can install LightBlue or nrfConnect app on your phone. Once you run this code, you can see a new bluetooth device which is advertising with the name as in *capno_ble_simulator.js* deviceName variable. 

There will be one service starting with this UUID: 6e400001b5a3f393e0a9e50e24dcca9e
Under this service, there will be two characterisitics with the following UUID: 

- Write Characterisitics UUID: 6e400002b5a3f393e0a9e50e24dcca9e
- Read Characterisitics UUID: 6e400003b5a3f393e0a9e50e24dcca9e

Use the bluetooth document to see how to use it. 

### BLE Cache:

As the advertisement name (deviceName) will always be in the form: Capno-XXXX where XXXX are 4 numbers that represents device serial ID in hex-format. This serial id is required to check if the device is registered or not. You can extract this name. 

Also, it may be possible that this name is cached in the MacOS and if you change this name and run the code, it may not changed (i.e. LightBlue or nrfConnect or your other side App-code still shows the previous name). 

To clear your Bluetooth cache from your MacOS, you can do this from a terminal: 

1) Turn off the bluetooth on your MacOS

2) Run these commands in a terminal
```bash
$ cd /Library/Preferences/
$ sudo rm -r com.apple.Bluetooth <tab-complete and delete the plist file>
$ cd ~/Library/Preferences/ByHost/
$ sudo rm -r com.apple.Bluetooth <tab-complete and delete the plist file>
```

3) Turn on the Bluetooth again.

4) Run the code again.