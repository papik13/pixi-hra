let app;
let player;
let obstacles = [];
let score = 0;
let gameStarted = false;
const obstacleInterval = 2000;
let lastObstacleTime = 0;

document.getElementById('startButton').addEventListener('click', startGame);

function startGame() {
    document.getElementById('startButton').style.display = 'none';
    score = 0;
    gameStarted = true;
    lastObstacleTime = 0;
    obstacles = [];

    // If the app already exists, destroy it
    if (app) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        document.getElementById('gameContainer').innerHTML = '';
    }

    // Create the application
    app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
    document.getElementById('gameContainer').appendChild(app.view);

    // Load images
    const playerTexture = PIXI.Texture.from('player.png');
    const obstacleTexture = PIXI.Texture.from('obstacle.png');
    const backgroundTexture = PIXI.Texture.from('background.png');

    // Create background
    const background = new PIXI.Sprite(backgroundTexture);
    background.width = app.screen.width;
    background.height = app.screen.height;
    app.stage.addChild(background);

    // Create player
    player = new PIXI.Sprite(playerTexture);
    player.anchor.set(0.5);
    player.x = app.screen.width / 10; // Position more to the left
    player.y = app.screen.height / 2; // Center vertically
    player.scale.set(0.5); // Adjust this value to make the player smaller
    app.stage.addChild(player);

    // Listen for frame updates
    app.ticker.add(gameLoop);

    // Keyboard events
    window.addEventListener('keydown', onKeyDown);
}

function gameLoop(delta) {
    if (!gameStarted) return;

    // Check for new obstacles
    if (Date.now() - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = Date.now();
    }

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 5;
        if (obstacles[i].x < -obstacles[i].width) {
            app.stage.removeChild(obstacles[i]);
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = 'Score: ' + score;
        }
    }

    // Check for collisions
    for (let obstacle of obstacles) {
        if (hitTestRectangle(player, obstacle)) {
            endGame();
            return;
        }
    }
}

function createObstacle() {
    const obstacleTexture = PIXI.Texture.from('obstacle.png');
    const obstacle = new PIXI.Sprite(obstacleTexture);
    obstacle.anchor.set(0.5);
    obstacle.x = app.screen.width;
    obstacle.y = Math.random() * app.screen.height;
    app.stage.addChild(obstacle);
    obstacles.push(obstacle);
}

function onKeyDown(e) {
    const step = 20;
    if (e.code === 'ArrowUp') {
        player.y -= step;
        if (player.y < player.height / 2) {
            player.y = player.height / 2;
        }
    }
    if (e.code === 'ArrowDown') {
        player.y += step;
        if (player.y > app.screen.height - player.height / 2) {
            player.y = app.screen.height - player.height / 2;
        }
    }
}

function hitTestRectangle(r1, r2) {
    const combinedHalfWidths = r1.width / 2 + r2.width / 2;
    const combinedHalfHeights = r1.height / 2 + r2.height / 2;
    const vx = r1.x - r2.x;
    const vy = r1.y - r2.y;

    return Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights;
}

function endGame() {
    gameStarted = false;
    app.ticker.stop();
    document.getElementById('startButton').style.display = 'block';
}
