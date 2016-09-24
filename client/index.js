var express = require('express');
var app = express();
var path = require('path');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(path.join(__dirname)));
app.use("/styles", express.static(__dirname + '/css'));
app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/images", express.static(__dirname + '/img'));
app.use("/components", express.static(__dirname + '/bower_components'));

// viewed at http://localhost:8080
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.listen(process.env.PORT || 8080);
