"use strict";

// weblg things.
var canvas;
var gl;

var program, program1;
var vBuffer, vBuffer1, vBuffer2;     //points
var vPosition, vPosition1, vPosition2; //points
//var cBuffer, cBuffer1;     //colors
//var vColor, vColor1;       //colors

// Object variables
var myCube, myCube1;
var myCylinder;

//define the points.
var points = [];
//var colors = [];
var points1 = [];
//var colors1 = [];
var points2 = [];

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );

    // setup the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    gl.viewport( 0, 0, canvas.width, canvas.height );

    //make the cube
    myCube = cube(1);
    myCylinder = cylinder(72, 3, true);
    myCylinder.scale(0.5, 0.5, 0.5);
    myCylinder.rotate(45.0, [ 1, 1, 1]);

    myCube.scale(0.5, 0.5, 0.5);
    myCube.rotate(45.0, [ 1, 1, 1]);
    myCube.translate(.5,.5,.5);

    myCube1 = cube(.25);
    myCube1.translate(.0,.5,0);
    
    //populate the points
    points = points.concat(myCube.TriangleVertices);
//    colors = points.concat(myCube.TriangleVertexColors);
    console.log(flatten(points));

    points1 = points1.concat(myCube1.TriangleVertices);
//    colors1 = points1.concat(myCube1.TriangleVertexColors);
    console.log(flatten(points1));

    points2 = points2.concat(myCylinder.TriangleVertices);
//    colors2 = points2.concat(myCylinder.TriangleVertexColors);
    console.log(flatten(points2));

    // set up the shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
//    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //Send things to the GPU
//    cBuffer = gl.createBuffer();
//    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
//    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

//    var vColor = gl.getAttribLocation( program, "vColor" );
//    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
//    gl.enableVertexAttribArray( vColor );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    //colors
//    cBuffer = gl.createBuffer();
//    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
//    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    

//    gl.drawArrays( gl.TRIANGLES, 0, myCube.TriangleVertices.length );

    
//    gl.useProgram( program1 );
    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );
    

    vBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );

//    gl.drawArrays( gl.TRIANGLES, 0, myCube1.TriangleVertices.length );

    render();
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT );

    //myCube
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //color
//    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
//    vColor = gl.getAttribLocation( program, "vColor" );
//    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
//    gl.enableVertexAttribArray( vColor );
//    gl.clear(gl.COLOR_BUFFER_BIT);
//    

    gl.drawArrays( gl.TRIANGLES, 0, myCube.TriangleVertices.length );


    //myCube1
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    vPosition1 = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition1, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition1 );

    gl.drawArrays( gl.TRIANGLES, 0, myCube1.TriangleVertices.length );



    //myCylinder
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    vPosition2 = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition2, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition2 );

    gl.drawArrays( gl.TRIANGLES, 0, myCylinder.TriangleVertices.length );

}
