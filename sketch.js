// 全域變數
let backgroundImg;
let bgX = 0;
const bgSpeed = 0.05;

// 玩家物件
let player1 = {
  x: 100,
  y: 300,
  speedX: 5,
  speedY: 0,
  gravity: 0.5,
  jumpForce: -12,
  isJumping: false,
  currentFrame: 0,
  currentAction: 'idle',
  direction: 1,
  bullets: [],
  health: 100,
  isDead: false,
  groundY: 300
};

let player2 = {
  x: 700,
  y: 300,
  speedX: 5,
  speedY: 0,
  gravity: 0.5,
  jumpForce: -12,
  isJumping: false,
  currentFrame: 0,
  currentAction: 'idle',
  direction: -1,
  bullets: [],
  health: 100,
  isDead: false,
  groundY: 300
};

// sprites 物件
let sprites = {
  player1: {
    idle: { img: null, width: 46, height: 42, frames: 4 },
    walk: { img: null, width: 36, height: 38, frames: 5 },
    jump: { img: null, width: 35, height: 36, frames: 6 }
  },
  player2: {
    idle: { img: null, width: 33, height: 27, frames: 4 },
    walk: { img: null, width: 42, height: 35, frames: 4 },
    jump: { img: null, width: 37, height: 41, frames: 4 }
  },
  attack1: { img: null, width: 30, height: 30, frames: 5 },
  attack2: { img: null, width: 100, height: 100, frames: 5 }
};

function preload() {
  console.log('開始載入圖片...');
  
  // 載入背景
  backgroundImg = loadImage('0.png', 
    () => console.log('背景載入成功'),
    () => console.log('背景載入失敗')
  );
  
  // 載入玩家1圖片
  sprites.player1.idle.img = loadImage('player1/idle.png',
    () => console.log('玩家1閒置動畫載入成功'),
    () => console.log('玩家1閒置動畫載入失敗')
  );
  sprites.player1.walk.img = loadImage('player1/walk.png');
  sprites.player1.jump.img = loadImage('player1/jump.png');

  // 載入玩家2圖片
  sprites.player2.idle.img = loadImage('player2/idle.png',
    () => console.log('玩家2閒置動畫載入成功'),
    () => console.log('玩家2閒置動畫載入失敗')
  );
  sprites.player2.walk.img = loadImage('player2/walk.png');
  sprites.player2.jump.img = loadImage('player2/jump.png');

  // 載入攻擊圖片
  sprites.attack1.img = loadImage('bullet.png');
  sprites.attack2.img = loadImage('blast.png');
}

function setup() {
  console.log('設置遊戲...');
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  
  // 設定玩家初始位置
  player1.y = height - 100;
  player2.y = height - 100;
  player1.groundY = height - 100;
  player2.groundY = height - 100;
  
  console.log('Canvas 大小:', width, height);
}

function draw() {
  // 繪製背景
  if (backgroundImg) {
    push();
    imageMode(CORNER);
    let bgScale = height / backgroundImg.height;
    let scaledWidth = backgroundImg.width * bgScale;
    
    image(backgroundImg, bgX, 0, scaledWidth, height);
    image(backgroundImg, bgX + scaledWidth, 0, scaledWidth, height);
    
    bgX -= bgSpeed;
    if (bgX <= -scaledWidth) {
      bgX = 0;
    }
    pop();
  } else {
    background(220);
  }

  // 更新遊戲狀態
  updatePlayer(player1);
  updatePlayer(player2);
  checkKeys();
  checkCollisions();

  // 繪製遊戲元素
  drawCharacter(player1, sprites.player1);
  drawCharacter(player2, sprites.player2);
  drawBullets(player1);
  drawBullets(player2);
  drawHealth();
}

function updatePlayer(player) {
  if (player.isDead) return;
  
  // 重力
  player.speedY += player.gravity;
  player.y += player.speedY;

  // 地面碰撞
  if (player.y > player.groundY) {
    player.y = player.groundY;
    player.speedY = 0;
    player.isJumping = false;
  }
}

function drawCharacter(player, playerSprites) {
  let sprite = playerSprites[player.currentAction];
  if (!sprite || !sprite.img) {
    console.warn('找不到精靈圖:', player.currentAction);
    return;
  }

  push();
  translate(player.x, player.y);
  scale(player.direction, 1);
  
  let sx = player.currentFrame * sprite.width;
  image(sprite.img, 
        0, 0,
        sprite.width, sprite.height,
        sx, 0,
        sprite.width, sprite.height);
  pop();

  // 更新動畫
  if (!player.isDead) {
    player.currentFrame = (player.currentFrame + 1) % sprite.frames;
  }
}

