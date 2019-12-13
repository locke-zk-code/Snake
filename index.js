var squareWidth = 30, // 一个方块的宽度
  squareHeight = 30, // 一个方块的高度
  rowNumber = 20, // 行数
  columnNumber = 20, // 列数
  speed = 300, // 蛇移动的速度，是一个定时器的毫秒数
  targetCorrd = []; // 目标的坐标值

/**
 * 操作每一个小方块
 * 方块的高度和宽度均由全局变量 squareWidth 和 squareHeight 来代替
 * @param {Number} x 方块的 x 轴坐标
 * @param {Number} y 方块的 y 轴坐标
 * @param {String} classname 给方块添加一个类名，声明这个方块是什么？snakeHead: 这个方块是蛇头；snakeBody: 这个方块是蛇的身体；target: 这个方块是蛇要吃掉的目标
 */
function Square(x, y, classname) {
  // 对坐标进行转换，x 轴：1 ==> sw；y 轴：1 ==> squareHeight
  this.x = x * squareWidth;
  this.y = y * squareHeight;

  this.classname = classname;

  // 让 div 元素来代表一个小方块
  this.squareCarrier = document.createElement('div');
  // 声明这个小方块是什么
  this.squareCarrier.className = this.classname;

  // 所有方块的载体
  this.parentCarrier = document.querySelector('.body');
}

// 把方块转换为DOM并追加到页面之中
Square.prototype.create = function () {
  // 为方块载体定义样式
  this.squareCarrier.style.position = 'absolute';
  // left ==> x 轴；top => y 轴；
  // 因为 this.x 和 this.y 已经进行了转换，所以直接使用即可
  this.squareCarrier.style.left = this.x + 'px';
  this.squareCarrier.style.top = this.y + 'px';
  this.squareCarrier.style.width = squareWidth + 'px';
  this.squareCarrier.style.height = squareHeight + 'px';

  // 把方块追加到页面之中
  this.parentCarrier.appendChild(this.squareCarrier);
}

// 移除一个小方块，适用于蛇的目标
Square.prototype.remove = function () {
  this.parentCarrier.removeChild(this.squareCarrier);
}

// 关于蛇的信息
function Snake() {
  this.head = null; // 蛇头的信息
  this.tail = null; // 蛇尾的信息

  // 该属性是一个坐标值的集合，每一个元素都是一个坐标值，如：[1, 0]，是一个二维数组
  // 保存着整条蛇的每一节的坐标
  this.coordSet = [];

  // 保存蛇移动的方向，这是一个基值，表示每个方向每个轴移动的距离
  this.baseDirection = {
    // 蛇向左移动
    left: {
      x: -1,
      y: 0
    },
    // 蛇向右移动
    right: {
      x: 1,
      y: 0
    },
    // 蛇向上移动
    up: {
      x: 0,
      y: -1
    },
    // 蛇向下移动
    down: {
      x: 0,
      y: 1
    }
  };
}

// 初始化
Snake.prototype.init = function () {
  let snakeHeadX = 2,
    snakeHeadY = 0,
    snakeBody1X = 1,
    snakeBody1Y = 0,
    snakeBody2X = 0,
    snakeBody2Y = 0;

  // 默认地，蛇由三节组成，一个蛇头，两个蛇躯
  // 声明蛇头
  let snakeHead = new Square(snakeHeadX, snakeHeadY, 'snakeHead');
  snakeHead.create(); // 实现蛇头

  // 保存蛇头的状态
  this.head = snakeHead;
  // 保存蛇头的坐标
  this.coordSet.push([snakeHeadX, snakeHeadY]);

  // 声明蛇躯
  let snakeBody1 = new Square(snakeBody1X, snakeBody1Y, 'snakeBody');
  snakeBody1.create();

  // 保存蛇躯 1 的坐标
  this.coordSet.push([snakeBody1X, snakeBody1Y]);

  let snakeBody2 = new Square(snakeBody2X, snakeBody2Y, 'snakeBody');
  snakeBody2.create();

  // 保存蛇尾的状态
  this.tail = snakeBody2;
  // 保存蛇躯 2 的坐标
  this.coordSet.push([snakeBody2X, snakeBody2Y]);

  // 借用链表来把由N节组成的蛇形成一个整体
  snakeHead.last = null;
  snakeHead.next = snakeBody1;

  snakeBody1.last = snakeHead;
  snakeBody1.next = snakeBody2;

  snakeBody2.last = snakeBody1;
  snakeBody2.next = null;

  // 默认地，蛇向右移动
  this.direction = this.baseDirection.right;
}

