var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var flag = true;

var near = 1.0;
var far = 6.0;
var radius = 4.0;
var theta_camera  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var xposdown;
var yposdown;
var xposup;
var yposup;
var dragscale = 0.01;

var mysphere = sphere();


var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];


/*
var vertices = [
        vec4( -0.0, -0.0,  1.0, 1.0 ),
        vec4( -0.0,  1.0,  1.0, 1.0 ),
        vec4(  1.0,  1.0,  1.0, 1.0 ),
        vec4(  1.0, -0.0,  1.0, 1.0 ),
        vec4( -0.0, -0.0, -0.0, 1.0 ),
        vec4( -0.0,  1.0, -0.0, 1.0 ),
        vec4(  1.0,  1.0, -0.0, 1.0 ),
        vec4(  1.0, -0.0, -0.0, 1.0 )
    ];
*/
var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    colorCube();
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
        
    aspect =  canvas.width/canvas.height;
    
    gl.enable(gl.DEPTH_TEST);
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    // make a sphere
/*
    var sbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sbuffer);
    gl.bufferData( gl.ARRAY_BUFFER, mysphere.TriangleVertexColors, gl.STATIC_DRAW);
*/
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);
/*
    var scolor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(scolor, 768, gl.FLOAT, false, 0 , 0);
    gl.enableVertexAttribArray(scolor);
*/    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
/*    
    var vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, mysphere.TextureCoordinates, gl.STATIC_DRAW );
*/    
    
        
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
/*
    var vPosition1 = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition1, 768, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition1 );
*/

 
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
// buttons for viewing parameters
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta_camera += dr;};
    document.getElementById("Button6").onclick = function(){theta_camera -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("Button11").onclick = function(){fovy -= 5.0;};
    document.getElementById("Button12").onclick = function(){fovy += 5.0;};
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render(); 
}

/**
 * Mouse interaction.
 */
function mousemove(){
    xpos = event.clientX;     // Get the horizontal coordinate
    ypos = event.clientY;     // Get the vertical coordinate
    
    var xdiff, ydiff;
    
    var curx = at[0];
    var cury = at[1];
    
    document.onmousemove = function(){//console.log("hi");//mousemove();
        xposdown = event.clientX;     // Get the horizontal coordinate
        yposdown = event.clientY;     // Get the vertical coordinate
       
        xdiff = (xposdown - xpos) * dragscale;
        ydiff = (ypos - yposdown) * dragscale;
//        var coor = "Down: X coords: " + xposdown + ", Y coords: " + yposdown;
        console.log(at[0], xpos, xposdown, xdiff);
        at[0] = curx - xdiff;
        at[1] = cury - ydiff;
    }
    
    var coor = "X coords: " + xpos + ", Y coords: " + ypos + "Down: " + xposdown;

    console.log(coor);

}

function stopmove(){
    document.onmousemove = function(){
        //Nothing!!
    }
}
function pressedhelper(pressx, pressy){
    hxpos = event.clientX;     // Get the horizontal coordinate
    hypos = event.clientY;     // Get the vertical coordinate
    
    xdiff = pressx - hxpos;
    console.log("pressedhelper: " + xdiff);
}


function colorCube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) {
    // Add things to the array.
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);     
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);
     
}


var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    eye = vec3(radius*Math.sin(theta_camera)*Math.cos(phi), 
        radius*Math.sin(theta_camera)*Math.sin(phi), radius*Math.cos(theta_camera));
    mvMatrix = lookAt(eye, at , up);
    pMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    if(flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);    
                
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    //gl.drawArrays( gl.TRIANGLES, 36, 768 );
    requestAnimFrame(render);
}