// Canvas things
var canvas;
var gl;

// arrays that will be exported to the shader.
var modelView, projection;
var mvMatrix, pMatrix;
var eye= vec3(0.0, 0.0, 4.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var fovy = 45.0;
var aspect;
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

// Flaf for rotating or not
var flag = false;

// array to hold points
var points = [];
var colors = [];
var normals = [];
var cutoffs = []; // Array that holds indicies
var period = [];

var nspheres = 8; // includes sun
var thetaSeed = [];

// Lighting things
var lightPosition = vec4( 0.0, 0.0, 0.0, 0.0 );
var lightAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// Planet Material
var materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 50.;

var texture;

var ambientColor, diffuseColor, specularColor;

var dragscale = 0.1;

var gold;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    aspect =  canvas.width/canvas.height;

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    
    // Make the first sphere (the sun) at origin;
    var mySphere = sphere(5);
    mySphere.scale(.8, .8, .8);
    
    points = mySphere.TriangleVertices;    
    normals = mySphere.TriangleNormals;
    //colors = mySphere.TriangleVertexColors;
    for (var i=0; i<mySphere.TriangleVertexColors.length; i++){
        colors.push([1.0, 1.0, 1.0, 1.0]);
    }
    //console.log(mySphere.TriangleVertexColors);
    //console.log(mySphere.TriangleVertexColors[0]);
    cutoffs.push(0);
    cutoffs.push(mySphere.TriangleVertices.length + cutoffs[cutoffs.length-1]);
    period.push(0);
    spintheta.push([ 0, 0, 0 ]);
    thetaSeed.push(0);
    
    
    for (var i=0; i<nspheres; i++){
        // get random points to place the cubes at
        var seedx = randomIntFromInterval(-100, 100) / 200;
        var seedy = randomIntFromInterval(-100, 100) / 200;
        var seed_size = randomIntFromInterval(50, 100) / 200;
        
        // get random spin thetas
        //thetaSeed.push(randomIntFromInterval(-5, 5));
        spintheta.push([ 0, 0, 0 ]);
        
        // Make a cube and transform
        var newSpere = sphere(5);
        newSpere.scale(seed_size, seed_size, seed_size);
        newSpere.translate(seedx, seedy, 0);
        var radius = getRad(seedx, seedy);
        var per = Math.pow(radius, 3/2);
        var speed = (2 * Math.PI * radius) /per;
        speed = 360/per;
        thetaSeed.push(speed/1000);
        
        // push everything
        points = points.concat(newSpere.TriangleVertices);
        normals = normals.concat(newSpere.TriangleNormals);
        colors = colors.concat(newSpere.TriangleVertexColors);
        cutoffs.push(newSpere.TriangleVertices.length + cutoffs[cutoffs.length-1]);
        period.push(per);
        console.log(i, seedx, seedy, seed_size, radius, per, speed,newSpere.TriangleVertexColors.length);
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
    
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    
    canvas.addEventListener("mousedown",mousemove, false);
    canvas.addEventListener("mouseup", stopmove, false);
    canvas.addEventListener("mousewheel", mousewheel, false);
    
    // set up projection matrix
    //projection = ortho(-2, 2, -2, 2, -100, 100);
    projection = perspective(fovy, aspect, 1.0, 10000.0);
    
    gold = goldMaterial();

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
      
    gl.useProgram( program );
    // send the projection matrix to the gpu
    // This will stay the same throughout the life of the program


    // draw things
    //console.log(spintheta, cutoffs, spintheta.length, cutoffs.length, thetaSeed);
    render();
}


/**
 * Make a random integer. If itis between -15 and 15 try again recursively.
 */
function randomIntFromInterval(min, max){
    var retint = Math.floor(Math.random()*(max-min+1)+min);
    if ((retint > -15) && (retint < 15)){
        return randomIntFromInterval(min, max);
    } else {
        return retint;
    }
    //return Math.random()*(max-min+1)+min;
}

function getRad(x, y){
    var rad = Math.sqrt(x*x + y*y);
    return rad;
}

function render(){
    projection = perspective(fovy, aspect, 1.0, 10000.0);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"),
                        false, flatten(projection)); 
    // Do everything in a for loop
    for(var i=0; i < nspheres + 1; i++){
        // Make the sun golden...
        if (i == 0){
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(gold.materialAmbient));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(gold.materialDiffuse) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
                flatten(gold.materialSpecular) );
            gl.uniform4fv(gl.getUniformLocation(program, "materialEmissiveColor"), 
                flatten(vec4(0.1, 0.1, 0.1, 1.0)) );
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
                flatten(lightPosition) );
            gl.uniform1f( gl.getUniformLocation(program, "shininess"),
                gold.materialShininess );
        } else{
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
                flatten(specularProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "materialEmissiveColor"), 
                flatten(vec4(1.0, 1.0, 1.0, 1.0)) );
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
                flatten(lightPosition) );
            gl.uniform1f( gl.getUniformLocation(program, "shininess"),
            materialShininess );
        }
            
        // Only allow things to rotate along z axis
        //var spintheta = [ 0, 0, 0 ];
        //var thetaSeed = randomIntFromInterval(-10, 10);
        if(flag) spintheta[i][zAxis] += thetaSeed[i];
        gl.uniform3fv(thetaLoc, spintheta[i], thetaSeed[i]);
        //console.log("render",spintheta, i, cutoffs[i],cutoffs[i+1] - cutoffs[i], thetaSeed[i]);
        modelView1 = mat4();
        
        mvMatrix = lookAt(eye, at , up);

        // multiply the modelView. mult and rotate are in mv.js
        // This would be a lot faster on the GPU but for learning it helps here
        //modelView1 = mult(modelView1, rotate(spintheta[i][xAxis], [1, 0, 0] ));
        //modelView1 = mult(modelView1, rotate(spintheta[i][yAxis], [0, 1, 0] ));    
        modelView1 = mult(modelView1, rotate(spintheta[i][zAxis], [0, 0, 1] ));

        modelView1 = mult(modelView1, mvMatrix);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelView"),
                            false, flatten(modelView1));
        
        gl.drawArrays(gl.TRIANGLES, cutoffs[i], cutoffs[i+1] - cutoffs[i]);
        
    }
    
    requestAnimFrame( render );
}


