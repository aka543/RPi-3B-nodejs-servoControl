const rpio = require('rpio');
const { Pins } = require('./pins');

rpio.init({ gpiomem: false, close_on_exit: false })


// let arr = [12, 32, 33];

// arr.forEach( (x) => {
//     rpio.open(x, rpio.PWM); /* Use pin 12 */

//     rpio.pwmSetClockDivider(128);
//     rpio.pwmSetRange(x, 3000);

//     rpio.pwmSetData(x, 200); // from 150 to 300
// })

class Servo {
    constructor(clockDivider = 128, range = 3000, pin = 32) {
        this.pin = pin;
        this.clockDivider = clockDivider;
        this.range = range;
        this.min = 53; // 0°
        // 1°  = 350/180
        // x° =  (350/180) * x
        this.max = 350; // 180°
        rpio.pwmSetClockDivider(128);
        rpio.pwmSetRange(this.pin, 3000);
    }
    getMin() {
        rpio.pwmSetData(this.pin, 300);
        for(let i = 13; i < 30; i = i - 0.5) {
            rpio.pwmSetData(this.pin, 10 * i);
            console.log(`with data set to ${10 * i} look at the servo. i = ${i}`)
            rpio.msleep(500)
        }

    }
    getMax() {
        rpio.pwmSetData(this.pin, this.min);
        // this.min/10 * 3 somethig like this in the line down
        for(let i =  38; i < 42; i = i + 0.5) {
            console.log(`with data set to ${10 * i} look at the servo. i = ${i}`)
            rpio.pwmSetData(this.pin, 10 * i);
            rpio.msleep(500)
        }

    }
    rotate() {
        rpio.pwmSetData(this.pin, this.min);
        // for(let i = 0; i < numOfRotations; i = i++) {
        let dirrection = 1;
        let now = this.min;
            for(let j = 0; j < 100; j++) {
                rpio.pwmSetData(this.pin, now);
                now = this.min + j * dirrection;
                if(now >= this.max) {
                    dirrection = -1
                } else if(now <= this.min) {
                    dirrection = 1;
                } else {
                    console.log('we have a problem here with the variable dirrection: ' + dirrection);
                }

            }
        // }
    }

    angle2pulse(angle) {
        let pulse = this.min + ((this.max - this.min)/180) * angle;
        return Math.round(pulse)
    }

    goTo(uhel) {
        // console.log(this.angle2pulse(uhel))
        rpio.pwmSetData(this.pin, this.angle2pulse(uhel));
    }
    rotate(angle, step, space) {
        let dirrection = 1;
        setInterval(() => {
            let newAngle = angle + step * dirrection;
            if(newAngle > 180) {
                dirrection = -1
            } else if(newAngle < 0) {
                dirrection = 1;
            }
            console.log(angle);
            servo.goTo(angle);
            angle = angle + step * dirrection;
        
        }, space);
    }
}
let servo = new Servo();
// servo.goTo(0);
// for(let i = 0; i <= 180; i+= 4) {
//     setTimeout(() => {servo.goTo(i)}, i * 50)
// }
// for(let k = 180; k >= 0; k = k - 4) {
//     console.log(k)
//     setTimeout(() => {servo.goTo(k)}, (180 - k)  * 50 + 180 * 50)
// }
servo.rotate(0, 6, 120)
// servo.goTo(120)

// let angle = 0;
// let dirrection = 1;
// let step = 6;
// setInterval(() => {
//     let newAngle = angle + step * dirrection;
//     if(newAngle > 180) {
//         dirrection = -1
//     } else if(newAngle < 0) {
//         dirrection = 1;
//     }
//     console.log(angle);
//     servo.goTo(angle);
//     angle = angle + step * dirrection;

// }, 100);

// setTimeout(() => {servo.goTo(180)}, 10000)
// setTimeout(() => {servo.goTo(0)}, 15000)
// setTimeout(() => {servo.goTo(0)}, 2000)
// setTimeout(() => {servo.goTo(45)}, 2000)
// setTimeout(() => {servo.goTo(0)}, 2000)


// servo.rotate(2);

// rpio.open(15, rpio.INPUT);
// console.log('Pin 15 is currently ' + (rpio.read(15) ? 'high' : 'low'));

// rpio.open(16, rpio.OUTPUT, rpio.LOW);
// for (var i = 0; i < 5; i++) {
//     /* On for 1 second */
//     rpio.write(16, rpio.HIGH);
//     console.log('high')
//     rpio.sleep(1);

//     /* Off for half a second (500ms) */
//     rpio.write(16, rpio.LOW);
//     console.log('low')
//     rpio.msleep(1000);
// }






// class LedRPIO {
//     _range = 1000;
//     _clockDivider = 8;
//     _pin = Pins.BCM_2_Physical(16); // should be 12

    
//     constructor() {
//         console.log(this._pin);
//         rpio.init({ gpiomem: false, close_on_exit: false })
//         rpio.open(this._pin, rpio.PWM);
//         rpio.pwmSetClockDivider(this._clockDivider);
//         rpio.pwmSetRange(this._pin, this._range);
//     }

//     writeValue(percentage) {
//         let value = Math.floor(percentage * this._range);
//         rpio.pwmSetData(this._pin, value);
//     }

//     shutdown() {
//         rpio.close(this._pin, rpio.PIN_RESET);
//         rpio.exit();
//     }
// }

// class LedLogic {
//     _data = 0;
//     _step = 0;
//     _delay = 0;
//     _factor = 0;
//     _led = null;
//     _timer = null;

//     constructor() {
//         this._delay = 1e3;
//         this._factor = .2;
//         this._step = 1 * this._factor;
//         this._led = new LedRPIO();

//         process.on('SIGINT', () => {
//             console.log();
//             process.exit();
//         });

//         process.on('exit', (code) => {
//             clearTimeout(this._timer);
//             console.log('Closing Raspberry PI');
//             this._led.shutdown();
//             process.exit(0);
//         });
//     }

//     loop() {
//         if (this._data < 0) {
//             this._data = 0 + this._factor;
//             this._step = 1 * this._factor;
//             console.log(`${new Date().toJSON()} >> Switch (^)`);
//         } else if (this._data > 1) {
//             this._data = 1 - this._factor;
//             this._step = -1 * this._factor;
//             console.log(`${new Date().toJSON()} >> Switch (v)`);
//         }

//         if (this._data >= 0 && this._data <= 1) {
//             console.log(`${new Date().toJSON()} >> ${parseFloat(100 * this._data).toFixed(2)}% (${this._step > 0 ? '^' : 'v'})`);
//             this._led.writeValue(this._data);
//         }
//         this._data += this._step;

//         this._timer = setTimeout(() => {
//             this.loop();
//         }, this._delay);
//     }
// }

// console.log("Starting");
// let led = new LedLogic();
// led.loop();
