class Fish {
  image = this.getImage('./fish.png');
  reverseImage = this.getImage('./reverse.png');

  constructor(...args) {
    this.positionY = args[0];
    this.width = args[1];
    this.height = args[2];
    this.margeLeft = args[3];
    this.margeTop = args[4];
    this.minScore = args[5];
    this.totalScore = args[6];
    this.isLookRight = args[7];
    this.id = args[8];
  }

  getImage(src) {
    const fish = new Image();
    fish.src = src;
    return fish;
  }

  initPosition = function() {
    if(this.isLookRight === true) {
      this.positionX = -(this.width);
    } else {
      this.positionX = game.canvasWidth;
    }
  }

  move() {
    if(this.isLookRight) {
      this.positionX += 2;
    } else {
      this.positionX -= 2;
    }
    if(
        this.positionX >= game.canvasWidth && this.isLookRight ||
        this.positionX <= -this.width && !this.isLookRight
      ) {
      game.clearNoVisibleFish(this.id);
    }
  }
}

class Player {
  width = 35;
  height = 25;
  positionX = (game.canvasWidth / 2) - (this.width / 2);
  positionY = (game.canvasHeight / 2) - (this.height / 2);
  image = new Fish().getImage('./player.png');
  imageReverse = new Fish().getImage('./player-reverse.png');
  isRight = true;
  keys = {
    w: {
      pressed: false,
    },
    a: {
      pressed: false,
    },
    s: {
      pressed: false,
    },
    d: {
      pressed: false,
    },
  };

  move() {
      if(this.keys.w.pressed && this.positionY > 0) {
        this.positionY -= 3;
      }
      if(this.keys.a.pressed && this.positionX > 0) {
        this.positionX -= 3;
      }
      if(this.keys.s.pressed && this.positionY < game.canvas.height - this.height) {
        this.positionY += 3;
      }
      if(this.keys.d.pressed && this.positionX < game.canvas.width - this.width) {
        this.positionX += 3;
      }
  }

  setEvents() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      switch(key) {
        case 'a':
        case 'ф':
          this.keys.a.pressed = true;
          this.isRight = false;
          break;
        case 'w':
        case 'ц':
          this.keys.w.pressed = true;
          break;
        case 'd':
        case 'в':
          this.keys.d.pressed = true;
          this.isRight = true;
          break;
        case 's':
        case 'ы':
          this.keys.s.pressed = true;
          break;
      }
    });
    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      switch(key) {
        case 'a':
        case 'ф':
          this.keys.a.pressed = false;
          break;
        case 'w':
        case 'ц':
          this.keys.w.pressed = false;
          break;
        case 'd':
        case 'в':
          this.keys.d.pressed = false;
          break;
        case 's':
        case 'ы':
          this.keys.s.pressed = false;
          break;
      }
    });
  };
};


class Game {
  canvas = null;
  ctx = null;
  canvasWidth = 0;
  canvasHeight = 0;
  createFishIntervalId = 0;
  score = 0;
  fishes = [];
  player = null;
  isGameOver = false;

  init() {
    this.canvas = document.getElementById('game');
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = this.canvas.offsetWidth;
    this.canvasHeight = this.canvas.offsetHeight;
    this.createIntervals();
    this.player = new Player();
    this.player.setEvents();
  };

  createFish() {
    const rollFishSize = ~~(Math.random() * fishSizes.length);
    const rollFishVariable = ~~(Math.random() * fishesVariables.length);
    const currentSize = fishSizes[rollFishSize];
    const currentVariable = fishesVariables[rollFishVariable];

    return new Fish(
      this.getRandomPosition(),
      currentSize.width,
      currentSize.height,
      currentVariable.leftMarge,
      currentVariable.topMarge,
      currentSize.minScore,
      currentSize.totalScore,
      this.getTrueOrFalse(),
      Date.now(),
    )
  }

  clearNoVisibleFish(id) {
    this.fishes = this.fishes.filter(fish => fish.id !== id);
  }

  getTrueOrFalse() {
    return !!(~~(Math.random() * 2))
  }

  getRandomPosition() {
    const startY = 0;
    const endY = this.canvasHeight - 60;

    return ~~(Math.random() * (endY - startY) + startY);
  }

  createIntervals() {
    this.createFishIntervalId = setInterval(this.spawnFish.bind(this), 250);
  }

  spawnFish() {
    let fish = this.createFish();
    fish.initPosition();
    this.fishes.push(fish);
  }

  animate() {
    if(this.isGameOver) {
      return;
    }

    window.requestAnimationFrame(this.animate.bind(game));
    this.drawBg();
    this.drawFishes();
    this.drawPlayer();
    this.player.move();
    this.ctx.font = "small-caps bold 24px/1 sans-serif";
    this.ctx.fillText(`Очки: ${this.score}`, 50, 50);
    
  };

  drawBg() {
    const image = new Image();
    image.src = './bg.jpg'
    this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height)
  };

  drawFishes() {
    for(let fish of this.fishes) {
      if(this.player.positionX < fish.positionX + fish.width &&
         this.player.positionX + this.player.width > fish.positionX && 
         this.player.positionY < fish.positionY + fish.height &&
         this.player.positionY + this.player.height > fish.positionY) {
          if(fish.minScore <= this.score) {
            this.fishes = this.fishes.filter(item => item.id !== fish.id);
            this.score += fish.totalScore;
            this.player.width = (this.score + 150) * 2 / 10;
            this.player.height = (this.score + 150) * 2 / 15;
          } else {
            this.gameOver();
          }
      }
      this.ctx.drawImage(
        fish.isLookRight ? fish.image : fish.reverseImage,
        fish.margeLeft,
        fish.margeTop,
        135,
        90,
        fish.positionX,
        fish.positionY,
        fish.width,
        fish.height,
      );
      fish.move();
    }
  };

  gameOver() {
    this.canvas.style.display = 'none';
    preview.style.display = 'flex';
    this.isGameOver = true;
    looseInfo.style.display = 'block';
    scoreInfo.textContent = `Вы набрали ${this.score} очков!`
  }

  drawPlayer() {
    this.ctx.drawImage(
        this.player.isRight ? this.player.image : this.player.imageReverse,
        this.player.positionX,
        this.player.positionY,
        this.player.width,
        this.player.height,
      )

  }

  start() {
    this.init();
    this.animate();
  }
}



fishSizes = [
  {
    width: 80,
    height: 60,
    minScore: 300,
    totalScore: 25,
  },
  {
    width: 50,
    height: 40,
    minScore: 150,
    totalScore: 20,
  },
  {
    width: 35,
    height: 25,
    minScore: -10,
    totalScore: 15,
  }
]

fishesVariables = [
  {
    leftMarge: 15,
    topMarge: 0,
  },
  {
    leftMarge: 155,
    topMarge: 0,
  },
  {
    leftMarge: 320,
    topMarge: 0,
  },
  {
    leftMarge: 460,
    topMarge: 0,
  },
]

const startButton = document.querySelector('.start__game');
const preview = document.querySelector('.preview');
const canvas = document.getElementById('game');
const looseInfo = document.querySelector('.loose__info');
const scoreInfo = document.querySelector('.scores')
let game;

startButton.addEventListener('click', () => {
  game = new Game();
  canvas.style.display = 'block';
  preview.style.display = 'none';
  game.start();
})