/**
 * Mouse interaction.
 */
function mousemove(event){
    xpos = event.pageX;     // Get the horizontal coordinate
    ypos = event.pageY;     // Get the vertical coordinate
    
    var xdiff, ydiff, xposdown, yposdown;
    
    //var curx = at[0];
    //var cury = at[1];
    var curx = lightPosition[0];
    var cury = lightPosition[1];    
    
    document.onmousemove = function(event){//console.log("hi");//mousemove();
        xposdown = event.pageX;     // Get the horizontal coordinate
        yposdown = event.pageY;     // Get the vertical coordinate
       
        xdiff = (xpos - xposdown) * dragscale;
        ydiff = (yposdown - ypos) * dragscale;
        
        var newx = curx - xdiff;
        var newy = cury - ydiff;
        if (newx < - 10) newx = -10;
        if (newx > 10) newx = 10;
        if (newy < - 10) newy = -10;
        if (newy> 10) newy = 10;        
//        var coor = "Down: X coords: " + xposdown + ", Y coords: " + yposdown;
        //console.log(at[0], xpos, xposdown, xdiff);
        //at[0] = curx - xdiff;
        //at[1] = cury - ydiff;
        lightPosition[0] = newx;
        lightPosition[1] = newy;
    }
    console.log("X coords: " + xpos + ", Y coords: " + ypos + "Down: " + xposdown);
    console.log(lightPosition);

}

function stopmove(event){
    document.onmousemove = function(){
        //Nothing!!
    }
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
        //fovy -= 5.0;
        if (lightPosition[2] > -10) lightPosition[2] -= .5;
    } else{
        //fovy += 5.0;
        if (lightPosition[2] < 10) lightPosition[2] += .5;
    }
    //console.log("Mousewheel "+fovy,zoomy);
    
}