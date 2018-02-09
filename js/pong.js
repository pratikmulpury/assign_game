// global variables associated with game
// frames per second to run game
var FPS = 50;
// the area in the HTML document where the game will be played
var canvas = document.getElementById('gameCanvas');
// the actual object that handles drawing on the canvas
var ctx = canvas.getContext('2d');

// player's score (how many times they have saved the ball)
var score = 0;
var hiScore = 0;
// ball specific variables
var ballImage = loadImage('/images/ball.gif');
var ballSize = 15;
var x = canvas.width / 2;
var y = canvas.height / 2;
var dx = 4;
var dy = -4;
// paddle specific variables
var paddleSound = loadSound('/sounds/pong_beep.wav');
var paddleWidth = 10;
var paddleHeight = 60;
var paddleX = canvas.width - paddleWidth * 3;
var paddleY = (canvas.height - paddleHeight) / 2;
// key input specific variables
var upPressed = false;
var downPressed = false;
// handle image and sounds loading, really only needed for LOTS or BIG images and sounds
var NUM_IMAGES_EXPECTED = 1;
var numImagesLoaded = 0;
var NUM_SOUNDS_EXPECTED = 1;
var numSoundsLoaded = 0;


/*
 * Game loop functions:
 *   update
 *   draw
 */
function update() {
    moveBall();
    movePaddle();
    checkCollisions();
    // no way to win or lose, it just plays forever!
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
}


/*
 * Ball functions:
 *   move
 *   draw
 */
function moveBall() {
    x += dx;
    y += dy;
}

function drawBall() {
    if (ballImage != null) {
        ctx.drawImage(ballImage, x, y, ballSize, ballSize);
    }
    else {
        // set features first, so they are active when the rect is drawn
        ctx.beginPath();
        ctx.fillStyle = '#0095DD';
        ctx.arc(x, y, ballSize / 2, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
}


/*
 * Paddle functions:
 *   move
 *   draw
 */
function movePaddle() {
    if (downPressed && paddleY < canvas.height - paddleHeight) {
        paddleY += 5;
    }
    else if (upPressed && paddleY > 0) {
        paddleY -= 5;
    }
}

function drawPaddle() {
    // set features first, so they are active when the rect is drawn
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}


/*
 * Other functions:
 *   drawScore
 *   checkCollisions
 */
function drawScore() {
    // set features first, so they are active when the text is drawn
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
    ctx.fillText('Hi Score: ' + hiScore, 98, 20);
}

function checkCollisions() {
    var nextX = x + dx;
    var nextY = y + dy;
    if (nextY > canvas.height - ballSize || nextY < 0) {
        dy = -dy;
    }
    if (nextX < 0) {
        dx = -dx;
    }
    else if (nextX > paddleX - ballSize &&
             nextY > paddleY && nextY < paddleY + paddleHeight) {
        dx = -dx;
        paddleSound.play();
        // got it --- increase score!
        score += 1;
        if (score > hiScore) {
            hiScore = score;
        }
    }
    else if (nextX > canvas.width - ballSize) {
        x = canvas.width / 2;
        y = canvas.height / 2;
        paddleY = (canvas.height - paddleHeight) / 2;
        // missed --- reset score!
        score = 0;
    }
}


/*
 * Player input functions:
 *   key handlers
 *   mouse handler
 */
function keyDownHandler(e) {
    if (e.keyCode == 38) {
        upPressed = true;
    }
    else if (e.keyCode == 40) {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 38) {
        upPressed = false;
    }
    else if(e.keyCode == 40) {
        downPressed = false;
    }
}

function mouseMoveHandler(e) {
    // get the mouse coordinates relative to the canvas rather than the page
    var relativeY = e.clientY - canvas.offsetTop;
    if (relativeY > 0 && relativeY < canvas.height) {
        paddleY = relativeY - paddleHeight / 2;
    }
}


/*
 * Image and Sound utilities
 */
// these need to be called BEFORE the game starts so they are loaded and available DURING the game
function loadImage (url) {
    // create actual HTML element and note when it finishes loading
    var img = new Image();
    img.onload = function () {
        numImagesLoaded += 1;
        console.log(url + " loaded");
        // reset so it is only counted once (just in case)
        this.onload = null;
    }
    img.src = url;
    return img;
}

function loadSound (url) {
    // create actual HTML element and note when it finishes loading
    var snd = new Audio();
    snd.oncanplay = function () {
        numSoundsLoaded += 1;
        console.log(url + " loaded");
        // reset so it is only counted once (just in case)
        this.oncanplay = null;
    }
    snd.src = url;
    return snd;
}


/*
 * Setup input responses
 */
// respond to both keys and mouse movements
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);


/*
 * Game loop
 */
// NOT IDEAL --- just starts when the everthing is done loading, not necessarily when the user is ready
setInterval(function() {
    if (numImagesLoaded >= NUM_IMAGES_EXPECTED && numSoundsLoaded >= NUM_SOUNDS_EXPECTED) {
        update();
        draw();
    }
}, 1000/FPS);
