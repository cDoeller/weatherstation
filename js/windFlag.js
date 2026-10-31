/*
 * windFlag.js
 *
 * A very simple animated wind direction indicator.
 *
 * The graphic consists of only ONE line.
 * The line rotates around its center, like a compass needle.
 *
 * The movement is limited to a configurable angle range.
 *
 * The animation uses a simple spring-like physics:
 *
 * - the line gets a random target angle
 * - it accelerates towards that target
 * - damping slows it down
 * - the line therefore has a little inertia
 *
 * The same canvas can be used:
 *
 * - directly on the website
 * - as the source for the favicon
 */


// ============================================================
// GLOBAL SETTINGS
// ============================================================

const BASE_ANGLE = -40;

const RANGE_MIN = -15;
const RANGE_MAX = 15;

const LINE_LENGTH = 0.5;

const SPRING = 0.008;
const DAMPING = 0.05;

const MIN_WAIT = 1000;
const MAX_WAIT = 1500;


// ============================================================
// WIND FLAG
// ============================================================

class WindFlag {

    constructor({
        canvas,
        size = 32,
        lineWidth = 1
    }) {

        // ----------------------------------------------------
        // CANVAS
        // ----------------------------------------------------

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        this.size = size;


        // ----------------------------------------------------
        // APPEARANCE
        // ----------------------------------------------------

        this.lineWidth =
            lineWidth;

        // ----------------------------------------------------
        // GEOMETRY
        // ----------------------------------------------------

        /*
         * The line rotates around this exact point.
         */
        this.center = {
            x: size / 2,
            y: size / 2
        };


        /*
         * Calculate the line length from the canvas size.
         */
        this.lineLength =
            size * LINE_LENGTH;


        // ----------------------------------------------------
        // PHYSICS
        // ----------------------------------------------------

        /*
         * Current angle.
         */
        this.angle =
            this.toRadians(BASE_ANGLE);


        /*
         * Current rotational velocity.
         *
         * This is what gives the line inertia.
         */
        this.velocity = 0;


        /*
         * The angle we currently want to reach.
         */
        this.targetAngle =
            this.angle;


        /*
         * Time at which we choose the next target.
         */
        this.nextTargetTime = 0;


        /*
         * Whether the animation is running.
         */
        this.running = false;


        /*
         * Choose an initial target.
         */
        this.chooseTarget();
    }


    // ========================================================
    // DEGREES → RADIANS
    // ========================================================

    toRadians(degrees) {

        return degrees * Math.PI / 180;
    }


    // ========================================================
    // CHOOSE RANDOM TARGET
    // ========================================================

    chooseTarget() {

        /*
         * Create a random value between RANGE_MIN and
         * RANGE_MAX.
         */
        const randomRange =
            RANGE_MIN +
            Math.random() *
            (RANGE_MAX - RANGE_MIN);


        /*
         * Add the random range to the base angle.
         */
        this.targetAngle =
            this.toRadians(
                BASE_ANGLE + randomRange
            );


        /*
         * Wait a random amount of time before choosing
         * another target.
         */
        this.nextTargetTime =
            performance.now() +
            MIN_WAIT +
            Math.random() *
            (MAX_WAIT - MIN_WAIT);
    }


    // ========================================================
    // UPDATE PHYSICS
    // ========================================================

    update(time) {

        /*
         * Choose a new target when the waiting time is over.
         */
        if (time >= this.nextTargetTime) {

            this.chooseTarget();
        }


        /*
         * Distance between the current angle and the target.
         */
        const distance =
            this.targetAngle -
            this.angle;


        /*
         * Spring force:
         *
         * The further away we are from the target,
         * the stronger the acceleration.
         */
        const force =
            distance * SPRING;


        /*
         * Damping removes some of the velocity.
         *
         * This prevents the line from swinging forever.
         */
        this.velocity =
            this.velocity +
            force -
            this.velocity * DAMPING;


        /*
         * Apply the velocity to the angle.
         */
        this.angle +=
            this.velocity;
    }


    // ========================================================
    // DRAW
    // ========================================================

    draw() {

        const ctx = this.ctx;


        // ----------------------------------------------------
        // GET CURRENT CSS COLORS
        // ----------------------------------------------------

        /*
         * Read the current colors from the canvas.
         *
         * This means the canvas follows the CSS state
         * of the header automatically.
         */
        const styles =
            getComputedStyle(this.canvas);

        const lineColor =
            styles.color;


        // ----------------------------------------------------
        // CLEAR
        // ----------------------------------------------------

        ctx.clearRect(
            0,
            0,
            this.size,
            this.size
        );


        // ----------------------------------------------------
        // DRAW LINE
        // ----------------------------------------------------

        ctx.save();


        /*
         * Move the coordinate system to the center.
         */
        ctx.translate(
            this.center.x,
            this.center.y
        );


        /*
         * Rotate around the center.
         */
        ctx.rotate(this.angle);


        /*
         * Configure the line.
         */
        ctx.strokeStyle =
            lineColor;

        ctx.lineWidth =
            this.lineWidth;

        ctx.lineCap =
            "round";


        /*
         * Draw the line equally far in both directions
         * from the center.
         */
        ctx.beginPath();

        ctx.moveTo(
            -this.lineLength / 2,
            0
        );

        ctx.lineTo(
            this.lineLength / 2,
            0
        );

        ctx.stroke();


        /*
         * Restore the original coordinate system.
         */
        ctx.restore();
    }


    // ========================================================
    // ANIMATION LOOP
    // ========================================================

    animate(time) {

        this.update(time);

        this.draw();


        if (this.running) {

            requestAnimationFrame(
                (nextTime) =>
                    this.animate(nextTime)
            );
        }
    }


    // ========================================================
    // START
    // ========================================================

    start() {

        if (this.running) {
            return;
        }


        this.running = true;


        requestAnimationFrame(
            (time) =>
                this.animate(time)
        );
    }


    // ========================================================
    // STOP
    // ========================================================

    stop() {

        this.running = false;
    }


    // ========================================================
    // CHANGE COLORS
    // ========================================================

    setColors({
        lineColor = this.lineColor,
        backgroundColor = this.backgroundColor
    }) {

        this.lineColor =
            lineColor;

        this.backgroundColor =
            backgroundColor;
    }
}


// ============================================================
// EXPORT
// ============================================================

export {
    WindFlag
};
