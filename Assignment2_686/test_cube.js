"use strict";

var canvas;
var gl;
var myCube;
var myCube1;
var myCylinder;
var program;
var program1;


//define the points.
var points = [];
var colors = [];
var points1 = [];
var colors1 = [];

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );

    // setup the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    gl.viewport( 0, 0, canvas.width, canvas.height );

    //make the cube
    myCube = cube(1);
    myCylinder = cylinder(72, 3, true);
    myCube.scale(0.5, 0.5, 0.5);
    myCube.rotate(45.0, [ 1, 1, 1]);
    myCube.translate(1,1,1);

    myCube1 = cube(.5);
    myCube1.translate(.0,.5,0);
    
    //populate the points
    points = points.concat(myCube.TriangleVertices);
    colors = points.concat(myCube.TriangleVertexColors);
    console.log(flatten(points));

    points1 = points1.concat(myCube1.TriangleVertices);
    colors1 = points1.concat(myCube1.TriangleVertexColors);
    console.log(flatten(points1));

    // set up the shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //Send things to the GPU
//    var cBuffer = gl.createBuffer();
//    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
//    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

//    var vColor = gl.getAttribLocation( program, "vColor" );
//    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
//    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.TRIANGLES, 0, myCube.TriangleVertices.length );

    
    gl.useProgram( program1 );
    var vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );
    

    var vPosition1 = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition1, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition1 );

    gl.drawArrays( gl.TRIANGLES, 0, myCube1.TriangleVertices.length );

    render();
}

function render(){
    gl.drawArrays( gl.TRIANGLES, 0, myCube.TriangleVertices.length );
    gl.drawArrays( gl.TRIANGLES, 0, myCube1.TriangleVertices.length );
}
