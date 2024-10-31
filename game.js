const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.5;
const jumpStrength = -10;
const playerWidth = 50;
const playerHeight = 100;
const bulletSpeed = 10;
const knockback = 5;
const shootCooldown = 500; // 500ms cooldown between shots
const wobbleFactor = 0.05; // Factor for wobbling effect
const platformHeight = 20;
const platformWidth = 600;

const player1 = { x: 100, y: 400, vx: 0, vy: 0, color: 'red', onGround: false, bullets: [], lastShot: 0, angle: 0, shooting: false };
const player2 = { x: 650, y: 400, vx: 0, vy: 0, color: 'blue', onGround: false, bullets: [], lastShot: 0, angle: 0, shooting: false };

function drawPlayer(player) {
    ctx.save();
    ctx.translate(player.x + playerWidth / 2, player.y + playerHeight / 2);
    ctx.rotate(player.angle);
    ctx.fillStyle = player.color;
    ctx.fillRect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
    ctx.restore();
}

function drawBullet(bullet) {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawPlatform() {
    ctx.fillStyle = 'gray';
    ctx.fillRect((canvas.width - platformWidth) / 2, canvas.height - platformHeight, platformWidth, platformHeight);
}

function updatePlayer(player) {
    player.vy += gravity;
    player.y += player.vy;
    player.x += player.vx;

    if (player.y + playerHeight > canvas.height - platformHeight && player.x + playerWidth > (canvas.width - platformWidth) / 2 && player.x < (canvas.width + platformWidth) / 2) {
        player.y = canvas.height - platformHeight - playerHeight;
        player.vy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }

    // Apply wobbling effect
    player.angle += (Math.random() - 0.5) * wobbleFactor;

    // Limit angle to prevent excessive rotation
    if (player.angle > Math.PI / 4) player.angle = Math.PI / 4;
    if (player.angle < -Math.PI / 4) player.angle = -Math.PI / 4;
}

function updateBullets(player, opponent) {
    player.bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            player.bullets.splice(index, 1);
        }

        if (bullet.x < opponent.x + playerWidth && bullet.x + bullet.width > opponent.x &&
            bullet.y < opponent.y + playerHeight && bullet.y + bullet.height > opponent.y) {
            opponent.vx = bullet.vx > 0 ? knockback : -knockback;
            player.bullets.splice(index, 1);
        }
    });
}

function handleInput() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'w' && player1.onGround) {
            player1.vy = jumpStrength;
            player1.vx = Math.sin(player1.angle) * 5;
        }
        if (e.key === 'a') {
            player1.vx = -5;
        }
        if (e.key === 'd') {
            player1.vx = 5;
        }
        if (e.key === ' ') {
            player1.shooting = true;
        }
        if (e.key === 'ArrowUp' && player2.onGround) {
            player2.vy = jumpStrength;
            player2.vx = Math.sin(player2.angle) * 5;
        }
        if (e.key === 'ArrowLeft') {
            player2.vx = -5;
        }
        if (e.key === 'ArrowRight') {
            player2.vx = 5;
        }
        if (e.key === 'Enter') {
            player2.shooting = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'a' || e.key === 'd') {
            player1.vx = 0;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            player2.vx = 0;
        }
        if (e.key === ' ') {
            player1.shooting = false;
            if (Date.now() - player1.lastShot > shootCooldown) {
                const angle = player1.angle;
                player1.bullets.push({ x: player1.x + playerWidth / 2, y: player1.y + playerHeight / 2, vx: bulletSpeed * Math.cos(angle), vy: bulletSpeed * Math.sin(angle), width: 10, height: 5, color: 'red' });
                player1.lastShot = Date.now();
            }
        }
        if (e.key === 'Enter') {
            player2.shooting = false;
            if (Date.now() - player2.lastShot > shootCooldown) {
                const angle = player2.angle;
                player2.bullets.push({ x: player2.x + playerWidth / 2, y: player2.y + playerHeight / 2, vx: bulletSpeed * Math.cos(angle), vy: bulletSpeed * Math.sin(angle), width: 10, height: 5, color: 'blue' });
                player2.lastShot = Date.now();
            }
        }
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatform();
    updatePlayer(player1);
    updatePlayer(player2);
    updateBullets(player1, player2);
    updateBullets(player2, player1);
    drawPlayer(player1);
    drawPlayer(player2);
    player1.bullets.forEach(drawBullet);
    player2.bullets.forEach(drawBullet);

    // Check for win condition
    if (player1.y + playerHeight > canvas.height) {
        alert('Player 2 wins!');
        resetGame();
    }
    if (player2.y + playerHeight > canvas.height) {
        alert('Player 1 wins!');
        resetGame();
    }

    requestAnimationFrame(update);
}

function resetGame() {
    player1.x = 100;
    player1.y = 400;
    player1.vx = 0;
    player1.vy = 0;
    player1.bullets = [];
    player1.angle = 0;

    player2.x = 650;
    player2.y = 400;
    player2.vx = 0;
    player2.vy = 0;
    player2.bullets = [];
    player2.angle = 0;
}

handleInput();
update();
