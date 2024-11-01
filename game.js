const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.5;
const jumpStrength = -10;
const playerWidth = 50;
const playerHeight = 100;
const bulletSpeed = 10;
const knockback = 5;
const shootCooldown = 500; // 500ms cooldown between shots
const wobbleSpeed = 0.05; // Speed of wobbling effect
const platformHeight = 20;
const platformWidth = 600;

const player1 = { x: 100, y: 400, vx: 0, vy: 0, color: 'red', onGround: false, bullets: [], lastShot: 0, angle: 0, shooting: false, shootPower: 0 };
const player2 = { x: 650, y: 400, vx: 0, vy: 0, color: 'blue', onGround: false, bullets: [], lastShot: 0, angle: 0, shooting: false, shootPower: 0 };

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

    if (player.y + playerHeight > canvas.height - platformHeight && player.x + playerWidth > (canvas.width - platformWidth) / 2 && player.x < (canvas.width + platformWidth) / 2) {
        player.y = canvas.height - platformHeight - playerHeight;
        player.vy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }

    // Apply wobbling effect
    player.angle = Math.sin(Date.now() * wobbleSpeed) * Math.PI / 4;

    // Prevent players from going through each other
    if (player1.x < player2.x + playerWidth && player1.x + playerWidth > player2.x &&
        player1.y < player2.y + playerHeight && player1.y + playerHeight > player2.y) {
        if (player1.x < player2.x) {
            player1.x = player2.x - playerWidth;
        } else {
            player2.x = player1.x - playerWidth;
        }
    }
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
        if (e.key === ' ') {
            player1.shooting = true;
            player1.shootPower += 0.1;
        }
        if (e.key === 'ArrowUp' && player2.onGround) {
            player2.vy = jumpStrength;
            player2.vx = Math.sin(player2.angle) * 5;
        }
        if (e.key === 'Enter') {
            player2.shooting = true;
            player2.shootPower += 0.1;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === ' ') {
            player1.shooting = false;
            if (Date.now() - player1.lastShot > shootCooldown) {
                const angle = player1.angle;
                player1.bullets.push({ x: player1.x + playerWidth / 2, y: player1.y + playerHeight / 2, vx: -bulletSpeed * player1.shootPower, vy: -bulletSpeed * Math.sin(angle) * player1.shootPower, width: 10, height: 5, color: 'red' });
                player1.lastShot = Date.now();
                player1.shootPower = 0;
            }
        }
        if (e.key === 'Enter') {
            player2.shooting = false;
            if (Date.now() - player2.lastShot > shootCooldown) {
                const angle = player2.angle;
                player2.bullets.push({ x: player2.x + playerWidth / 2, y: player2.y + playerHeight / 2, vx: bulletSpeed * player2.shootPower, vy: -bulletSpeed * Math.sin(angle) * player2.shootPower, width: 10, height: 5, color: 'blue' });
                player2.lastShot = Date.now();
                player2.shootPower = 0;
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
