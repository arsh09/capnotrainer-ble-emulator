var util = require("util");
var bleno = require("bleno-mac");

// --------------------------------------------------//
// ------------------ CAPNO SIMULATOR ---------------//
// --------------------------------------------------//
var deviceName = "Capno-255" // device name will always be Capno-XXXX where XXXX is serial id in hex
var isSubscribed = false
var isSendCalibration = false
var isDataStreamingOn = false
var doStopAdvertisement = false
const writeLength = 20
const readLength = 60
var dataToWrite = Buffer.alloc(writeLength, 0x00)
var dataToSend = Buffer.alloc(readLength, 0x00)

// variables to create random sine waves 
const sineCo2Frequency = 0.2
const sineCo2Amplitude = 17
var totalSamples = 0


// --------------------------------------------------//
// ------------------ READ/NOTIFY -------------------//
// --------------------------------------------------//
var BlenoCharacteristic = bleno.Characteristic;

var ReadCharacteristic = function() {
    ReadCharacteristic.super_.call(this, {
    uuid: "6e400003b5a3f393e0a9e50e24dcca9e",
    properties: ["read", "notify"],
    value: null
  });


  this._value = new Buffer.alloc(1,0x00);
  this._updateValueCallback = null;
};

util.inherits(ReadCharacteristic, BlenoCharacteristic);


ReadCharacteristic.prototype.onReadRequest = function (offset, callback) {
    console.log('CapnoTrainer BLE onReadRequest');
    
    // Device like data
    var data = new Buffer.alloc(60,0);
	callback(this.RESULT_SUCCESS, data);
};

ReadCharacteristic.prototype.onSubscribe = function(
    maxValueSize,
    updateValueCallback
  ) {
    console.log("ReadCharacteristic - onSubscribe");
    // isSubscribed = true
    delayedNotification(updateValueCallback);
    this._updateValueCallback = updateValueCallback;
};
  
ReadCharacteristic.prototype.onUnsubscribe = function() {
    console.log("ReadCharacteristic - onUnsubscribe");
    isSubscribed = false
    this._updateValueCallback = null;
};

function delayedNotification(callback) {
	setTimeout(function() { 
		if (isSubscribed) 
        {   
            if (isSendCalibration)
            {
                isSendCalibration = false
                if (!isDataStreamingOn)
                {
                  isSubscribed = false
                }
                calibrationData = new Buffer.alloc(readLength, 0xff)
                calibrationData.writeUInt8( 0x77, 0 );
                
              callback(calibrationData)
            }
            else
            {
              // pressure, humidity, temperature, bits/minute
              var pressure = 30 // in-Hg
              var humidity = 50 // % 
              var temperature = 30 // celsius
              var battery = 60 // %
              var bpm = 100
              var frames = totalSamples
              // loop to fill in the values
              for (var i = 0; i < parseInt( readLength / 2) ; i++)
              {
                var index = i * 2
                if ( i % 3 == 0)
                {
                    // generate sine value samples (mm-Hg)
                    var time = ( totalSamples / 50 )
                    var sampleCo2 = (Math.sin( 2 * Math.PI * sineCo2Frequency * time ) ) * sineCo2Amplitude + sineCo2Amplitude 
                    totalSamples += 1
                    console.log("Samples: ", sampleCo2)
                    // ppg 
                    var samplePpg = 50                    
                    // each sensor value is 2-byte.
                    // for each 60 byte in 200-mileseonds, there are 10 CO2 samples at 0, 6, 12, ... 54. 
                    dataToSend.writeUInt16BE( sampleCo2, index)                  
                }
                else if ( (i - 1) % 3 === 0)
                {
                  // for each 60 byte in 200-mileseonds, there are 10 PPG samples at 2, 8, 16, ... 56. 
                  dataToSend.writeUInt16BE( samplePpg, index ) 
                }
                else if ( i == 2 || i == 17 )
                {
                  dataToSend.writeUInt16BE( temperature, index ) 
                }
                else if ( i == 5 || i == 20 )
                {
                  dataToSend.writeUInt16BE( humidity, index) 
                }
                else if ( i == 8 || i == 23 )
                {
                  dataToSend.writeUInt16BE( pressure, index) 
                }
                else if ( i == 11 || i == 26 )
                {
                  dataToSend.writeUInt16BE( bpm, index) 
                }
                else if ( i == 14 )
                {
                  dataToSend.writeUInt16BE( battery, index) 
                }
                else if ( i == 29 )
                {
                  dataToSend.writeUInt16BE( frames, index) 
                }
              }
              callback(dataToSend)
            }			
		}
    delayedNotification(callback);
   

	}, 200 );
}

// --------------------------------------------------//
// ------------------ WRITE -------------------------//
// --------------------------------------------------//
var WriteCharacteristic = function() {
    WriteCharacteristic.super_.call(this, {
    uuid: "6e400002b5a3f393e0a9e50e24dcca9e",
    properties: ["write", "writeWithoutResponse"],
    value: null
  });


  this._value = new Buffer.alloc(1,0x00);
  this._updateValueCallback = null;
};

util.inherits(WriteCharacteristic, BlenoCharacteristic);

WriteCharacteristic.prototype.onWriteRequest = function(
  data,
  offset,
  withoutResponse,
  callback
) {
  this._value = data;

  console.log("Write Request Received: ", this._value, this._value.readUInt8(0))
  if (this._value.length <= writeLength)
  {
    if (this._value.readUInt8(0) == 0x8F)
    {
        // Start data stream 
        isSubscribed = true
        isSendCalibration = false
        isDataStreamingOn = true
        totalSamples = 0;
        console.log("Start data streaming now...")
    }
    else if (this._value.readUInt8(0) == 0xF8)
    {
        // stop data stream 
        isSubscribed = false
        isSendCalibration = false
        isDataStreamingOn = false
        console.log("Stop data streaming now...\nSend: ", totalSamples, " samples")        
    } else if (this._value.readUInt8(0) == 0x80)
    {
        // send calibration data
        isSendCalibration = true
        isSubscribed = true
        console.log("Send calibration data now...")        
    }
  }

  callback(this.RESULT_SUCCESS);
};


// --------------------------------------------------//
// ------------------ SERVICE -----------------------//
// --------------------------------------------------//
const BlenoPrimaryService = bleno.PrimaryService;

console.log("bleno - " + deviceName);

bleno.on("stateChange", function(state) {
  console.log("on -> stateChange: " + state);

  if (state === "poweredOn") {
    bleno.startAdvertising(deviceName, ["6e400001b5a3f393e0a9e50e24dcca9e"]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on("advertisingStart", function(error) {
  console.log(
    "on -> advertisingStart: " + (error ? "error " + error : "success")
  );

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: "6e400001b5a3f393e0a9e50e24dcca9e",
        characteristics: [new WriteCharacteristic(), new ReadCharacteristic()]
      })
    ]);
  }
});


bleno.on('connect', function(error)
{
  if (error) { console.log("Connection error!")}
  console.log("Connected!!")
});