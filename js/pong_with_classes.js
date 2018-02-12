/*
 * "Constants"
 */
// frames per second to run game
var FPS = 50;
// color for everything
var COLOR = '#0095DD';
// ball specific values
var BALL_IMAGE = 'images/ball.gif';
var BALL_SPEED = (Math.random()*10)-5;
var BALL_SIZE = 15;
// paddle specific values
var PADDLE_SOUND = 'sounds/pong_beep.wav';
var PADDLE_SPEED = 5;
var PADDLE_SIZE = 10;
var startgame = false;    // set to true when game is started
var hacks = false;  // set to true when you start the game with e
var losegame = false;       // set to true when you lose the game
var wingame = false;        // set the true when you win the game 


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

    keyDownHandler (e) {
        if (e.keyCode == 37) {
            this.leftPressed = true;
        }
        else if (e.keyCode == 39) {
            this.rightPressed = true;
        }
        if (e.keyCode == 32) {
            startgame = true;
        }
        if (e.keyCode == 69) {
            startgame = true;
            hacks = true;
        }
        }

    keyUpHandler (e) {
        if (e.keyCode == 37) {
            this.leftPressed = false;
        }
        else if(e.keyCode == 39) {
            this.rightPressed = false;
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
        if (input.rightPressed && this.x < canvas.width - this.width) {
            this.x += this.dx;
        }
        else if (input.leftPressed && this.x > 0) {
            this.x -= this.dx;
        }
        else if (input.mouseInBounds()) {
            this.x = input.mouseX - this.width / 2;
        }
    }

    draw (ctx) {
        // set features first, so they are active when the rect is drawn
        ctx.fillStyle = COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
class Brick extends Sprite {
    constructor (x, y, width, height, dx, dy, color) {
        super(x, y, width, height, dx, dy);
        this.color = color;
    }
    draw (ctx) {
        // set features first, so they are active when the rect is drawn
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

}

class Score extends Sprite {
    constructor (x, y) {
        super(x, y, 0, 0, 0, 0);
        this.score = 0;
        this.hiScore = 0;
        this.numLivesRemaining = 2;   // when the game start, there is only 2 more tries left
    }

    draw (ctx) {
        // set features first, so they are active when the text is drawn
        ctx.font = '16px Arial';
        ctx.fillStyle = COLOR;
        ctx.fillText('Score: ' + this.score, this.x, this.y);
        //ctx.fillText('High Score: ' + this.hiScore, this.x + 90, this.y);
        ctx.fillText('Number of Lives Remaining: ' + this.numLivesRemaining, this.x + 200, this.y);
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

    decrementNumLives(){
        this.numLivesRemaining--;
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

        var brixarray = []; // a two dimensional array to hold bricks
        for (var i = 0; i < 10; ++i) {
            var columns = [];

            var color = '';
            if(i == 0 || i == 1) {
                color = '#FF0000';  // first two rows: red
            } else if (i == 2 || i == 3) {
                color = "#FFA500";   // next two rows: orange
            } else if (i == 4 || i == 5) {
                color = "#FFFF00";   // next two rows: yellow
            } else if (i == 6 || i == 7) {
                color = "#008000";    // next two rows green
            } else if (i == 8 || i == 9) {
                color = "#00FFFF";     // next two rows: cyan
            }

            var brickWidth = (this.canvas.width - 10) / 10;
            var brickHeight = 8;
            var brickOffset = 30;
            for (var c = 0; c < 10; ++c) {
                // create brick in each row/column using different (x, y, and color)
                var brix = new Brick(c*(this.canvas.width/10),brickOffset+ i*(brickHeight + 1), brickWidth, brickHeight,0,0, color);                
                columns[c] = brix;
            }
            brixarray[i] = columns;
        }

        this.brixarray = brixarray;

        this.ball = new Ball(resources.loadImage(BALL_IMAGE),this.canvas.width / 2, this.canvas.height / 2, BALL_SIZE, BALL_SPEED, 5);
        this.paddle = new Paddle((this.canvas.width - PADDLE_SIZE * 6)/2, (this.canvas.height - PADDLE_SIZE*1.2 ) ,PADDLE_SIZE*6, PADDLE_SIZE , PADDLE_SPEED, 0);
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

        // draw all bricks
        var numRows = this.brixarray.length;        
        for (var i = 0; i < numRows; ++i) {   // rows  
            var numColumns = this.brixarray[i].length;       
            for (var c = 0; c < numColumns; ++c) {  // columns
                var brix = this.brixarray[i][c];
                brix.draw(this.ctx);
            }            
        }

        this.score.draw(this.ctx);
    }


    checkCollisions() {

        // hit bottom wall
        if (this.ball.nextY > this.canvas.height - this.ball.size || this.ball.nextY < 0) 
        {
            // update number of tries remaining
            if(hacks == false)
                {
                    this.score.decrementNumLives();
                }

            if(this.score.numLivesRemaining < 0) {
                // stop the game when number of tries running out
                losegame = true;
            } else {
                // otherwise, update number of tries remaining and keep playing
                this.score.draw(this.ctx);                
                this.ball.dy = -this.ball.dy;
            }
        }
        // hit left wall
        if (this.ball.nextX < 0) {
            this.ball.dx = -this.ball.dx;
        }
        //hit paddle
        else if (this.ball.nextX > this.paddle.x 
                 && this.ball.nextX < this.paddle.x + (this.paddle.width-1) 
                 && this.ball.nextY > this.paddle.y - this.paddle.height) {            
            this.ball.dy = -this.ball.dy;
            this.paddleSound.play();
        }
        // hit right wall
        else if (this.ball.nextX > this.canvas.width - this.ball.size)
         {
            this.ball.dx = -this.ball.dx;
        }
        //hit top wall
        else if (this.ball.nextY<0)
        {
            // if there are no bricks left, then you win the game
            if(this.brixarray == null || this.brixarray.length == 0) {
                wingame = true;
            } else {
                this.ball.dy = -this.ball.dy;
            }
        }

        // hit any bricks
        var hitBrick = false;
        for (var i = this.brixarray.length-1; i >= 0; i--) { // always check last row first
            var columns = this.brixarray[i];
            for(var j = 0; j < columns.length; j++) {    // check each column
                // use x, y coordinates to check if ball hit this brick
                if(this.ball.nextX > columns[j]._x 
                    && this.ball.nextX < columns[j]._x + columns[j].width 
                    && this.ball.nextY < columns[j]._y + columns[j].height) {
                    // if hit a brick
                    this.ball.dy = -this.ball.dy;
                    hitBrick = true;

                    // remove this brick from array
                    // this will automatically remove the brick from canvas
                    columns.splice(j, 1);

                    // increment the score
                    this.score.increment();
                    this.score.draw(this.ctx);
                    break;
                }
            }

            if(hitBrick) {
                break;
            }
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
var timeIntervalHandler = setInterval(function() 
{
    if (losegame == true || wingame == true) {
        // end the game
        timeIntervalHandler = clearInterval(timeIntervalHandler);

        var msgStr = 'You lost the game!';
        if(wingame) {
            msgStr = 'You won the game!';
        }
        
        // prompt the user that he either win or lose the game
        alert(msgStr);
    }

    // start the game
    if(startgame == true)
    {
        game.loop();
    } 
    else
    {
        canvas2= document.getElementById('gameCanvas');   
        this.ctx2 = this.canvas2.getContext('2d');     
        ctx2.font = '16px Arial';
        ctx2.fillStyle = "#0A0A0A";
        ctx2.fillText("Press the Spacebar to Start the Game", canvas2.width/4 , canvas2.height / 2);
        ctx2.fillText("Press the e key to Start the Game with cheats enabled", canvas2.width/10 , canvas2.height / 4);
    }
}, 1000/FPS);