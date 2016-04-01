var canvas;
var gl;

var program, program1;
var vBuffer, vBuffer1, vBuffer2;     //points
var vPosition, vPosition1, vPosition2; //points

// object things
var myCube, myCube1;
var myCylinder;

var points = [];
var points1 = [];
var points2 = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;


var ixAxis = 0;
var iyAxis = 1;
var izAxis = 2;

var iaxis = 0;
var itheta = [ 0, 0, 0 ];

var ithetaLoc;

var irate = 5;

var flag = true;
var individual_rot = true;

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
canvas = document.getElementById( "gl-canvas" );

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );

    myCube = cube(1);
    myCylinder = cylinder(72, 3, true);
    myCylinder.scale(0.5, 0.5, 0.5);
    myCylinder.rotate(45.0, [ 1, 1, 1]);

    myCube.scale(0.5, 0.5, 0.5);
    myCube.rotate(45.0, [ 1, 1, 1]);
    myCube.translate(.5,.5,.5);

    myCube1 = cube(.25);
    myCube1.translate(.0,.5,0);
    
    //Make the points array
    points = points.concat(myCube.TriangleVertices);
    points1 = points1.concat(myCube1.TriangleVertices);
    points2 = points2.concat(myCylinder.TriangleVertices);
    console.log(flatten(points));

    aspect =  canvas.width/canvas.height;
    
    //gl.enable(gl.DEPTH_TEST);
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // export data to the buffers
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );
    

    vBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );

 
    // Set up the view point
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
//    document.getElementById("Button11").onclick = function(){fovy -= 5.0;};
//    document.getElementById("Button12").onclick = function(){fovy += 5.0;};
    
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

    // Indivdual rotation
    document.getElementById( "indx" ).onclick = function () {
        iaxis = ixAxis;
    };
    document.getElementById( "indy" ).onclick = function () {
        iaxis = iyAxis;
    };
    document.getElementById( "indz" ).onclick = function () {
        iaxis = izAxis;
    };
    document.getElementById("toggleind").onclick = function(){individual_rot = !individual_rot;};

    document.getElementById("irate_increase").onclick = function(){irate +=2;};
    document.getElementById("irate_derease").onclick = function(){irate -=2;};



    canvas.addEventListener("mousedown",mousemove, false);
    canvas.addEventListener("mouseup", stopmove, false);
    canvas.addEventListener("mousewheel", mousewheel, false);
    canvas.addEventListener("DOMMouseScroll", mousewheel, false);

    render(); 
}

/**
 * Mouse interaction.
 */
function mousemove(event){
    xpos = event.pageX;     // Get the horizontal coordinate
    ypos = event.pageY;     // Get the vertical coordinate
    
    var xdiff, ydiff;
    
    var curx = at[0];
    var cury = at[1];
    
    document.onmousemove = function(event){//console.log("hi");//mousemove();
        xposdown = event.pageX;     // Get the horizontal coordinate
        yposdown = event.pageY;     // Get the vertical coordinate
       
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
/**
 * Zoom with the mouse wheel. It works but not quite the way I want to.
 * 
 * This just changes the FOV of 
 */
//canvas.onmousewheel = function (event){
function mousewheel(event){
    var zoomy = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    
    if (zoomy < 0){
        fovy -= 5.0;
    } else{
        fovy += 5.0;
    }
    console.log("Mousewheel "+fovy,zoomy);
    
}


function stopmove(event){
    document.onmousemove = function(){
        //Nothing!!
    }
}




function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    eye = vec3(radius*Math.sin(theta_camera)*Math.cos(phi), 
        radius*Math.sin(theta_camera)*Math.sin(phi), radius*Math.cos(theta_camera));
    mvMatrix = lookAt(eye, at , up);
    pMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    if(flag) theta[axis] += 1.0;
    gl.uniform3fv(thetaLoc, theta);    

    if(individual_rot){

        var irotaxis = [1, 0, 0];
        if(iaxis == 1){ irotaxis = [0, 1, 0];}
        if(iaxis == 2){ irotaxis = [0, 0, 1];}

        myCube.rotate(irate, irotaxis);
        myCube1.rotate(irate, irotaxis);
        myCylinder.rotate(irate, irotaxis);
        
        points = points.concat(myCube.TriangleVertices);
        points1 = points1.concat(myCube1.TriangleVertices);
        points2 = points2.concat(myCylinder.TriangleVertices);

        console.log("Individual rotation: ", points[0], irate, irotaxis);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );
    

    vBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );


    }
                
//    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    //myCube
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

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


    requestAnimFrame(render);
}
