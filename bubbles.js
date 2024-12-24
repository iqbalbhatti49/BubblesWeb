// Vector constructor to define a 3D vector (x, y, z)
function Vector(x, y, z) {
    this.x = x; // X coordinate
    this.y = y; // Y coordinate
    this.z = z; // Z coordinate

    // Method to update the x and y coordinates
    this.set = function(x, y) {
        this.x = x;
        this.y = y;
    };
}

// Collection of points on the canvas, updates and shakes based on mouse position
function PointCollection() {
    this.mousePos = new Vector(0, 0); // Mouse position initialized at (0, 0)
    this.pointCollectionX = 0; // Horizontal offset for shaking effect
    this.pointCollectionY = 0; // Vertical offset for shaking effect
    this.points = []; // Array to store the points

    // Method to update points based on mouse movement
    this.update = function() {
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];

            var dx = this.mousePos.x - point.curPos.x; // Horizontal distance from point to mouse
            var dy = this.mousePos.y - point.curPos.y; // Vertical distance from point to mouse
            var dd = (dx * dx) + (dy * dy); // Square of the distance
            var d = Math.sqrt(dd); // Actual distance

            // Adjust the point's target position based on distance to mouse
            point.targetPos.x = d < mouseResponseThreshold ? point.curPos.x - dx : point.originalPos.x;
            point.targetPos.y = d < mouseResponseThreshold ? point.curPos.y - dy : point.originalPos.y;

            // Update the point's position
            point.update();
        }
    };

    // Method to create a shaking effect based on mouse movement
    this.shake = function() {
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            var dx = this.mousePos.x - point.curPos.x;
            var dy = this.mousePos.y - point.curPos.y;
            var dd = (dx * dx) + (dy * dy);
            var d = Math.sqrt(dd);
            if (d < 50) {
                // Random shake values when close to the mouse
                this.pointCollectionX = Math.floor(Math.random() * 5) - 2;
                this.pointCollectionY = Math.floor(Math.random() * 5) - 2;
            }
            point.draw(bubbleShape, this.pointCollectionX, this.pointCollectionY);
        }
    };

    // Method to draw the points on the canvas
    this.draw = function(bubbleShape, reset) {
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];

            if (point === null) {
                continue; // Skip null points
            }
            if (window.reset) {
                // Reset properties when needed
                this.pointCollectionX = 0;
                this.pointCollectionY = 0;
                this.mousePos = new Vector(0, 0);
            }

            // Draw the point with the specified shape and offsets
            point.draw(bubbleShape, this.pointCollectionX, this.pointCollectionY, reset);
        }
    };

    // Empty reset method for future use
    this.reset = function(bubbleShape) {};
}

// Point constructor with position, size, color, and physics properties
function Point(x, y, z, size, color) {
    this.curPos = new Vector(x, y, z); // Current position of the point
    this.color = color; // Color of the point

    this.friction = friction; // Friction value for movement
    this.rotationForce = rotationForce; // Rotation force for physics effect
    this.springStrength = 0.05; // Spring effect strength

    this.originalPos = new Vector(x, y, z); // Original position of the point
    this.radius = size; // Radius/size of the point
    this.size = size; // Actual size of the point
    this.targetPos = new Vector(x, y, z); // Target position for the point to move towards
    this.velocity = new Vector(0.0, 0.0, 0.0); // Velocity of the point

    // Update method to apply physics and movement to the point
    this.update = function() {
        var dx = this.targetPos.x - this.curPos.x; // Horizontal distance to target
        var dy = this.targetPos.y - this.curPos.y; // Vertical distance to target
        var ax = dx * this.springStrength - this.rotationForce * dy; // Force in X direction
        var ay = dy * this.springStrength + this.rotationForce * dx; // Force in Y direction

        this.velocity.x += ax; // Update velocity in X direction
        this.velocity.x *= this.friction; // Apply friction
        this.curPos.x += this.velocity.x; // Update position in X direction

        this.velocity.y += ay; // Update velocity in Y direction
        this.velocity.y *= this.friction; // Apply friction
        this.curPos.y += this.velocity.y; // Update position in Y direction

        var dox = this.originalPos.x - this.curPos.x; // Difference in original and current X position
        var doy = this.originalPos.y - this.curPos.y; // Difference in original and current Y position
        var dd = (dox * dox) + (doy * doy); // Squared distance to original position
        var d = Math.sqrt(dd); // Actual distance

        this.targetPos.z = d / 100 + 1; // Calculate new Z position based on distance
        var dz = this.targetPos.z - this.curPos.z; // Difference in Z position
        var az = dz * this.springStrength; // Force in Z direction
        this.velocity.z += az; // Update velocity in Z direction
        this.velocity.z *= this.friction; // Apply friction
        this.curPos.z += this.velocity.z; // Update position in Z direction

        this.radius = this.size * this.curPos.z; // Adjust the radius based on Z position
        if (this.radius < 1) this.radius = 1; // Ensure minimum radius is 1
    };

    // Draw method to render the point on canvas
    this.draw = function(bubbleShape, dx, dy) {
        ctx.fillStyle = this.color; // Set the fill color
        if (bubbleShape == 'square') {
            // Draw square shape
            ctx.beginPath();
            ctx.fillRect(this.curPos.x + dx, this.curPos.y + dy, this.radius * 1.5, this.radius * 1.5);
        } else {
            // Draw circle shape
            ctx.beginPath();
            ctx.arc(this.curPos.x + dx, this.curPos.y + dy, this.radius, 0, Math.PI * 2, true);
            ctx.fill();
        }
    };
}