function drawBullets(player) {
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    let bullet = player.bullets[i];
    let sprite = sprites[bullet.type];
    
    if (!sprite || !sprite.img) {
      console.warn('找不到子彈精靈圖:', bullet.type);
      continue;
    }

    push();
    translate(bullet.x, bullet.y);
    scale(bullet.speed > 0 ? 1 : -1, 1);
    
    let sx = bullet.currentFrame * sprite.width;
    image(sprite.img, 
          0, 0,
          sprite.width, sprite.height,
          sx, 0,
          sprite.width, sprite.height);
    pop();

    bullet.x += bullet.speed;
    bullet.currentFrame = (bullet.currentFrame + 1) % sprite.frames;

    if (bullet.x < 0 || bullet.x > width) {
      player.bullets.splice(i, 1);
    }
  }
}

function shoot(player) {
  if (!player.isDead && player.bullets.length < 3) {
    console.log('發射攻擊:', player === player1 ? 'player1' : 'player2');
    
    let bullet = {
      x: player.x + (player.direction === 1 ? 50 : -50),
      y: player.y,
      speed: 8 * player.direction,
      currentFrame: 0,
      type: player === player1 ? 'attack1' : 'attack2'
    };
    
    player.bullets.push(bullet);
  }
}

function checkCollisions() {
  // 檢查玩家1的子彈
  for (let i = player1.bullets.length - 1; i >= 0; i--) {
    let bullet = player1.bullets[i];
    if (checkBulletHit(bullet, player2)) {
      player2.health = Math.max(0, player2.health - 15);
      player1.bullets.splice(i, 1);
      
      if (player2.health <= 0) {
        player2.isDead = true;
        player2.currentAction = 'jump';
      }
    }
  }
  
  // 檢查玩家2的子彈
  for (let i = player2.bullets.length - 1; i >= 0; i--) {
    let bullet = player2.bullets[i];
    if (checkBulletHit(bullet, player1)) {
      player1.health = Math.max(0, player1.health - 15);
      player2.bullets.splice(i, 1);
      
      if (player1.health <= 0) {
        player1.isDead = true;
        player1.currentAction = 'jump';
      }
    }
  }
}

function checkBulletHit(bullet, player) {
  let hitboxWidth = 40;
  let hitboxHeight = 40;
  
  return bullet.x > player.x - hitboxWidth/2 &&
         bullet.x < player.x + hitboxWidth/2 &&
         bullet.y > player.y - hitboxHeight/2 &&
         bullet.y < player.y + hitboxHeight/2;
}

function drawHealth() {
  // 繪製血條背景
  fill(100);
  rect(10, 10, 200, 20);
  rect(width - 210, 10, 200, 20);

  // 繪製血條
  fill(255, 0, 0);
  rect(10, 10, player1.health * 2, 20);
  rect(width - 210, 10, player2.health * 2, 20);

  // 繪製血量數字
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`P1: ${player1.health}`, 15, 25);
  text(`P2: ${player2.health}`, width - 205, 25);
}

function keyPressed() {
  // 玩家1攻擊 (D鍵)
  if (key === 'd' || key === 'D') {
    shoot(player1);
  }
  
  // 玩家2攻擊 (空白鍵)
  if (keyCode === 32) {
    shoot(player2);
  }
}

function checkKeys() {
  // 玩家1控制
  if (keyIsDown(65)) { // A
    player1.x -= player1.speedX;
    player1.direction = -1;
    player1.currentAction = 'walk';
  } else if (keyIsDown(68)) { // D
    player1.x += player1.speedX;
    player1.direction = 1;
    player1.currentAction = 'walk';
  } else {
    player1.currentAction = 'idle';
  }
  
  if (keyIsDown(87) && !player1.isJumping) { // W
    player1.speedY = player1.jumpForce;
    player1.isJumping = true;
    player1.currentAction = 'jump';
  }

  // 玩家2控制
  if (keyIsDown(LEFT_ARROW)) {
    player2.x -= player2.speedX;
    player2.direction = -1;
    player2.currentAction = 'walk';
  } else if (keyIsDown(RIGHT_ARROW)) {
    player2.x += player2.speedX;
    player2.direction = 1;
    player2.currentAction = 'walk';
  } else {
    player2.currentAction = 'idle';
  }
  
  if (keyIsDown(UP_ARROW) && !player2.isJumping) {
    player2.speedY = player2.jumpForce;
    player2.isJumping = true;
    player2.currentAction = 'jump';
  }
}
