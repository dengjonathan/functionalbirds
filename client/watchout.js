const state = {
  width: 900,
  height: 600,
  iconWidth: 50,
  iconHeight: 50,
  aspect: width / height,
  nodeNum: 25,
  collisions: 0,
  currentScore: 0,
  highScore: 0,
  speed: 25,
  interval: 500,
  images: ['blue', 'green', 'red', 'RED_THINKING_AWESOMENESS', 'Surprised_Chuck', 'white', 'yellow'],
  backgroundNum: 2,
  difficulty: 'easy',
  timeouts: [],
  status: 'stop',
  nodes: null
};


/*****************************DATA OBJECTS************************************/

const randomInt = (end, st = 0) => (Math.floor(Math.random() * (end - st)) + st);

const posOrNeg = _ => randomInt(-1, 1);
//TODO: verify if this works?

const randomFromArr = arr => arr[randomInt(arr.length)];

const createANode = (width, height, image, stepSize) => {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    xD: switchDirection(),
    yD: switchDirection(),
    img: randomFromArr(images),
    step: stepSize
  };
}

const createNodes = (num, width, height, images, stepSize) => {
  d3.range(num).map(() => {
    let image = randomFromArr(images);
    return createANode(width, height, image, stepSize);
  });
};

/*****************************GEN SVG GAME BOARD************************************/
const genOuterBackground = (color) => {
  d3.select('body')
    .style('background-color', '#9CFFFA')
};

const genBoard = (width, height, color, backgroundImg) => {
  d3.select('.board').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr('viewBox', '0 0 900 600')
    .style('border', '1px solid black')
    .style('background-color', 'lightblue')
    .style('background-image', 'url("images/background2.png")')
    .style('background-size', 'cover')
    .classed('svg-content-responsive', true);
};

//takes svg as an argument
const makeResponsive = (element) => {
  d3.select(window)
    .on("resize", () => {
      let targetWidth = element.node().getBoundingClientRect().width;
      svg.attr("width", targetWidth);
      svg.attr("height", targetWidth / aspect);
    });
};

/*****************************Creating Enemies/ Player*********************************/

const genEnemies = (svgElement, data, iconWidth, iconHeight) => {
  return svgElement.selectAll('circle') //TODO: is there any reason to select all 'circles' when we just change to a svg:image?
    .data(data)
    .enter()
    .append('svg:image')
    .attr('xlink:href', d => d.img)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', iconWidth)
    .attr('height', iconHeight);
};

// the following 3 functions are for player mousedrag movement
const dragstarted = function () {
  d3.select(this).raise().classed('active', true);
};

const dragged = function () {
  d3.select(this).attr('x', d.x = d3.event.x).attr('y', d.y = d3.event.y);
};

const dragended = function () {
  d3.select(this).classed('active', false);
};

const genPlayer = (svgElement, data, iconWidth, iconHeight) => {
  return svgElement.append('svg:image')
    .data(data)
    // make this use your new helper functions
    .attr('xlink:href', 'images/pig.png')
    .attr('width', iconWidth)
    .attr('height', iconHeight)
    .attr('x', d => d.x)
    .attr('y', d => d.y);
};

const actionizePlayer = (playerSelector, startFn, dragFn, endFn) => {
  return playerSelector.call(
    d3.drag()
    .on('start', startFn)
    .on('drag', dragFn)
    .on('end', endFn));
};

/*****************************ENEMY MOVEMENT************************************/

const update = data => {
  return data.map(e => {
    let node = {

    };

    if (e.x > width || e.x < 0) {
      e.xD *= -1;
    }
    e.x += e.step * e.xD;
    if (e.y > height || e.y < 0) {
      e.yD *= -1;
    }
    e.y += e.step * e.yD;
    e.step = 3; //TODO: find someway to set back to default step size
  });
};

const collide = data => {
  var playerBox = player.node().getBBox();
  var playerLeft = playerBox.x;
  var playerRight = playerBox.x + playerBox.width - 25;
  var playerTop = playerBox.y;
  var playerBottom = playerBox.y + playerBox.height - 25;
  var collided = false;

  data.forEach(function (enemy) {
    var enemyLeft = enemy.x - 7;
    var enemyRight = enemy.x + 25;
    var enemyTop = enemy.y - 7;
    var enemyBottom = enemy.y + 25;
    var horiCollision = playerLeft < enemyRight && playerRight > enemyLeft;
    var verCollision = playerTop < enemyBottom && playerBottom > enemyTop;

    if (horiCollision && verCollision) {
      enemy.xD *= -1; //causes the enemy to turn on collision with player
      enemy.yD *= -1;
      enemy.step += 25;
      update(nodes);
      collisions++;
      collided = true;
      d3.select('#collision-num').text(collisions);
      d3.select('body')
        .style('background-color', 'red');
      currentScore = 0; // TODO: is there better way to reset the score?
      timeouts.push(setTimeout(function () {
        d3.select('body')
          .style('background-color', '#9CFFFA')
      }, 10));
    }
  });

  if (collided) {
    timeouts.push(setTimeout(collide.bind(null, nodes), 4 * speed));
  } else {
    timeouts.push(setTimeout(collide.bind(null, nodes), speed));
  }
};

var move = function () {
  update(nodes);
  enemies.data(nodes)
    .attr('x', function (d) {
      return d.x
    })
    .attr('y', function (d) {
      return d.y
    });
  timeouts.push(setTimeout(move, speed));
};

/*****************************GAME MECHANICS************************************/

var changeBackground = function () {
  backgroundNum = backgroundNum < 3 ? backgroundNum += 1 : 1;
  svg.style('background-image', `url("images/background${backgroundNum}.png")`);
};

var changeDifficulty = function () {
  console.log('difficulty');
  difficulty = difficulty === 'easy' ? 'hard' : 'easy';
  opposite = difficulty === 'easy' ? 'hard' : 'easy';
  speed = difficulty === 'easy' ? 25 : 15;
  d3.select('.difficulty').text(opposite);
}

d3.select('.background')
  .on('click', changeBackground);

d3.select('.difficulty')
  .on('click', changeDifficulty);

var keepScore = function () {
  timeouts.push(setInterval(score, 500));
};

var score = function () {
  currentScore++;
  if (highScore < currentScore) {
    highScore = currentScore;
  }
  d3.select('#current-score').text(currentScore);
  d3.select('#high-score').text(highScore);
}

var initGame = function () {
  move();
  keepScore();
  collide(nodes);
};

var stop = function () {
  timeouts.forEach(function (each) { clearTimeout(each) });
};

d3.select('.start')
  .on('click', function () {
    if (status === 'stop') {
      status = 'start';
      initGame();
    } else {
      status = 'stop';
      stop();
    }
    d3.select(this).text(status === 'start' ? 'stop' : 'start');
  });
