//import { saveAs } from 'file-saver';
var canvasName = "game";
var user;
var cells;
var socket;
var currentColor;
function drawCircles() {
    var canvas = document.getElementById(canvasName);
    canvas.width = window.innerWidth; // equals window dimension -> Playground size
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < cells.length; i++) {
        if (cells[i]._radius > 0) {
            ctx.beginPath();
            ctx.arc(cells[i]._x * user._displayWidth / 100, cells[i]._y * user._displayHeigth / 100, cells[i]._radius, 0, 2 * Math.PI);
            ctx.fillStyle = cells[i]._color;
            ctx.fill();
        }
    }
}
function setUser(user2) {
    if (user == null) {
        user = user2;
    }
}
function getUser() {
    return user;
}
function setSocket(socket2) {
    socket = socket2;
}
function setCells(cells2) {
    cells = cells2;
}
function getCells() {
    return cells;
}
function getCanvasSize() {
    var sizes = [window.innerWidth, window.innerHeight];
    return sizes;
}
function setCurrentColor(color) {
    currentColor = color;
    $('#color').css('background', currentColor);
}
function printMousePos(event) {
    var canvas = document.getElementById(canvasName);
    var offLeft = canvas.offsetLeft;
    var offTop = canvas.offsetTop;
    var eliminatedCircle;
    for (var i = 0; i < cells.length; i++) {
        //formula to evaluate if a point is in a circle
        if (Math.pow((event.clientX - offLeft - cells[i]._x * user._displayWidth / 100), 2) + Math.pow((event.clientY - offTop + 5 - cells[i]._y * user._displayHeigth / 100), 2) <= Math.pow(cells[i]._radius, 2)) {
            if (cells[i]._color === currentColor) {
                eliminatedCircle = { point: 1, index: cells.indexOf(cells[i]) }; //+1 point when right circle is clicked
                socket.emit('mousePressed', eliminatedCircle, user._userNum);
            }
            else {
                eliminatedCircle = { point: -4, index: cells.indexOf(cells[i]) }; //-4 point when wrong circle is clicked
                socket.emit('mousePressed', eliminatedCircle, user._userNum);
            }
        }
    }
}
//start button when window loads
$(window).on('load', function () {
    $('#modalWindow').modal('show');
    $('.modal-backdrop').removeClass("modal-backdrop");
});
function playerReady() {
    socket.emit('ready');
    $('#modalWindow').modal('hide');
}
