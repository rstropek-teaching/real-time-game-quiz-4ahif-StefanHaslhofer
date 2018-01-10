"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var sio = require("socket.io");
var app = express();
var server = http.createServer(app);
var io = sio(server);
var cells = [];
var helpCells = [];
var end = false; //gives overview over current game state
var users = []; //users logged in (different display size, score, user number)
server.listen(3000, function () {
    console.log('listening on *:3000');
});
app.use(express.static(__dirname + '/public'));
var count = 0;
var readyCounter = 0;
io.on('connection', function (socket) {
    if (count < 2) {
        console.log("user connected");
        socket.on('returnCanvasSize', function (sizes) {
            users.push(new user(sizes[0], sizes[1], count));
            io.emit('setUser', users[users.length - 1]);
            count++;
            //io.sockets.connected[userSocketId].emit
        });
    }
    socket.on('mousePressed', function (eliminatedCircle, userNum) {
        cells.splice(eliminatedCircle.index, 1);
        for (var i = 0; i < users.length; i++) {
            if (userNum === users[i].userNum) {
                users[i].score = users[i].score + eliminatedCircle.point;
                io.emit('changeScore', users[i].score, userNum);
            }
        }
    });
    socket.on('ready', function () {
        readyCounter++;
        if (readyCounter == 2) {
            gameLoop();
        }
    });
});
//
function gameLoop() {
    var radius = 40;
    var x = 0;
    var y = 0;
    var canvasName = "game";
    var colors = ["blue", "black", "green", "red", "yellow"];
    var currentColor = colors[Math.floor((Math.random() * ((colors.length - 1) - 1)) + 1)];
    io.emit('changeColor', currentColor); //Set initial color
    var lastColor;
    var newCircleInterval = setInterval(function () {
        x = Math.floor((Math.random() * (100 - 1)) + 1); //Random Positions
        y = Math.floor((Math.random() * (100 - 1)) + 1);
        cells.push(new circle(x, y, radius, colors[(Math.floor((Math.random() * (colors.length - 1) + 1))) - 1]) //Random color
        );
    }, 2000);
    //Calling draw method for printing (1000/60 interval --> 60 FPS)
    var drawInterval = setInterval(function () {
        for (var i = 0; i < cells.length; i++) {
            cells[i].radius = cells[i].radius - 0.05;
            if (cells[i].radius < 5) {
                cells.splice(cells.indexOf(cells[i]), 1);
            }
        }
        io.emit('cells', cells); //broadcast current cell-Array so every user has the same cells
        io.emit('startDrawing'); //draw circle cells with new radius
    }, 1000 / 60);
    //change current color in an random amount of time
    var changeColorInterval = setInterval(function () {
        lastColor = currentColor;
        currentColor = colors[Math.floor((Math.random() * ((colors.length - 1) - 1)) + 1)];
        io.emit('changeColor', currentColor);
    }, 5000);
    //Stop game after certain amount of time
    setTimeout(function () {
        clearInterval(newCircleInterval);
        clearInterval(drawInterval);
        clearInterval(changeColorInterval);
        //only winner gets highscore
        var bestPlayer = new user(0, 0, 0);
        for (var i = 0; i < users.length; i++) {
            if (users[i].score > bestPlayer.score) {
                bestPlayer = users[i];
            }
        }
        io.emit('checkScore', bestPlayer);
        end = true;
    }, 15000);
}
//User class
var user = /** @class */ (function () {
    function user(displayWidth, displayHeigth, userNum) {
        this._score = 0;
        this._displayWidth = displayWidth;
        this._displayHeigth = displayHeigth;
        this._userNum = userNum;
    }
    Object.defineProperty(user.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (score) {
            this._score = score;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(user.prototype, "displayWidth", {
        get: function () {
            return this._displayWidth;
        },
        set: function (displayWidth) {
            this._displayWidth = displayWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(user.prototype, "displayHeigth", {
        get: function () {
            return this._displayHeigth;
        },
        set: function (displayHeigth) {
            this._displayHeigth = displayHeigth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(user.prototype, "userNum", {
        get: function () {
            return this._userNum;
        },
        enumerable: true,
        configurable: true
    });
    return user;
}());
//Circle class
var circle = /** @class */ (function () {
    function circle(x, y, radius, color) {
        this._x = x;
        this._y = y;
        this._radius = radius;
        this._color = color;
    }
    Object.defineProperty(circle.prototype, "radius", {
        //Getter und Setter
        get: function () {
            return this._radius;
        },
        set: function (radius) {
            this._radius = radius;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(circle.prototype, "x", {
        get: function () {
            return this._x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(circle.prototype, "y", {
        get: function () {
            return this._y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(circle.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (color) {
            this._color = color;
        },
        enumerable: true,
        configurable: true
    });
    return circle;
}());