// 根据蛇移动的方向获取下一个坐标值
Snake.prototype.getNextCoord = function () {
  let nextCoord = [
    /**
     * 我们应该使用未转化后的坐标（1, 2, 3, ...）而不是转换后的坐标（0, 30, 60, 90, ...）
     * 所以 x 和 y 轴都要除以 squareWidth 和 squareHeight
     * 因为我们要知道蛇移动的下一个元素是什么？即蛇移动的下一个坐标是多少
     * 所以要加上蛇移动方向的 x 和 y 值
     **/
    this.head.x / squareWidth + this.direction.x,
    this.head.y / squareHeight + this.direction.y
  ];

  return nextCoord;
}

// 根据下一个坐标值判断是游戏结束还是继续移动还是吃掉目标
Snake.prototype.decisionAction = function (coord) {
  /**
   * 如果下一个坐标是自己，game over
   * 我们把蛇的每一节坐标值都保存在构造函数中的 coordSet 坐标集中
   * 只需要判断下一个坐标值是否在这个坐标集中即可
   **/
  let isSelf = false;

  this.coordSet.forEach((c) => {
    if (c[0] === coord[0] && c[1] === coord[1]) {
      // 撞到自己了
      isSelf = true;
    }
  });

  if (isSelf) {
    this.action.gameOver.call(this);

    return;
  }

  /**
   * 如果下一个坐标是围墙，game over
   * 墙一共有四边
   * 顶边即 y 轴小于 0
   * 右边即 x 轴大于列数 - 1
   * 底边即 y 轴大于行数 - 1
   * 左边即 x 轴小于 0
   */
  if (
    (coord[0] > columnNumber - 1) ||
    (coord[0] < 0) ||
    (coord[1] < 0) ||
    (coord[1] > rowNumber - 1)
  ) {
    // 撞到墙了
    this.action.gameOver.call(this);

    return;
  }

  // 如果下一个坐标是目标，eat
  if (coord[0] === targetCorrd[0] && coord[1] === targetCorrd[1]) {
    this.action.move.call(this, true);
    this.action.eat.call(this);
    // 加分
    game.score += 1;
  }

  // 如果下一个坐标是？？，move
  this.action.move.call(this);
}

// 定义行为
Snake.prototype.action = {
  // 移动
  move: function (isEat = false) {
    /**
     * 移动的原理：
     * 1. 新建一个蛇躯，放在原来蛇头的下一个位置
     * 2. 删掉原来的蛇头，创建一个新的蛇头放在新建的蛇躯的上一个位置
     * 3. 删掉蛇尾，让最后一个蛇躯成为蛇尾
     * 4. 如果是吃掉目标，就不删掉蛇尾
     */
    let newBodyX = this.head.x / squareWidth;
    let newBodyY = this.head.y / squareHeight;

    let newBody = new Square(newBodyX, newBodyY, 'snakeBody');
    newBody.create();

    // 更新链表
    this.head.next.last = newBody;
    newBody.next = this.head.next;
    newBody.last = null;

    // 新建一个蛇头
    let newHeadX = newBody.x / squareWidth + this.direction.x;
    let newHeadY = newBody.y / squareHeight + this.direction.y;

    let newHead = new Square(newHeadX, newHeadY, 'snakeHead');
    newHead.create();

    // 更新链表
    newBody.last = newHead;
    newHead.next = newBody;
    newHead.last = null;

    // 删掉原来的蛇头
    this.head.remove();

    // 删掉蛇尾
    if (!isEat) {
      this.tail.remove();
      // 保存蛇头的状态
      this.tail = this.tail.last;
      this.tail.next = null;
      // 删除坐标集中最后一个元素
      this.coordSet.shift();
    }

    this.head = newHead;

    // 更新坐标集，把新蛇头的坐标移入第一个
    this.coordSet.push([newHead.x / squareWidth, newHead.y / squareHeight]);
  },

  // 吃
  eat: function () {
    buildTarget();
  },

  // game over
  gameOver: function () {
    game.over();
  }
}

