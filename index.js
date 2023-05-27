// Define color variables:
red = [0, 100, 63];
orange = [40, 100, 60];
green = [75, 100, 40];
blue = [196, 77, 55];
purple = [280, 50, 60];
letterColors = [red, orange, green, blue, purple];

// This variable controls the smallest distance at which a mouse will make the dots react
mouseResponseThreshold = 100;

// This variable controls how strongly the dots will try to return to their starting position
friction = 0.50;

// This variable controls how much the dots will rotate when interacting
rotationForce = 0.01;

let name = prompt("Enter your name: ");
message = "Hi "+name+"!";

drawName(message, letterColors);
bounceBubbles();
