    var canvas;
    var gl;

    var theta = 0.0;
    var thetaLoc;

    var program;
    var program1;

    window.onload = function init(){
        canvas = document.getElementById( "gl-canvas" );

        gl = WebGLUtils.setupWebGL( canvas );
        if ( !gl ) { alert( "WebGL isn't available" ); }

        //  Configure WebGL
        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

        //  Load shaders and initialize attribute buffers
        program = initShaders( gl, "vertex-shader", "fragment-shader" );
        program1 = initShaders( gl, "vertex-shader", "fragment-shader" );

        //Rotating Rectangle
        var rr_vertices = [
            vec2( 0,  0.25),
            vec2( 0.25,  0),
            vec2(-0.25,  0 ),
            vec2( 0, -0.25)
        ];
        // Load the data into the GPU
        rr_bufferId = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, rr_bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(rr_vertices), gl.STATIC_DRAW );
        // Associate out shader variables with our data buffer
        rr_vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( rr_vPosition, 2, gl.FLOAT, false, 0, 0 );

        //Static Rectangle
        var sr_vertices = [
            vec2( 0.5,  0.5),
            vec2( 1.0,  0.5),
            vec2( 0.5,  1.0 ),
            vec2( 1.0,  1.0)
        ];
        // Load the data into the GPU
        sr_bufferId = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, sr_bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(sr_vertices), gl.STATIC_DRAW );
        // Associate out shader variables with our data buffer
        sr_vPosition = gl.getAttribLocation( program, "vPosition" );



        render();
    };

    var rr_vPosition;
    var sr_vPosition;
    var rr_bufferId;
    var sr_bufferId;

    function render() {

        gl.clear( gl.COLOR_BUFFER_BIT );

        gl.useProgram( program1 );
        gl.enableVertexAttribArray( sr_vPosition );
        gl.bindBuffer( gl.ARRAY_BUFFER, sr_bufferId );
        gl.vertexAttribPointer( sr_vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        gl.useProgram( program );
        thetaLoc = gl.getUniformLocation( program, "theta" );

        gl.enableVertexAttribArray( rr_vPosition );
        gl.bindBuffer( gl.ARRAY_BUFFER, rr_bufferId );
        gl.vertexAttribPointer( rr_vPosition, 2, gl.FLOAT, false, 0, 0 );
        theta += 0.1;
        gl.uniform1f( thetaLoc, theta );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        window.requestAnimFrame(render);
    }