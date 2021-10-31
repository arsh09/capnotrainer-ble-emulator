var util = require("util");
var bleno = require("bleno-mac");

var BlenoCharacteristic = bleno.Characteristic;

var ReadCharacteristic = function() {
    ReadCharacteristic.super_.call(this, {
    uuid: "6e400003b5a3f393e0a9e50e24dcca9e",
    properties: ["read", "notify"],
    value: null
  });


  this._value = new Buffer(0);
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
    console.log("EchoCharacteristic - onSubscribe");
    isSubscribed = true
    delayedNotification(updateValueCallback);
    this._updateValueCallback = updateValueCallback;
};
  
ReadCharacteristic.prototype.onUnsubscribe = function() {
    console.log("EchoCharacteristic - onUnsubscribe");
    isSubscribed = false
    this._updateValueCallback = null;
};


isSubscribed = false
function delayedNotification(callback) {
	setTimeout(function() { 
		if (isSubscribed) 
        {
            console.log("Subscribed : ", isSubscribed);
            var data = Buffer.alloc(60, 0);
			callback(data);
			delayedNotification(callback);
		}

	}, 200 );
}


module.exports = ReadCharacteristic;
