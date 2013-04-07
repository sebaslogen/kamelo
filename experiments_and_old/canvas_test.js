/**
 * Created with JetBrains WebStorm.
 * User: neoranga
 * Date: 9/03/13
 * Time: 22:57
 * To change this template use File | Settings | File Templates.
 */

var canvas = null;
var context = null;
var assets = ['resources/images/kami-001.png',
    'resources/images/kami-002.png',
    'resources/images/kami-003.png'/*,
    'resources/images/kami-004.png',
    'resources/images/kami-005.png',
    'resources/images/kami-006.png',
    'resources/images/kami-007.png',
    'resources/images/kami-008.png',
    'resources/images/kami-009.png',
    'resources/images/kami-010.png',
    'resources/images/kami-011.png',
    'resources/images/kami-012.png',
    'resources/images/kami-013.png'*/
    ];
var frames = [];
var frame = 0;
var onImageLoad = function(){
    console.log("IMAGE!!!");
};

var setup = function() {
    canvas = document.createElement('canvas');

    canvas.id = "Playground";
    canvas.width = 1024;
    canvas.height = 768;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.border = "1px solid";


    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);

    var playground = document.getElementById("Playground");


    context = canvas.getContext('2d');

    // Load each image URL from the assets array into the frames array in the correct order.
    for (var i = 0; i<assets.length; i++) {
        var image = new Image();
        image.onload = onImageLoad;
        image.src = assets[i];
        frames.push(image);
    }
    // Afterwards, call setInterval to run at a framerate of 30 frames per second, calling the animate function each time.
    window.setInterval(animate, 1000/10);
};

var animate = function(){
    // Draw each frame in order, looping back around to the
    // beginning of the animation once you reach the end.
    // Draw each frame at a position of (0,0) on the canvas.
    // YOUR CODE HERE
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(frames[frame], 0, 0);
    frame = (frame + 1) % frames.length;
};