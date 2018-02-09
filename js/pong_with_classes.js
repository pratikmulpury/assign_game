/*
 * "Constants"
 */
// frames per second to run game
var FPS = 50;
// color for everything
var COLOR = '#0095DD';
// ball specific values
var BALL_IMAGE = 'images/ball.gif';
var BALL_SPEED = 4;
var BALL_SIZE = 15;
// paddle specific values
var PADDLE_SOUND = 'sounds/pong_beep.wav';
var PADDLE_SPEED = 5;
var PADDLE_SIZE = 10;


/*
 * Image and Sound manager
 */
// handle image and sounds loading, really only needed for LOTS or BIG images and sounds
class ResourceManager {
    constructor () {
        this.numImagesLeftToLoad = 0;
        this.numSoundsLeftToLoad = 0;
    }

    // these need to be called BEFORE the game starts so they are loaded and available DURING the game
    loadImage (url) {
        // create actual HTML element and note when it finishes loading
        var img = new Image();
        var self = this;
        img.onload = function () {
            self.numImagesLeftToLoad -= 1;
            console.log(url + ' loaded');
            // reset so it is only counted once (just in case)
            this.onload = null;
        }
        img.onerror = function () {
            console.log('ERROR: could not load ' + url);
        }
        img.src = url;
        this.numImagesLeftToLoad += 1;
        return img;
    }

    loadSound (url) {
        // create actual HTML element and note when it finishes loading
        var snd = new Audio();
        var self = this;
        snd.oncanplay = function () {
            self.numSoundsLeftToLoad -= 1;
            console.log(url + ' loaded');
            // reset so it is only counted once (just in case)
            this.oncanplay = null;
        }
        snd.onerror = function () {
            console.log('ERROR: could not load ' + url);
        }
        snd.src = url;
        this.numSoundsLeftToLoad += 1;
        return snd;
    }

    isLoadingComplete () {
        return this.numImagesLoaded === this.numImagesExpected &&
               this.numSoundsLoaded === this.numSoundsExpected;
    }
}


/*
 * Key and mouse input manager
 */
class InputManager {
    constructor (canvas) {
        this.canvas = canvas;
        this.upPressed = false;
        this.downPressed = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    get upPressed () {
        return this._upPressed;
    }
    get downPressed () {
        return this._downPressed;
    }

    set upPressed (pressed) {
        this._upPressed = pressed;
    }
    set downPressed (pressed) {
        this._downPressed = pressed;
    }

    keyDownHandler (e) {
        if (e.keyCode == 38) {
            this.upPressed = true;
        }
        else if (e.keyCode == 40) {
            this.downPressed = true;
        }
    }

    keyUpHandler (e) {
        if (e.keyCode == 38) {
            this.upPressed = false;
        }
        else if(e.keyCode == 40) {
            this.downPressed = false;
        }
    }

    // get the mouse coordinates relative to the canvas rather than the page
    mouseMoveHandler (e) {
        this.mouseX = e.clientX - this.canvas.offsetLeft;
        this.mouseY = e.clientY - this.canvas.offsetTop;
    }

    mouseInBounds () {
        return this.mouseX > 0 && this.mouseX < this.canvas.width &&
               this.mouseY > 0 && this.mouseY < this.canvas.height;
    }
}


/*
 * Generic game element that can move and be drawn on the canvas.
 */
class Sprite {
    constructor (x, y, width, height, dx, dy) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;
    }

    get x () {
        return this._x;
    }

    get y () {
        return this._y;
    }

    get dx () {
        return this._dx;
    }

    get dy () {
        return this._dy;
    }

    get nextX () {
        return this._x + this._dx;
    }

    get nextY () {
        return this._y + this._dy;
    }

    get width () {
        return this._width;
    }

    get height () {
        return this._height;
    }


    set x (x) {
        this._x = x;
    }

    set y (y) {
        this._y = y;
    }

    set dx (dx) {
        this._dx = dx;
    }

    set dy (dy) {
        this._dy = dy;
    }

    set width (w) {
        this._width = w;
    }

    set height (h) {
        this._height = h;
    }

    reset () {
        this.x = this.startX;
        this.y = this.startY;
    }

    move (canvas) {
    }

    draw (ctx) {
    }
}

class Ball extends Sprite {
    constructor (image, x, y, size, dx, dy) {
        super(x, y, size, size, dx, dy);
        this.image = image;
    }

