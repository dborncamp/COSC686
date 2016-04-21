// Canvas things
var canvas;
var gl;

// arrays that will be exported to the shader.
var modelView, projection;
// The shader program that this file will communicate with.
var program;

// define axies
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
//rotation things
var axis = 0;
var theta = [ 0, 0, 0 ];
var theta1 = [ 0, 0, 0 ];

var flag = false;

// array to hold points
var points = [];
var colors = [];

var cutoffs = [];

// containers that have number of points in our objects
var ncylin, nsphere, ncube;

var myCylinder, mySphere, myCube;

var ncubes = 5;
var thetaSeed = [];

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    
    // make a cylinder
    myCylinder = cylinder(100, 4, true);
    myCylinder.scale(0.6, 0.6, 0.6);
    myCylinder.rotate(45.0, [1, 1, 1]);
    myCylinder.translate(0, 0.3, 0.0);
    
    // make a sphere
    mySphere = sphere(4);
    mySphere.scale(0.6, 0.6, 0.6);
    mySphere.rotate(45.0, [1, 1, 1]);
    mySphere.translate(-0.2, -0.1, 0.0);
    
    // make a cube
    myCube = cube();
    myCube.scale(0.5, 0.5, 0.5);
    myCube.translate(0.5, 0.5, 0.5);
    
    // Put all of the points for each object togather in one array
    // This means that we will be putting them all in the same buffer
    // so keeping track of the indicies is very important. 
    points = myCylinder.TriangleVertices;
    points = points.concat(mySphere.TriangleVertices);
    points = points.concat(myCube.TriangleVertices);
    
    // put all of the colors together in the same way.
    colors = myCylinder.TriangleVertexColors;
    colors = colors.concat(mySphere.TriangleVertexColors);
    colors = colors.concat(myCube.TriangleVertexColors);
    
    // Get the indicies
    ncylin = myCylinder.TriangleVertices.length;
    nsphere = mySphere.TriangleVertices.length;
    ncube = myCube.TriangleVertices.length;
    cutoffs.push(ncylin + nsphere + ncube);
    console.log(cutoffs);
    
    for (var i=0; i<ncubes; i++){
        var seedx = randomIntFromInterval(-100, 100) / 100;
        var seedy = randomIntFromInterval(-100, 100) / 100;
        var seedz = randomIntFromInterval(-100, 100) / 100;
        thetaSeed.push(randomIntFromInterval(-10, 10));
        var newCube = cube();
        newCube.scale(0.2, 0.2, 0.2);
        newCube.translate(seedx, seedy, seedz);
        points = points.concat(newCube.TriangleVertices);
        colors = colors.concat(newCube.TriangleVertexColors);
        cutoffs.push(newCube.TriangleVertices.length + cutoffs[cutoffs.length-1]);
        console.log(seedx, seedy, seedz);
        console.log(thetaSeed);
    }
    
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    
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

    
    // set up projection matrix
    projection = ortho(-1, 1, -1, 1, -100, 100)
          
    gl.useProgram( program );
    // send the projection matrix to the gpu
    // This will stay the same throughout the life of the program
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"),
                        false, flatten(projection)); 
    // draw things
    render();
}
function randomIntFromInterval(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
    //return Math.random()*(max-min+1)+min;
}

function render(){
    if(flag) theta[axis] += 0.5;
    if(flag) theta1[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    
    // make the modelView
    modelView = mat4();
    // multiply the modelView. mult and rotate are in mv.js
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));    
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    /*
    console.log(modelView);
    console.log(program);
    console.log(ncylin);
    console.log(nsphere);
    */
    
    // send the modelView matrix to the gpu
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelView"),
                        false, flatten(modelView)); 
                        
    gl.drawArrays( gl.TRIANGLES, 0, ncylin + nsphere);
    
    //gl.drawArrays( gl.TRIANGLES, 0, nsphere);
    gl.uniform3fv(thetaLoc, theta1);
    
    modelView = mult(modelView, rotate(theta1[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta1[yAxis], [0, 1, 0] ));    
    modelView = mult(modelView, rotate(theta1[zAxis], [0, 0, 1] ));    
    
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelView"),
                        false, flatten(modelView));     
    
    //gl.drawArrays( gl.TRIANGLES, ncylin + nsphere, ncylin + nsphere + ncube);
    gl.drawArrays( gl.TRIANGLES, ncylin + nsphere, ncube);
    
    for(var i=1; i<ncubes; i++){
        var spintheta = [ 0, 0, 0 ];
        //var thetaSeed = randomIntFromInterval(-10, 10);
        if(flag) spintheta[axis] += thetaSeed[i];
        gl.uniform3fv(thetaLoc, spintheta);
        console.log(spintheta,i);
        modelView1 = mat4();
        // multiply the modelView. mult and rotate are in mv.js
        modelView1 = mult(modelView1, rotate(spintheta[xAxis], [1, 0, 0] ));
        modelView1 = mult(modelView1, rotate(spintheta[yAxis], [0, 1, 0] ));    
        modelView1 = mult(modelView1, rotate(spintheta[zAxis], [0, 0, 1] ));

        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelView"),
                            false, flatten(modelView1));
        gl.drawArrays(gl.TRIANGLES, cutoffs[i -1], cutoffs[i] - cutoffs[i -1]);
    }
    
    requestAnimFrame( render );
}