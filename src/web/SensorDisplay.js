export class SensorDisplay extends HTMLElement {
    display;           // Root of this HTML element
    canvas;
    context;
    checkbox_rh;
    checkbox_temp;
    label;
    _callback;         // Function used for callback, updating settings and saving cookies
    _position;         // The position of this sensor in the parent's container
    _positions;        // Array of sensors (id and label)
    _sensor;           // The Sensor object related to this display
    _sensors;          // All available sensors
    SM;
    HM;


    /**
     * Called when element is initialized
     */
    constructor() {
        super();
/*
        this.innerHTML = `
            <canvas id="canvas"></canvas>
            <h1>TEST</h1>
 */

        this.canvas = document.createElement("canvas");
        //this.canvas.width = 600;
        //this.canvas.height = 200;
        this.context = this.canvas.getContext("2d");
        this.display = document.createElement("div");
        this.display.classList.add("sensordisplay");
        this.display.classList.add("grid");
        //this.display.appendChild(this.canvas);
        this.SM = 60;
        this.HM = 20;
    }

    /**
     * Set up all necessary information for the sensor view
     * @param configuration see inline comments
     */
    set setup(configuration) {
        this._callback = configuration.callback;            // callback function to signal change has been done
        this._positions = configuration.sensorPositions;    // Selected sensors, their labels and positions
        this._position = configuration.position;            // Position of the current sensor
        this.label = this._positions[this._position].label;
        this._sensors = configuration.sensors;              // All available sensors

        // Find the current sensor in the array
        for (let s of this._sensors) {
            if (s.id == this._positions[this._position].id) this._sensor = s;
        }
    }

    /**
     * Called when element is added to document
     */
    connectedCallback() {
        this.appendChild(this.display);
    }

    /**
     * Tell the browser to observe these attributes
     * @returns {string[]} array of attributes
     */
    static get observedAttributes() {
        return ["sensor"];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        // console.log(`${property} was changed from ${oldValue} to ${newValue}..`);
    }

    showDigits() {

        // Clear the display
        this.display.innerHTML = "";

        const lastIndex = this._sensor.date.length - 1;

        const rh = document.createElement("div");
        rh.appendChild(document.createTextNode(`${ this._sensor.rh[lastIndex] }%`));

        const temp = document.createElement("div");
        temp.appendChild(document.createTextNode(`${ this._sensor.temp[lastIndex] }°`));

        const label = document.createElement("div");
        label.appendChild(document.createTextNode(`${this._sensor.id} ${this.label || "---"}`));

        const updated = document.createElement("div");
        updated.appendChild(document.createTextNode(`${ this._sensor.date[lastIndex]} ${this._sensor.time[lastIndex]}`));

        const preceding = document.createElement("div");
        preceding.appendChild(document.createTextNode(`Previous (${this._sensor.time[lastIndex-1]})\t ${this._sensor.rh[lastIndex-1]}%  ${this._sensor.temp[lastIndex-1]}°`));

        rh.id = "rhdigit";
        temp.id ="tempdigit";
        updated.id = "lastupdate";
        label.id = "label";
        preceding.id = "preceding";

        updated.classList.add("text");
        label.classList.add("text");
        preceding.classList.add("text");

        this.display.appendChild(rh);
        this.display.appendChild(temp);
        this.display.appendChild(label);
        this.display.appendChild(updated);
        this.display.appendChild(preceding);

        label.addEventListener("click", this.showSettings.bind(this));
        preceding.addEventListener("click", this.showChart.bind(this));
    }

    showSettings() {
        // Clear the display
        this.display.innerHTML = "";

        // Selection
        const selection = document.createElement("SELECT");
        let sensorIds = [];
        for (let s of this._sensors) sensorIds.push(s.id);

        for (let i = 0; i < sensorIds.length; i++) {
            selection.innerHTML += '<option value="' + sensorIds[i] + '">' + sensorIds[i] + '</option>';
        }

        // Set default selection
        selection.value = this._sensor ? this._sensor.id : this._positions[0].id;

        // Label
        const label = document.createElement("input");
        label.type = "text";
        label.value = this.label;

        // Save button
        const saveBtn = document.createElement("button");
        saveBtn.classList.add("settingButtons");
        saveBtn.textContent = "SAVE";
        saveBtn.addEventListener("click", function() {

            // Saving sensorid and label for this position
            this._positions[this._position] = {
                id: selection.value,
                label: label.value
            };

            this._callback();
        }.bind(this), false);

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.classList.add("settingButtons");
        delBtn.textContent = "DELETE";
        delBtn.addEventListener("click", function() {
            console.log("before delete " + this._positions);
            this._positions.splice(this._position, 1);
            console.log("after delete " + this._positions);
            this._callback();
        }.bind(this), false);

        this.display.appendChild(label);
        this.display.appendChild(selection);
        this.display.appendChild(saveBtn);
        this.display.appendChild(delBtn)

        label.style['grid-column'] = 2;
        label.style['grid-row'] = 1;
        selection.style['grid-column'] = 1;
        selection.style['grid-row'] = 1;
        saveBtn.style['grid-column'] = 1;
        saveBtn.style['grid-row'] = 3;
        delBtn.style['grid-column'] = 2;
        delBtn.style['grid-row'] = 3;

    }

    showChart() {

        // If a sensor doesn't exist
        if (!this._sensor) {
            console.log("sensor doesnt exist");
            return;
        }

        // Clear and set up the display
        this.display.innerHTML = "";

        // Set the canvas size to the same as its container
        const size = this.display.getBoundingClientRect();
        this.canvas.width = size.width;
        this.canvas.height = size.height - 20;
        this.display.appendChild(this.canvas);
        this.display.classList.add("sensordisplay");
        this.display.classList.add("relative");

        this.canvas.addEventListener("click", this.putDisplay.bind(this));

        // CHECKBOXES
        const tempRhDiv = document.createElement("div");
        tempRhDiv.id = "tempRhDiv";
        this.checkbox_rh = document.createElement("input")
        this.checkbox_temp = document.createElement("input");
        const chk_rh_label = document.createElement("label");
        const chk_temp_label = document.createElement("label");
        this.checkbox_rh.type = "checkbox";
        this.checkbox_rh.id = "rhid";
        this.checkbox_temp.type = "checkbox";
        this.checkbox_temp.id = "tempid";
        chk_rh_label.htmlFor = "rhid";
        chk_temp_label.htmlFor = "tempid";
        chk_rh_label.appendChild(document.createTextNode("RH"));
        chk_temp_label.appendChild(document.createTextNode("TEMP"));
        tempRhDiv.appendChild(this.checkbox_rh);
        tempRhDiv.appendChild(chk_rh_label);
        tempRhDiv.appendChild(this.checkbox_temp);
        tempRhDiv.appendChild(chk_temp_label);

        this.checkbox_rh.checked = true;
        this.checkbox_temp.checked = true;
        this.checkbox_rh.addEventListener("click", function() { this.drawChartBase() }.bind(this));
        this.checkbox_temp.addEventListener("click", function() { this.drawChartBase() }.bind(this));
        this.display.appendChild(tempRhDiv);

        // ID & LABEL
        const idLabelDiv = document.createElement("div");
        idLabelDiv.id = "idLabelDiv";
        const txt = document.createElement("p");
        txt.innerText = `${this._sensor.id}  :  ${this.label || ""}`;
        idLabelDiv.appendChild(txt);
        this.display.appendChild(idLabelDiv);

        // BACK BUTTON
        const backBtn = document.createElement("button");
        backBtn.textContent = "Go back";
        backBtn.addEventListener("click", function() { this.showDigits(); }.bind(this));
        backBtn.id = "backBtn";
        tempRhDiv.appendChild(backBtn);
        this.display.appendChild(tempRhDiv);

        this.drawChartBase();
    }

    /**
     * Adds a small display into the chart at mouse click position
     * @param event MouseEvent
     */
    putDisplay(event) {
        const size = this.canvas.getBoundingClientRect();
        const x = event.clientX - size.left - this.SM;
        const y = event.clientY - size.top;
        const width = size.width - 2 * this.SM;
        const height = size.height - 2 * this.HM;
        const xP = width / this._sensor.rh.length;

        // Array index corresponding to click position on X-axle
        const index = Math.round(x / xP);
        console.log("clicked close to value index " + index);
        console.log("which corresponds to RH " + this._sensor.rh[index]);
        console.log("which corresponds to TEMP " + this._sensor.temp[index]);

        this.context.beginPath();
        this.context.strokeStyle = "#000000";
        //this.context.font = "12px sans-serif";

        const chartX = x + this.SM;
        const chartY = y;

        // Draw a vertical line from the clicked position to the base of the chart
        this.context.moveTo(chartX, size.height - this.HM);
        this.context.setLineDash([15, 5]);
        this.context.lineTo(chartX, y);
        this.context.setLineDash([]);
        this.context.stroke();

        // Check that the text is inside the canvas, otherwise move it
        let x_txt = chartX + 15;
        let y_txt = chartY;

        const text = [
            `${this._sensor.date[index]} ${this._sensor.time[index]}`,
            `RH: ${this._sensor.rh[index]} %`,
            `TEMP: ${this._sensor.temp[index]} °`,
        ]

        /** HORIZONTAL **/
        let widest = 0;
        let outside = false;
        for (let t of text) {
            let tmp = this.context.measureText(t);
            if (tmp.width > widest) widest = tmp.width;
            if (x_txt + tmp.width > width) outside = true;
        }
        if (outside) x_txt = chartX - 15 - widest;

        /** VERTICAL **/
        if (y_txt < 15) y_txt = 15;
        if (y_txt + 30 > height) y_txt = height - 30;

        for (let i = 0; i < text.length; i++) {
            this.context.strokeText(text[i], x_txt, y_txt + i * 20);
        }
    }

    drawChartBase() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.context.clearRect(0, 0, width, height);

        // BOTTOM LINE
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
        this.context.beginPath();
        this.context.moveTo(this.SM, height - this.HM);
        this.context.lineTo(width - this.SM, height - this.HM);
        this.context.stroke();

        // THE CHARTS
        if (this.checkbox_rh.checked) this.drawChart(this.canvas, this._sensor.date, this._sensor.rh, "#0b0286", "left");
        if (this.checkbox_temp.checked) this.drawChart(this.canvas, this._sensor.date, this._sensor.temp, "#dc0505", "right");
    }

    /**
     * Draws the chart
     * @param canvas on which to draw the chart
     * @param m margin (top & bottom)
     * @param dates Date / time array (X-axis)
     * @param values Values (Y-axis)
     * @param color The color to draw
     * @param side Side on which to draw the chart marks ("left" or "right")
     */
    drawChart(canvas, dates, values, color, side) {

        // SET SCALE
        const first = values[0];
        let min = Number(first);
        let max = Number(first);
        for (let x of values) {
            x = Number(x);
            if (x < min) min = x;
            if (x > max) max = x;
        }

        max = Math.ceil(max);
        min = Math.floor(min);

        const xP = (canvas.width - 2 * this.SM) / values.length;
        const yP = (canvas.height - 2 * this.HM) / (max - min);

        const context = canvas.getContext("2d");
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.beginPath();

        //console.log(`xP ${xP} yP ${yP}`);

        context.moveTo(this.SM, canvas.height - (this.HM + (first - min) * yP));
        for (let i = 1; i < dates.length; i++) {
            const x = this.SM + i * xP;
            const y = canvas.height - (this.HM + (values[i] - min) * yP);
            context.lineTo(x, y);
        }
        context.stroke();

        // CHART MARKS
        context.font = "18px Arial";

        const arrow_x = (side == "left") ? this.SM : canvas.width - this.SM;
        const step = (canvas.height - 2 * this.HM) / 4;

        for (let i = 0; i < 5; i++) {
            context.moveTo(arrow_x - 5, this.HM + i * step);
            context.lineTo(arrow_x + 5, this.HM + i * step);

            let txt = (min + i * ((max - min) / 4)).toFixed(1);
            txt += (side == "left") ? "%" : "°";

            context.strokeText(
                txt,
                (side == "left") ? arrow_x - 57 : arrow_x + 10,
                canvas.height - (-5 + this.HM + i * step));

            //console.log(`i ${i}, min ${min}, max${max}, max-min ${max-min}, (max-min)/5 ${(max-min)/5} `);
        }

        context.moveTo(arrow_x, this.HM)
        context.lineTo(arrow_x, canvas.height - this.HM);
        context.stroke();
    }

}

customElements.define("sensor-display", SensorDisplay);