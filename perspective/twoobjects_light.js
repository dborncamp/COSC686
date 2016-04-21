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
var spintheta = [ ];

var flag = false;

// array to hold points
var points = [];
var colors = [];
var normals = [];

var cutoffs = [];

// containers that have number of points in our objects
var ncylin, nsphere, ncube;

var myCylinder, mySphere, myCube;

var ncubes = 5;
var thetaSeed = [];

// Lighting things
var lightPosition = vec4(1.0, 5.0, 0.0, 0.0 );
var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.0, 0.0, 0.5, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 1.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var viewerPos;


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
    mySphere = sphere(5);
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
    
    // Make the normals
    normals = myCylinder.TriangleNormals;
    normals = normals.concat(mySphere.TriangleNormals);
    normals = normals.concat(myCube.TriangleNormals);
    
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
        // get random points to place the cubes at
        var seedx = randomIntFromInterval(-100, 100) / 100;
        var seedy = randomIntFromInterval(-100, 100) / 100;
        var seedz = randomIntFromInterval(-100, 100) / 100;
        
        // get random spin thetas
        thetaSeed.push(randomIntFromInterval(-5, 5));
        spintheta.push([ 0, 0, 0 ]);
        
        // Make a cube and transform
        var newCube = cube();
        newCube.scale(0.2, 0.2, 0.2);
        newCube.translate(seedx, seedy, seedz);
        
        // push everything
        points = points.concat(newCube.TriangleVertices);
        normals = normals.concat(newCube.TriangleNormals);
        colors = colors.concat(newCube.TriangleVertexColors);
        cutoffs.push(newCube.TriangleVertices.length + cutoffs[cutoffs.length-1]);
        console.log(seedx, seedy, seedz);
        //console.log(thetaSeed);
    }
    
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
   
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );   
    
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


    // Set up user interaction
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

    
    viewerPos = vec3(0.0, 0.0, -20.0 );
    
    // set up projection matrix
    projection = ortho(-1, 1, -1, 1, -100, 100);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
      
    gl.useProgram( program );
    // send the projection matrix to the gpu
    // This will stay the same throughout the life of the program
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"),
                        false, flatten(projection)); 
                        
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
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
        //var spintheta = [ 0, 0, 0 ];
        //var thetaSeed = randomIntFromInterval(-10, 10);
        if(flag) spintheta[i][axis] += thetaSeed[i];
        gl.uniform3fv(thetaLoc, spintheta[i]);
        //console.log(spintheta, i);
        modelView1 = mat4();
        // multiply the modelView. mult and rotate are in mv.js
        modelView1 = mult(modelView1, rotate(spintheta[i][xAxis], [1, 0, 0] ));
        modelView1 = mult(modelView1, rotate(spintheta[i][yAxis], [0, 1, 0] ));    
        modelView1 = mult(modelView1, rotate(spintheta[i][zAxis], [0, 0, 1] ));

        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelView"),
                            false, flatten(modelView1));
        
        gl.drawArrays(gl.TRIANGLES, cutoffs[i -1], cutoffs[i] - cutoffs[i -1]);
    }
    
    requestAnimFrame( render );
}