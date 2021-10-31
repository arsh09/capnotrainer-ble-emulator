var util = require("util");
var bleno = require("bleno-mac");

var BlenoCharacteristic = bleno.Characteristic;

var WriteCharacteristic = function() {
    WriteCharacteristic.super_.call(this, {
    uuid: "6e400002b5a3f393e0a9e50e24dcca9e",
    properties: ["write", "writeWithoutResponse"],
    value: null
  });


  this._value = new Buffer(0);
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

  console.log(
    "WriteCharacteristic - onWriteRequest: value = " +
      this._value.toString("hex")
  );
  if (this._updateValueCallback) {
    console.log("WriteCharacteristic - onWriteRequest: notifying");

    this._updateValueCallback(this._value);
  }
  callback(this.RESULT_SUCCESS);
};


module.exports = WriteCharacteristic;
