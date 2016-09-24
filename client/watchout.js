// start slingin' some d3 here.
// our plan:
// 1. create an svg element
// 2. create enemies and make them move
// 3. creeat a dot to move with mouse
// 4. detect collision
// 5. update scores
// 6. make enemies do tricks
var width = 300;
var height = 200;
var nodeNum = 20;
var radius=3;
var xStep=3;
var yStep=1;

// d3.select('.board').style('border', '1px solid black');
var svg = d3.select('.board').append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('border', '1px solid black');

var switchDirection=function(){  //<--
  return  Math.random() < 0.5 ? -1 : 1;
};

var nodes = d3.range(nodeNum).map(function () {
  return { x: Math.random() * width, y: Math.random() * height, xD:switchDirection(), yD:switchDirection()};
});

// var drag = d3.behavior.drag()
//     .on("drag", function(d,i) {
//         d.x += d3.event.dx
//         d.y += d3.event.dy
//         d3.select(this).attr("transform", function(d,i){
//             return "translate(" + [ d.x,d.y ] + ")"
//         })
//     });
var dragstarted=function(d){
  d3.select(this).raise().classed('active',true);
};

var dragged=function(d){
  d3.select(this).attr('cx',d.x=d3.event.x).attr('cy',d.y=d3.event.y);
};

var dragended=function(d){
  d3.select(this).classed('active',false);
}

var enemies = svg.selectAll('circle')
    .data(nodes)
  .enter().append('circle')
    .attr('cx', function (d) {
      return d.x
    })
    .attr('cy', function (d) {
      return d.y
    })
    .attr('r',radius)
    .style('fill','#ff69b4');

var player=svg.append('circle')  //<-- create the player
    .data([{'x': width/2,'y': height/2}])
    // .attr("transform", "translate(" + cx + "," + cy + ")")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr('r',radius)
    .style('fill','#92A8D1')
    .call(d3.drag()
        .on('start',dragstarted)
        .on('drag',dragged)
        .on('end',dragended));

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
var update=function(data){
  data.forEach(function(e) {
    // let xD = xStep;
    // let yD = yStep;
     if(e.x>width || e.x<0){
      e.xD *= -1;
    }
    e.x += xStep*e.xD;
  if(e.y>height || e.y<0){
      e.yD *= -1;
    }
    e.y += yStep*e.yD;
  });
};

var move = function() {
  update(nodes);
  enemies.data(nodes)
    .attr('cx', function(d){return d.x})
    .attr('cy', function(d){return d.y});
  setTimeout(move, 50);
}
//enemies.each(move);
// for(var i=0;i<=nodeNum;i++){
//   move(enemies[i]);
// }
move();


