// start slingin' some d3 here.
// our plan:
// 1. create an svg element
// 2. create enemies and make them move
// 3. creeat a dot to move with mouse
// 4. detect collision
// 5. update scores
// 6. make enemies do tricks
var width = 900;
var height = 600;
var nodeNum = 20;
var radius = 3;
var xStep = 3;
var yStep = 1;
var collisions = 0;
var currentScore = 0;
var highScore = 0;
var speed = 30;
var interval = 500;
var images = ['blue', 'green', 'red', 'RED_THINKING_AWESOMENESS', 'Surprised_Chuck', 'white', 'yellow'];
var backgroundNum = 2;
var difficulty = 'easy';
// d3.select('.board').style('border', '1px solid black');
d3.select('body')
  // .style('background-image','url("images/Light-Wood-Background.jpg")');
  .style('background-color','#9CFFFA')

var svg = d3.select('.board').append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', '0 0 900 600')
  .style('border', '1px solid black')
  .style('background-color', 'lightblue')
  .style('background-image', 'url("images/background2.png")')
  .style('background-size', 'cover');

var switchDirection = function () { //<--
  return Math.random() < 0.5 ? -1 : 1;
};

/*****************************GAME BUTTONS************************************/

var changeBackground = function() {
  backgroundNum = backgroundNum < 3 ? backgroundNum+=1 : 1;
  svg.style('background-image', `url("images/background${backgroundNum}.png")`)
};

var changeDifficulty = function() {
  difficulty = difficulty === 'easy' ? 'hard' : 'easy';
  opposite = difficulty === 'easy' ? 'hard' : 'easy';
  speed = difficulty === 'easy' ? 30 : 10;
  d3.select('.difficulty').text(opposite);
}

d3.select('.background')
    .on('click', changeBackground);

d3.select('.difficulty')
    .on('click', changeDifficulty);

var nodes = d3.range(nodeNum).map(function () {
  var file = images[Math.floor(Math.random() * images.length)]
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    xD: switchDirection(),
    yD: switchDirection(),
    img: `images/${file}.png`
  };
});

var dragstarted = function (d) {
  d3.select(this).raise().classed('active', true);
};

var dragged = function (d) {
  d3.select(this).attr('x', d.x = d3.event.x).attr('y', d.y = d3.event.y);
};

var dragended = function (d) {
  d3.select(this).classed('active', false);
}

var enemies = svg.selectAll('circle')
  .data(nodes)
  .enter()
  // .append('circle')

  // .attr('r', radius)
  // .style('fill', '#ff69b4')
  .append('svg:image')
    .attr('xlink:href', function(d) {return d.img})
    .attr('x', function (d) {
      return d.x
    })
    .attr('y', function (d) {
      return d.y
    })
    .attr('width', 50)
    .attr('height', 50);

var player = svg.append('svg:image') //<-- create the player
  .data([{ 'x': width / 2, 'y': height / 2 }])
  .attr('xlink:href', 'images/pig.png')
  .attr('width', 50)
  .attr('height', 50)
  .attr("x", function (d) {
    return d.x; })
  .attr("y", function (d) {
    return d.y; })
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended));


// var move=function(data, index){
//   d3.select(this).attr('cx',function(){
//     var x=+svg.select(this).attr('cx');
//     if(x>width || x<0){
//       xStep*=-10;
//     }
//     return x+=xStep;
//   })
//       .attr('cy',function(){
//     var y=+svg.select(this).attr('cy');
//     if(y>height || y<0){
//       yStep*=-10;
//     }
//     return y+=yStep;
//   });
//   setInterval(move,5);
// };
//
var update = function (data) {
  data.forEach(function (e) {
    // let xD = xStep;
    // let yD = yStep;
    if (e.x > width || e.x < 0) {
      e.xD *= -1;
    }
    e.x += xStep * e.xD;
    if (e.y > height || e.y < 0) {
      e.yD *= -1;
    }
    e.y += yStep * e.yD;
  });
};

//console.log(player.node().getBBox(),player.attr('cx'),player.attr('cy'));
var collide = function (data) {
  var playerBox = player.node().getBBox();
  var playerLeft = playerBox.x;
  var playerRight = playerBox.x + playerBox.width;
  var playerTop = playerBox.y;
  var playerBottom = playerBox.y + playerBox.height;
  var collided = false;

  data.forEach(function (enemy) {
    var enemyLeft = enemy.x;
    var enemyRight = enemy.x + 50;
    var enemyTop = enemy.y - 50;
    var enemyBottom = enemy.y + radius;
    // var horiCollision=enemyLeft <= playerLeft <= enemyRight||enemyLeft<=playerRight<=enemyRight;
    var horiCollision = playerLeft < enemyRight && playerRight > enemyLeft;
    // var verCollision=enemyTop<=playerTop<=enemyBottom||enemyTop<=playerBottom<=enemyBottom;
    var verCollision = playerTop < enemyBottom && playerBottom > enemyTop;

    if (horiCollision && verCollision) {
      collisions++;
      collided = true;
      d3.select('#collision-num').text(collisions);
      d3.select('body')
        .style('background-color','red');
      currentScore = 0; // TODO: is there better way to reset the score?
      setTimeout(function(){
        d3.select('body')
          .style('background-color','#9CFFFA')
      },10);
      }
  });

  if (collided) {
    setTimeout(collide.bind(null, nodes), 3 * speed);
  } else {
    setTimeout(collide.bind(null, nodes), speed);
  }
}

var move = function () {
    update(nodes);
    enemies.data(nodes)
      .attr('x', function (d) {
        return d.x })
      .attr('y', function (d) {
        return d.y });
  setTimeout(move, speed);
};

var keepScore = function () {
  setInterval(score, interval);
 };

var score = function() {
  currentScore++;
  if (highScore < currentScore) {
    highScore = currentScore;
  }
  d3.select('#current-score').text(currentScore);
  d3.select('#high-score').text(highScore);
}

move();
keepScore();
collide(nodes);
