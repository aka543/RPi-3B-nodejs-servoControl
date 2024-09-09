const rpio = require('rpio');
const { Pins } = require('./pins');

class LedRPIO {
    _range = 1000;
    _clockDivider = 8;
    _pin = Pins.BCM_2_Physical(18);

    constructor() {
        rpio.init({ gpiomem: false, close_on_exit: false })
        rpio.open(this._pin, rpio.PWM);
        rpio.pwmSetClockDivider(this._clockDivider);
        rpio.pwmSetRange(this._pin, this._range);
    }

    writeValue(percentage) {
        let value = Math.floor(percentage * this._range);
        rpio.pwmSetData(this._pin, value);
    }

    shutdown() {
        rpio.close(this._pin, rpio.PIN_RESET);
        rpio.exit();
    }
}

class LedLogic {
    _data = 0;
    _step = 0;
    _delay = 0;
    _factor = 0;
    _led = null;
    _timer = null;

    constructor() {
        this._delay = 1e3;
        this._factor = .2;
        this._step = 1 * this._factor;
        this._led = new LedRPIO();

        process.on('SIGINT', () => {
            console.log();
            process.exit();
        });

        process.on('exit', (code) => {
            clearTimeout(this._timer);
            console.log('Closing Raspberry PI');
            this._led.shutdown();
            process.exit(0);
        });
    }

    loop() {
        if (this._data < 0) {
            this._data = 0 + this._factor;
            this._step = 1 * this._factor;
            console.log(`${new Date().toJSON()} >> Switch (^)`);
        } else if (this._data > 1) {
            this._data = 1 - this._factor;
            this._step = -1 * this._factor;
            console.log(`${new Date().toJSON()} >> Switch (v)`);
        }

        if (this._data >= 0 && this._data <= 1) {
            console.log(`${new Date().toJSON()} >> ${parseFloat(100 * this._data).toFixed(2)}% (${this._step > 0 ? '^' : 'v'})`);
            this._led.writeValue(this._data);
        }
        this._data += this._step;

        this._timer = setTimeout(() => {
            this.loop();
        }, this._delay);
    }
}

let led = new LedLogic();
led.loop();