    get size () {
        return this.width;
    }

    move () {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw (ctx) {
        if (this.image != null) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
        else {
            // set features first, so they are active when the rect is drawn
            ctx.beginPath();
            ctx.fillStyle = COLOR;
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI*2);
            ctx.fill();
            ctx.closePath();
        }
    }
}

class Paddle extends Sprite {
    constructor (x, y, width, height, dx, dy) {
        super(x, y, width, height, dx, dy);
    }

    move (canvas) {
        if (input.downPressed && this.y < canvas.height - this.height) {
            this.y += this.dy;
        }
        else if (input.upPressed && this.y > 0) {
            this.y -= this.dy;
        }
        else if (input.mouseInBounds()) {
            this.y = input.mouseY - this.height / 2;
        }
    }

    draw (ctx) {
        // set features first, so they are active when the rect is drawn
        ctx.fillStyle = COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Score extends Sprite {
    constructor (x, y) {
        super(x, y, 0, 0, 0, 0);
        this.score = 0;
        this.hiScore = 0;
    }

    draw (ctx) {
        // set features first, so they are active when the text is drawn
        ctx.font = '16px Arial';
        ctx.fillStyle = COLOR;
        ctx.fillText('Score: ' + this.score, this.x, this.y);
        ctx.fillText('Hi Score: ' + this.hiScore, this.x + 90, this.y);
    }

    reset () {
        this.score = 0;
    }

    increment () {
        this.score += 1;
        if (this.score > this.hiScore) {
            this.hiScore = this.score;
        }
    }
}


/*
 * Game class contains everything about the game and displays in a given canvas
 */
class Game {
    constructor (canvas) {
        // the area in the HTML document where the game will be played
        this.canvas = canvas;
        // the actual object that handles drawing on the canvas
        this.ctx = this.canvas.getContext('2d');
        this.paddleSound = resources.loadSound(PADDLE_SOUND);
        // elements in the game
        this.ball = new Ball(resources.loadImage(BALL_IMAGE),
                             this.canvas.width / 2, this.canvas.height / 2, BALL_SIZE,
                             BALL_SPEED, -BALL_SPEED);
        this.paddle = new Paddle(this.canvas.width - PADDLE_SIZE * 3, (this.canvas.height - PADDLE_SIZE * 6) / 2,
                                 PADDLE_SIZE, PADDLE_SIZE * 6, 0, PADDLE_SPEED);
        this.score = new Score(8, 20);
    }

    loop () {
        if (resources.isLoadingComplete()) {
            this.update();
            this.draw();
        }
    }

    update() {
        this.ball.move(this.canvas);
        this.paddle.move(this.canvas);
        this.checkCollisions(this.canvas);
        // no way to win or lose, it just plays forever!
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.draw(this.ctx);
        this.paddle.draw(this.ctx);
        this.score.draw(this.ctx);
    }


    checkCollisions() {
        if (this.ball.nextY > this.canvas.height - this.ball.size || this.ball.nextY < 0) {
            this.ball.dy = -this.ball.dy;
        }
        if (this.ball.nextX < 0) {
            this.ball.dx = -this.ball.dx;
        }
        else if (this.ball.nextX > this.paddle.x - this.ball.size &&
                 this.ball.nextY > this.paddle.y && this.ball.nextY < this.paddle.y + this.paddle.height) {
            this.ball.dx = -this.ball.dx;
            this.paddleSound.play();
            this.score.increment();
        }
        else if (this.ball.nextX > this.canvas.width - this.ball.size) {
            this.ball.reset();
            this.paddle.reset();
            this.score.reset();
        }
    }
}


/*
 * Setup classes
 */
var canvas = document.getElementById('gameCanvas');
var resources = new ResourceManager();
var input = new InputManager(canvas);
var game = new Game(canvas);

/*
 * Setup input responses
 */
// respond to both keys and mouse movements
document.addEventListener('keydown', event => input.keyDownHandler(event), false);
document.addEventListener('keyup', event => input.keyUpHandler(event), false);
document.addEventListener('mousemove', event => input.mouseMoveHandler(event), false);

/*
 * Game loop
 */
// NOT IDEAL --- just starts when the everthing is done loading, not necessarily when the user is ready
setInterval(function() {
    game.loop();
}, 1000/FPS);
