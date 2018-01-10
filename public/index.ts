//import { saveAs } from 'file-saver';

let canvasName: string = "game";
let user:any;
let cells:any[];
let socket:any;
let currentColor: string;

function drawCircles(){
    var canvas = <HTMLCanvasElement>document.getElementById(canvasName);
    canvas.width = window.innerWidth;     // equals window dimension -> Playground size
    canvas.height = window.innerHeight;
    
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < cells.length; i++) {
        if(cells[i]._radius>0){
            ctx.beginPath();
            ctx.arc(cells[i]._x*user._displayWidth/100,cells[i]._y*user._displayHeigth/100, cells[i]._radius, 0, 2 * Math.PI);
            ctx.fillStyle = cells[i]._color;
            ctx.fill();
        }   
    } 
}

function setUser(user2:any){//Set User to set circle in proportion of display size
    if(user==null){
        user=user2;
    }
    
}

function getUser():any{//Set User to set circle in proportion of display size
    return user;
}

function setSocket(socket2:any){//Set User to set circle in proportion of display size
    socket=socket2;
}

function setCells(cells2:any){//Set User to set circle in proportion of display size
    cells=cells2;
}

function getCells():any[]{//Set User to set circle in proportion of display size
    return cells;
}

function getCanvasSize():number[]{

    let sizes:number[]=[window.innerWidth,window.innerHeight];
    return sizes;
}

function setCurrentColor(color:any){
    currentColor=color;
    $('#color').css('background', currentColor);
}

function printMousePos(event: any)  {
    var canvas = <HTMLCanvasElement>document.getElementById(canvasName);
    let offLeft = canvas.offsetLeft;
    let offTop = canvas.offsetTop;
    let eliminatedCircle:any;
    
    for (let i = 0; i < cells.length; i++) {
        //formula to evaluate if a point is in a circle
        
        if (Math.pow((event.clientX - offLeft - cells[i]._x*user._displayWidth/100), 2) + Math.pow((event.clientY - offTop + 5 - cells[i]._y*user._displayHeigth/100), 2) <= Math.pow(cells[i]._radius, 2)) {
            if (cells[i]._color === currentColor) {
                eliminatedCircle={point:1,index:cells.indexOf(cells[i])};//+1 point when right circle is clicked
                socket.emit('mousePressed',eliminatedCircle,user._userNum);
            } else {
                eliminatedCircle={point:-4,index:cells.indexOf(cells[i])};//-4 point when wrong circle is clicked
                socket.emit('mousePressed',eliminatedCircle,user._userNum);
            }
        }
    }
}

//start button when window loads
$(window).on('load', function () {
    $('#modalWindow').modal('show');
    $('.modal-backdrop').removeClass("modal-backdrop");
});

function playerReady(){//When player clicks start, a counter on the server will be incremented
    socket.emit('ready');
    $('#modalWindow').modal('hide');
}
