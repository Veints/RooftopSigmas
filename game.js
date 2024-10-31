const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.5;
const jumpStrength = -10;
const playerWidth = 50;
const playerHeight = 50;
const bulletSpeed = 10;
const knockback = 15;
const shootCooldown = 500; // 500ms cooldown between shots
const wobbleFactor = 0.1; // Factor for wobbling effect

const player1 = { x: 100, y: 500, vx: 0, vy: 0, color: 'red', onGround: false, bullets: [], lastShot: 0 };
const player2 = { x: 650, y: 500, vx: 0, vy: 0, color: 'blue', onGround: false, bullets: [], lastShot: 0 };

function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, playerWidth, playerHeight);
}

function drawBullet(bullet) {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function updatePlayer(player) {
    player.vy += gravity;
    player.y += player.vy;
    player.x += player.vx;

    if (player.y + playerHeight > canvas.height) {
        player.y = canvas.height - playerHeight;
        player.vy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }

    // Apply wobbling effect
    player.vx += (Math.random() - 0.5) * wobbleFactor;
    player.vy += (Math.random() - 0.5) * wobbleFactor;
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
        }
        if (e.key === 'a') {
            player1.vx = -5;
        }
        if (e.key === 'd') {
            player1.vx = 5;
        }
        if (e.key === ' ' && Date.now() - player1.lastShot > shootCooldown) {
            player1.bullets.push({ x: player1.x + playerWidth, y: player1.y + playerHeight / 2, vx: bulletSpeed, vy: (Math.random() - 0.5) * 2, width: 10, height: 5, color: 'red' });
            player1.lastShot = Date.now();
        }
        if (e.key === 'ArrowUp' && player2.onGround) {
            player2.vy = jumpStrength;
        }
        if (e.key === 'ArrowLeft') {
            player2.vx = -5;
        }
        if (e.key === 'ArrowRight') {
            player2.vx = 5;
        }
        if (e.key === 'Enter' && Date.now() - player2.lastShot > shootCooldown) {
            player2.bullets.push({ x: player2.x - 10, y: player2.y + playerHeight / 2, vx: -bulletSpeed, vy: (Math.random() - 0.5) * 2, width: 10, height: 5, color: 'blue' });
            player2.lastShot = Date.now();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'a' || e.key === 'd') {
            player1.vx = 0;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            player2.vx = 0;
        }
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer(player1);
    updatePlayer(player2);
    updateBullets(player1, player2);
    updateBullets(player2, player1);
    drawPlayer(player1);
    drawPlayer(player2);
    player1.bullets.forEach(drawBullet);
    player2.bullets.forEach(drawBullet);
    requestAnimationFrame(update);
}

handleInput();
update();
