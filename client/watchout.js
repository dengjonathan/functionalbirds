var width = 900;
var height = 600;
var nodeNum = 25;
var collisions = 0;
var currentScore = 0;
var highScore = 0;
var speed = 25;
var interval = 500;
var images = ['blue', 'green', 'red', 'RED_THINKING_AWESOMENESS', 'Surprised_Chuck', 'white', 'yellow'];
var backgroundNum = 2;
var difficulty = 'easy';
var timeouts = [];
var status = 'stop';

/*****************************DATA OBJECTS************************************/
var switchDirection = function () {
  return Math.random() < 0.5 ? -1 : 1;
};

var nodes = d3.range(nodeNum).map(function () {
  var file = images[Math.floor(Math.random() * images.length)];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    xD: switchDirection(),
    yD: switchDirection(),
    img: `images/${file}.png`,
    step: 3
  };
});

/*****************************PLAYER MOVEMENT************************************/
var dragstarted = function (d) {
  d3.select(this).raise().classed('active', true);
};

var dragged = function (d) {
  d3.select(this).attr('x', d.x = d3.event.x).attr('y', d.y = d3.event.y);
};

var dragended = function (d) {
  d3.select(this).classed('active', false);
};


/*****************************D3 Selectors************************************/

d3.select('body')
    .style('background-color', '#9CFFFA')

var svg = d3.select('.board').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', '0 0 900 600')
    .style('border', '1px solid black')
    .style('background-color', 'lightblue')
    .style('background-image', 'url("images/background2.png")')
    .style('background-size', 'cover');

var enemies = svg.selectAll('circle')
    .data(nodes)
  .enter()
    .append('svg:image')
    .attr('xlink:href', function(d) { return d.img })
    .attr('x', function (d) {
      return d.x;
    })
    .attr('y', function (d) {
      return d.y;
    })
    .attr('width', 50)
    .attr('height', 50);

var player = svg.append('svg:image')
    .data([{ 'x': width / 2, 'y': height / 2 }])
    .attr('xlink:href', 'images/pig.png')
    .attr('width', 50)
    .attr('height', 50)
    .attr('x', function (d) {
      return d.x;
    })
    .attr('y', function (d) {
      return d.y; })
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

/*****************************ENEMY MOVEMENT************************************/

var update = function (data) {
  data.forEach(function (e) {
    if (e.x > width || e.x < 0) {
      e.xD *= -1;
    }
    e.x += e.step * e.xD;
    if (e.y > height || e.y < 0) {
      e.yD *= -1;
    }
    e.y += e.step * e.yD;
    e.step = 3;
  });
};

var collide = function (data) {
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
      enemy.step +=25;
      update(nodes);
      collisions++;
      collided = true;
      d3.select('#collision-num').text(collisions);
      d3.select('body')
        .style('background-color', 'red');
      currentScore = 0; // TODO: is there better way to reset the score?
      timeouts.push(setTimeout(function(){
        d3.select('body')
            .style('background-color','#9CFFFA')
      }, 10 ));
    }
  });

  if (collided) {
    timeouts.push(setTimeout(collide.bind(null, nodes), 4  * speed));
  } else {
    timeouts.push(setTimeout(collide.bind(null, nodes), speed));
  }
};

var move = function () {
  update(nodes);
  enemies.data(nodes)
    .attr('x', function (d) {
      return d.x })
    .attr('y', function (d) {
      return d.y });
  timeouts.push(setTimeout(move, speed));
};

/*****************************GAME MECHANICS************************************/

var changeBackground = function() {
  backgroundNum = backgroundNum < 3 ? backgroundNum+=1 : 1;
  svg.style('background-image', `url("images/background${backgroundNum}.png")`);
};

var changeDifficulty = function() {
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

var score = function() {
  currentScore++;
  if (highScore < currentScore) {
    highScore = currentScore;
  }
  d3.select('#current-score').text(currentScore);
  d3.select('#high-score').text(highScore);
}

var initGame = function() {
  move();
  keepScore();
  collide(nodes);
};

var stop = function() {
  timeouts.forEach(function(each) { clearTimeout(each) });
};

d3.select('.start')
    .on('click', function() {
      if (status === 'stop') {
        status = 'start';
        initGame();
      } else {
        status = 'stop';
        stop();
      }
      d3.select(this).text(status === 'start' ? 'stop' : 'start');
    });
