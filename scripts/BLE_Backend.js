var BLE_Server;
var currently_sending;

function isWebBluetoothEnabled() {
    // this is what generates the BLE pop up searching window
    display_msg = "Waiting";
    navigator.bluetooth.requestDevice({
        filters: [{
            namePrefix: 'KEG'
        }],
        optionalServices: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"]
    })

    .then(device => {
        return device.gatt.connect();
    })
    .then(server => {
        BLE_Server = server;
        console.log("Connected");
        return server.getPrimaryService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
    })
    // .then(service => {
    //     return service.getCharacteristic("beb5483e-36e1-4688-b7f5-ea07361b26a8");
    // })
    // .then(characteristic => {
    //     if (characteristic.properties.notify){
    //         characteristic.addEventListener("characteristicvaluechanged",handleNewData);
    //         characteristic.startNotifications();
    //         console.log("listening for incoming data");
    //     }
    //     return 0;
    // })
    .then(server => { /* … */ })
    .catch(error => { console.error(error); });
}


function sendMSG(msg){
    console.log("Sending : " + msg);
    currently_sending = msg;
    BLE_Server.getPrimaryService("4fafc201-1fb5-459e-8fcc-c5c9c331914b")
    .then(service => {
        return service.getCharacteristic("da1e7d98-916b-11ed-a1eb-0242ac120002");
    })
    .then(characteristic => {
        var enc = new TextEncoder();
        characteristic.writeValue(enc.encode(msg));
    })
    .catch(error => { console.error(error); });
}


async function handleNewData(event){
    const value = event.target.value;
    var enc = new TextDecoder("utf-8");
    var readings = enc.decode(value);
    var split_readings;
    console.log(readings);
    console.log(readings.length);
    try{
        split_readings = readings.split(',');
        console.log(split_readings[0]);
        currentAX = parseInt(split_readings[0]);
        currentAY = parseInt(split_readings[1]);
        currentCX = parseInt(split_readings[2]);
        currentCY = parseInt(split_readings[3]);
    }
    catch(err){
        console.log(err.message);
    }
}

function AnalogCalibCallback(event){
    const value = event.target.value;
    var enc = new TextDecoder("utf-8");
    var readings = enc.decode(value);
    var split_readings;
    try{
        split_readings = readings.split(':');
        for(let i=0;i<3;i++){
            Curr_AX_Cal_Vals[i] = split_readings[0].split(',')[i];
        }
        for(let i=0;i<3;i++){
            Curr_AY_Cal_Vals[i] = split_readings[1].split(',')[i];
        }
        for(let i=0;i<3;i++){
            Curr_CX_Cal_Vals[i] = split_readings[2].split(',')[i];
        }
        for(let i=0;i<3;i++){
            Curr_CY_Cal_Vals[i] = split_readings[3].split(',')[i];
        }
        sendMSG("A");
    }   
    catch(err){
        console.log(err.message);
    }
}