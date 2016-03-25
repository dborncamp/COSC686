"use strict";

var canvas;
var gl;
var myCube;
var program;

var NumVertices = 36;


window.onload = function init(){
//    try {
        // get the canvas
        canvas = document.getElementById( "gl-canvas" );

        // setup the canvas
        gl = WebGLUtils.setupWebGL( canvas );
        if ( !gl ) { alert( "WebGL isn't available" ); }

        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
        gl.enable(gl.DEPTH_TEST);

        // make the cube
        myCube = cube(1);

        // get the canvas and set up the program
        program = initShaders( gl, "vertex-shader", "fragment-shader" );
        gl.useProgram( program );

        // create a buffer to start loading the data onto the GPU
        console.log(myCube.VertexColors);  // debugging line
        var cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(myCube.cubeTriangleVertexColors), gl.STATIC_DRAW );

        // set up the vertex information
        var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        // send the vertex information into the buffer to the GPU
        var vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(myCube.TriangleVertices), gl.STATIC_DRAW );

        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        // Draw it
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
        //render()
//    } catch (e) {
//      alert("Could not initialize WebGL! " + e);
//      return;
//   }
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