// Function to convert HSL values to a color string
function makeColor(hslList, fade) {
    var hue = hslList[0]; // Hue value
    var sat = hslList[1]; // Saturation value
    var lgt = hslList[2]; // Lightness value
    return 'hsl(' + hue + ',' + sat + '%,' + lgt + '%)'; // Return HSL color string
}

// Function to convert a phrase to hexadecimal string
function phraseToHex(phrase) {
    var hexphrase = '';
    for (var i = 0; i < phrase.length; i++) {
        hexphrase += phrase.charCodeAt(i).toString(16); // Convert each character to hex
    }
    return hexphrase; // Return the hex phrase
}

// Initialize event listeners for canvas resizing and mouse movement
function initEventListeners() {
    $(window).bind('resize', updateCanvasDimensions).bind('mousemove', onMove); // Resize and mouse move events

    canvas.ontouchmove = function(e) {
        e.preventDefault();
        onTouchMove(e);
    };

    canvas.ontouchstart = function(e) {
        e.preventDefault();
    };
}

// Update canvas dimensions on window resize
function updateCanvasDimensions() {
    canvas.attr({
        height: window.innerHeight - 100, // Set canvas height
        width: window.innerWidth // Set canvas width
    });
    canvasWidth = canvas.width();
    canvasHeight = canvas.height();
    draw(); // Redraw canvas after resizing
}

// Mouse move event handler to update mouse position
function onMove(e) {
    if (pointCollection) {
        pointCollection.mousePos.set(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
    }
}

// Touch move event handler to update mouse position for touch devices
function onTouchMove(e) {
    if (pointCollection) {
        pointCollection.mousePos.set(e.targetTouches[0].pageX - canvas.offset().left, e.targetTouches[0].pageY - canvas.offset().top);
    }
}

// Function to continuously shake the canvas
function bounceName() {
    shake();
    setTimeout(bounceName, 30);
}

// Function to continuously update and draw points on canvas
function bounceBubbles() {
    draw();
    update();
    setTimeout(bounceBubbles, 30);
}

// Function to draw the name or phrase on canvas
function drawName(name, letterColors) {
    updateCanvasDimensions(); // Update canvas dimensions
    var g = [];
    var offset = 0;

    function addLetter(ccHex, colorIdx, letterCols) {
        if (typeof letterCols !== 'undefined') {
            if (Object.prototype.toString.call(letterCols) === '[object Array]' && Object.prototype.toString.call(letterCols[0]) === '[object Array]') {
                letterColors = letterCols;
            }
            if (Object.prototype.toString.call(letterCols) === '[object Array]' && typeof letterCols[0] === 'number') {
                letterColors = [letterCols];
            }
        } else {
            letterColors = [[0, 0, 27]]; // Default color if not provided
        }

        if (document.alphabet.hasOwnProperty(ccHex)) {
            var charData = document.alphabet[ccHex].P;
            var newColor = letterColors[colorIdx];
            var color = makeColor(newColor, fade); // Create color based on HSL values

            // Process each point for letter drawing
            for (var i = 0; i < charData.length; i++) {
                var xy = charData[i];
                var newX = xy[0] + offset;
                var newY = xy[1] + offset;

                var newPoint = new Point(newX, newY, newX, 2, color); // Create new point with calculated position and color
                if (pointCollection) {
                    pointCollection.points.push(newPoint); // Add point to collection
                }
            }
        }
    }

    return addLetter; // Return the addLetter function
}

// Start animation loop after page load
bounceName(); // Start shaking
bounceBubbles(); // Start point bouncing
