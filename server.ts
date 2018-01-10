import * as express from 'express';
import * as http from 'http';
import * as sio from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = sio(server);

let cells: circle[] = [];
let helpCells: circle[] = [];
let end: boolean = false;//gives overview over current game state
let users: user[] = [];//users logged in (different display size, score, user number)

server.listen(3000, function () {
  console.log('listening on *:3000');
});

app.use(express.static(__dirname + '/public'));

let count: number = 0;
let readyCounter: number = 0;

io.on('connection', function (socket: any) {
  if (count < 2) {
    console.log("user connected");
    socket.on('returnCanvasSize', function (sizes: any) {//Calculating the display size for each user
      users.push(new user(sizes[0], sizes[1], count));
      io.emit('setUser', users[users.length - 1]);
      count++;
      //io.sockets.connected[userSocketId].emit
    });
  }
  socket.on('mousePressed', function (eliminatedCircle: any, userNum: number) {
    cells.splice(eliminatedCircle.index, 1);
    for (let i = 0; i < users.length; i++) {
      if (userNum === users[i].userNum) {
        users[i].score = users[i].score + eliminatedCircle.point;
        io.emit('changeScore', users[i].score, userNum);
      }
    }

    
  });
  socket.on('ready', function () {//When player clicks start button --> game increments counter
    readyCounter++;
    if (readyCounter == 2) {
      gameLoop();
    }
  });
});



//
function gameLoop() {//all intervals will be written into a variable so i can suspend them after a certain time
  let radius: number = 40;
  let x: number = 0;
  let y: number = 0;
  let canvasName: string = "game";

  let colors: string[] = ["blue", "black", "green", "red", "yellow"];
  let currentColor: string = colors[Math.floor((Math.random() * ((colors.length - 1) - 1)) + 1)];
  io.emit('changeColor', currentColor);//Set initial color
  let lastColor: string;

  let newCircleInterval: any = setInterval(function () {//Generating a new circle every 2 seconds
    x = Math.floor((Math.random() * (100 - 1)) + 1); //Random Positions
    y = Math.floor((Math.random() * (100 - 1)) + 1);

    cells.push(new circle(x, y, radius,
      colors[(Math.floor((Math.random() * (colors.length - 1) + 1))) - 1])//Random color
    );
  }, 2000);

  //Calling draw method for printing (1000/60 interval --> 60 FPS)
  let drawInterval: any = setInterval(function () {
    for (let i = 0; i < cells.length; i++) {
      cells[i].radius = cells[i].radius - 0.05;
      if (cells[i].radius < 5) {//When the radius is smaller than a certain value, a circle cell will be deleted
        cells.splice(cells.indexOf(cells[i]), 1);
      }
    }
    io.emit('cells', cells);//broadcast current cell-Array so every user has the same cells
    io.emit('startDrawing');//draw circle cells with new radius
  }, 1000 / 60);

  //change current color in an random amount of time
  let changeColorInterval: any = setInterval(function () {
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
    let bestPlayer:user=new user(0,0,0);
    for(let i=0;i<users.length;i++){
      if(users[i].score>bestPlayer.score){
        bestPlayer=users[i];
      }
    }
    io.emit('checkScore', bestPlayer);
    end = true;
  }, 15000);
}

//User class
class user {
  private _displayWidth: number;
  private _displayHeigth: number;
  private _score: number = 0;
  private _userNum: number;

  constructor(displayWidth: number, displayHeigth: number, userNum: number) {
    this._displayWidth = displayWidth;
    this._displayHeigth = displayHeigth;
    this._userNum = userNum;
  }

  get score(): number {
    return this._score;
  }
  set score(score: number) {
    this._score = score;
  }

  get displayWidth(): number {
    return this._displayWidth;
  }
  set displayWidth(displayWidth: number) {
    this._displayWidth = displayWidth;
  }

  get displayHeigth(): number {
    return this._displayHeigth;
  }

  set displayHeigth(displayHeigth: number) {
    this._displayHeigth = displayHeigth;
  }

  get userNum(): number {
    return this._userNum;
  }
}

//Circle class
class circle {
  private _x: number;
  private _y: number;
  private _radius: number;
  private _color: string;

  constructor(x: number, y: number, radius: number, color: string) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._color = color;
  }

  //Getter und Setter
  get radius(): number {
    return this._radius;
  }
  set radius(radius: number) {
    this._radius = radius;
  }

  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }

  get color(): string {
    return this._color
  }
  set color(color: string) {
    this._color = color;
  }
}