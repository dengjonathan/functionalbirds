(function () {

  'use strict';

  window.state = {
    width: 900,
    height: 600,
    iconWidth: 50,
    iconHeight: 50,
    get aspect() {
      return this.width / this.height;
    },
    stepSize: 3,
    numOfEnemies: 25,
    collisions: 0,
    currentScore: 0,
    highScore: 0,
    speed: 25,
    interval: 500,
    images: ['blue', 'green', 'red', 'RED_THINKING_AWESOMENESS', 'Surprised_Chuck', 'white', 'yellow'],
    playerImage: '',
    backgroundNum: 1,
    difficulty: 'easy',
    timeouts: [],
    status: 'stop',
    enemyData: null,
    playerData: null,
    // d3 selected DOM nodes
    enemies: null,
    outerBackground: null,
    board: null,
    player: null,
  };

  const state = window.state;

  /****************************DATA OBJECTS************************************/

  const randomInt = (max, min) => Math.floor(Math.random() * (max - min + 1)) + min;

  const posOrNeg = _ => Math.random() > 0.5 ? -1 : 1;

  const randomFromArr = arr => arr[randomInt(0, arr.length)];

  const createANode = (width, height, image, stepSize) => {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      xD: posOrNeg(),
      yD: posOrNeg(),
      img: `images/${image}`,
      step: stepSize
    };
  };

  const createNodes = (num, width, height, images, stepSize) => {
    return d3.range(num).map(() => {
      return createANode(width, height, randomFromArr(images), stepSize);
    });
  };

  /**********************GEN SVG GAME BOARD************************************/

  const genOuterBackground = (color) => {
    return d3.select('body')
      .style('background-color', color);
  };

  const genBoard = (width, height, color, backgroundImg) => {
    return d3.select('.board').append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('border', '1px solid black')
      .style('background-color', 'lightblue')
      .style('background-image', 'url("images/background1.png")')
      .style('background-size', 'cover')
      .classed('svg-content-responsive', true);
  };

  //takes svg as an argument
  const makeResponsive = (selector) => {
    return d3.select(window)
      .on('resize', () => {
        let targetWidth = selector.node().getBoundingClientRect().width;
        selector.attr('width', targetWidth);
        selector.attr('height', targetWidth / state.aspect);
      });
  };

  /*****************Creating Enemies/ Player*********************************/
  const genEnemies = (selector, data, iconWidth, iconHeight) => {
    return selector.selectAll('circle') //TODO: is there any reason to select all 'circles' when we just change to a svg:image?
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

  const updateData = (data, state) => {
    return data.map(e => {
      let node = {};
      if (e.x > state.width || e.x < 0) {
        node.xD *= -1;
      }
      node.x += e.step * node.xD;
      if (e.y > state.height || e.y < 0) {
        node.yD *= -1;
      }
      node.y += e.step * node.yD;
      node.step = window.state.enemyStepSize; // set step size back to default
      node.img = e.img;
      return node;
    });
  };

  // used to get left/right/top/bottom limits of player/enemy objects
  const getCorners = selector => {
    let BBox = selector.node().getBBox();
    let left = BBox.x;
    let right = BBox.x + BBox.width;
    let top = BBox.y;
    let bottom = BBox.y + BBox.height;
    let collided = false; //FIXME: put this where it makes sense
    return [left, right, top, bottom];
  };

  const collide = data => {
    let [pLeft, pRight, pTop, pBottom] = getCorners(player);


    return data.map(function (enemy) {
      let enemyLeft = enemy.x - 7;
      let enemyRight = enemy.x + 25;
      let enemyTop = enemy.y - 7;
      let enemyBottom = enemy.y + 25;
      let horiCollision = playerLeft < enemyRight && playerRight > enemyLeft;
      let verCollision = playerTop < enemyBottom && playerBottom > enemyTop;

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
            .style('background-color', '#9CFFFA');
        }, 10));
      }
    });

    if (collided) {
      timeouts.push(setTimeout(collide.bind(null, nodes), 4 * speed));
    } else {
      timeouts.push(setTimeout(collide.bind(null, nodes), speed));
    }
  };

  const move = function (nodes) {
    updateData(nodes, state);
    state.enemies.data(nodes)
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y;
      });
    timeouts.push(setTimeout(move, speed));
  };

  /*****************************GAME MECHANICS************************************/

  const changeBackground = () => {
    backgroundNum = backgroundNum < 3 ? backgroundNum += 1 : 1;
    state.board.style('background-image', `url("images/background${backgroundNum}.png")`);
  };

  const changeDifficulty = () => {
    difficulty = difficulty === 'easy' ? 'hard' : 'easy';
    opposite = difficulty === 'easy' ? 'hard' : 'easy';
    speed = difficulty === 'easy' ? 25 : 15;
    d3.select('.difficulty').text(opposite);
  };

  const keepScore = function () {
    timeouts.push(setInterval(score, 500));
  };

  const score = function () {
    currentScore++;
    if (highScore < currentScore) {
      highScore = currentScore;
    }
    d3.select('#current-score').text(currentScore);
    d3.select('#high-score').text(highScore);
  };

  const initGame = function () {
    // generate all the data needed
    state.enemyData = createNodes(state.numOfEnemies, state.width, state.height, state.images, state.stepSize);
    state.playerData = createANode(state.width, state.height, state.images, state.stepSize);

    // generate all d3 selected elements
    genOuterBackground('#9CFFFA');
    state.board = genBoard(state.width, state.height, '#9CFFFA', 'images/background1.png'); //FIXME: don't hard code these arguments
    state.enemies = genEnemies(state.board, state.enemyData, state.iconWidth, state.iconHeight);
    // start all in-game timeouts/intervals
    move(state.enemies);
    keepScore();
    collide(nodes);

    d3.select('.background')
      .on('click', changeBackground);

    d3.select('.difficulty')
      .on('click', changeDifficulty);

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
  };

  var stop = function () {
    timeouts.forEach(function (each) { clearTimeout(each); });
  };

  initGame();

})();
