const bleno = require("bleno-mac");
const WriteCharacteristic = require("./capno_char_write");
const ReadCharacteristic = require("./capno_char_read");
const BlenoPrimaryService = bleno.PrimaryService;

console.log("bleno - Capno-XXXX");

bleno.on("stateChange", function(state) {
  console.log("on -> stateChange: " + state);

  if (state === "poweredOn") {
    bleno.startAdvertising("Capno-XXXX", ["6e400002b5a3f393e0a9e50e24dcca9e"]);
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
        uuid: "6e400002b5a3f393e0a9e50e24dcca9e",
        characteristics: [new WriteCharacteristic(), new ReadCharacteristic()]
      })
    ]);
  }
});