// 随即生成目标
function buildTarget() {
  let x = null; // 目标的 x 值
  let y = null; // 目标的 y 值
  let isRightPosition = true; // 目标是否在正确的位置上？目标不可以超过围墙，不能处于蛇身上

  while (isRightPosition) {
    x = Math.round(Math.random() * (columnNumber - 1));
    y = Math.round(Math.random() * (rowNumber - 1));

    snake.coordSet.forEach((c) => {
      if (x !== c[0] && y !== c[1]) isRightPosition = false;
    })
  }

  // 保存坐标值
  targetCorrd = [x, y];

  // 根据生成的随即坐标值，创建目标元素
  let check = document.querySelector('.target');

  // 如果生成了目标，则删除
  if (check) check.parentNode.removeChild(check);

  let target = new Square(x, y, 'target');
  target.create();
}

// 创建游戏逻辑
function Game() {
  this.timer = null; // 定时器
  this.score = 0; // 分数
}

// 初始化游戏
Game.prototype.init = function () {
  snake.init(); // 初始化蛇身及其位置
  buildTarget(); // 生成随即位置的目标

  // 键盘事件
  // 上方向键：38；右方向键：39；下方向键：40；左方向键：38；
  document.addEventListener('keydown', function () {
    if (event.which === 37 && snake.direction !== snake.baseDirection.right && snake.direction !== snake.baseDirection.left) {
      snake.direction = snake.baseDirection.left;
    } else if (event.which === 38 && snake.direction !== snake.baseDirection.down && snake.direction !== snake.baseDirection.up) {
      snake.direction = snake.baseDirection.up;
    } else if (event.which === 39 && snake.direction !== snake.baseDirection.left && snake.direction !== snake.baseDirection.right) {
      snake.direction = snake.baseDirection.right;
    } else if (event.which === 40 && snake.direction !== snake.baseDirection.up && snake.direction !== snake.baseDirection.down) {
      snake.direction = snake.baseDirection.down;
    }
  })

  // 开始游戏
  this.start();
}

// 开始游戏
Game.prototype.start = function () {
  this.timer = setInterval(() => {
    let nextCoord = snake.getNextCoord();

    snake.decisionAction(nextCoord);
  }, speed);
}

// 停止游戏
Game.prototype.stop = function () {
  // 停止定时器
  clearInterval(this.timer);
}

// 继续游戏
Game.prototype.continue = function () {
  game.start();
}

// 游戏结束
Game.prototype.over = function () {
  // 停止定时器
  clearInterval(this.timer);

  // 清除 DOM 元素
  document.querySelector('.body').innerHTML = '';

  // 重置数据
  snake = new Snake();
  game = new Game();

  // 显示遮罩层
  document.querySelector('.start-game').style.display = 'none';
  document.querySelector('.pause-game').style.display = 'none';
  document.querySelector('.over-game').style.display = 'block';
  document.querySelector('.score').innerHTML = this.score;
  document.querySelector('.mask').classList.remove('hidd-mask');
}

// 点击开始游戏按钮，隐藏遮罩层，游戏开始！
document.querySelector('.start-game').addEventListener('click', () => {
  document.querySelector('.mask').classList.add('hidd-mask');

  game.init();
})

// 点击确定按钮，显示开始游戏
document.querySelector('.ok').addEventListener('click', () => {
  document.querySelector('.start-game').style.display = 'block';
  document.querySelector('.pause-game').style.display = 'none';
  document.querySelector('.over-game').style.display = 'none';
})

// 面板点击事件，暂停游戏
document.querySelector('.body').addEventListener('click', () => {
  document.querySelector('.start-game').style.display = 'none';
  document.querySelector('.pause-game').style.display = 'block';
  document.querySelector('.over-game').style.display = 'none';
  document.querySelector('.mask').classList.remove('hidd-mask');
  game.stop();
})

// 点我继续
document.querySelector('.pause-game').addEventListener('click', () => {
  document.querySelector('.mask').classList.add('hidd-mask');
  game.continue();
})

var snake = new Snake();
var game = new Game();
