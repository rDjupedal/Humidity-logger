export class Sensor {
    constructor(data, sensorId) {
        this.debug = false;

        // Extracts data for current sensor id
        if (this.debug) console.debug('method sensor.setData invoked.. ID:  ' + sensorId);

        this.id     = sensorId;
        this.date   = [];
        this.time   = [];
        this.temp   = [];
        this.rh     = [];

        if (!data) return;

        for (let i = 0; i < data.length; i++) {
            // Loop thru all readings and store data only for current sensor
            if (data[i].split(",")[2] == this.id) {
                this.date.push(data[i].split(",")[0]);
                this.time.push(data[i].split(",")[1]);
                this.temp.push(data[i].split(",")[3]);
                this.rh.push(data[i].split(",")[4]);
            }

            if (this.debug) {
                console.debug('date: ' + data[i].split(",")[0]);
                console.debug('time: ' + data[i].split(",")[1]);
                console.debug('sensor: ' + data[i].split(",")[2]);
                console.debug('temp: ' + data[i].split(",")[3]);
                console.debug('rh: ' + data[i].split(",")[4]);
            }

        }
        if (this.debug) console.debug('Sensor id: ' + this.id + ' has ' + this.date.length + ' readings..');

    }

    printData() {
        console.debug('printing ' + this.date.length + ' readings for sensor ' + this.id);
        for (let i = 0; i < this.date.length; i++) {
            console.debug(i + '  ' + this.date[i] + '  ' + this.time[i] + '  ' + this.temp[i] + '  ' + this.rh[i]);
        }
    }
}