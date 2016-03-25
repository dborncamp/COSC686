var canvas;
var gl;
var myCube;


// Identifies the databuffer where vertex coords are stored.
var vertexAttributeBuffer;
// Identifies the vertex attribute variable in the shader program.
var vertexAttributeLocation;
// Identifies the color uniform variable in the shader program.
var colorUniformLocation;


window.onload = function init(){
//    try {
        canvas = document.getElementById( "gl-canvas" );

        gl = WebGLUtils.setupWebGL( canvas );
        if ( !gl ) { alert( "WebGL isn't available" ); }

        // get the canvas
        var program = initShaders( gl, "vertex-shader", "fragment-shader" );
        gl.useProgram( program );

        // make the cube
        myCube = cube(1);

        // Draw it
        drawPrimitive(gl.TRIANGLES, myCube.TriangleFaceColors, myCube.TriangleVertices);
//    } catch (e) {
//      alert("Could not initialize WebGL! " + e);
//      return;
//   }
}



/**
 * Draws a WebGL "primitive."  The first paramter must be one of the constants
 * that specifiy primitives:  gl.POINTS, gl.LINES, gl.LINE_LOOP, gl.LINE_STRIP,
 * gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN.  The second parameter must
 * be an array of 4 numbers in the range 0.0 to 1.0, giving the RGBA component of
 * the color of the primitive.  The third parameter must be an array of numbers.
 * The length of the array must be an even number.  Each pair of numbers provides
 * one vertex for the primitive.  NOTE: this function is function is very dependent
 * on the particular shader program that is used in this file and on the setup
 * that is done in the init() function.
 */
function drawPrimitive( primitiveType, color, vertices ) {
   // Sets which buffer to use for the vertex array.
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexAttributeBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

   gl.vertexAttribPointer(vertexAttributeLocation, 2, gl.FLOAT, false, 0, 0);
   gl.uniform4fv(colorUniformLocation, color);
   gl.drawArrays(primitiveType, 0, vertices.length/2);
}

