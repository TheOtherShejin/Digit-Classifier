var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var graph = document.getElementById("graph");
var gctx = graph.getContext('2d');

var pixelWidth = canvas.clientWidth / 28;
var pixelHeight = canvas.clientHeight / 28;
var canvasX = canvas.getBoundingClientRect().x;
var canvasY = canvas.getBoundingClientRect().y;
var graphHeight = graph.clientHeight;
var graphWidth = graph.clientWidth;

var pixels = Array.from(Array(28), () => Array(28).fill(0));

var nn = new NeuralNetwork(model["config"]);
nn.SetAllWeights(model["weights"]);
nn.SetAllBiases(model["biases"]);

function DrawPixel(x, y, brightness) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
    ctx.stroke();
}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}
function ClearPixelData() {
    pixels = Array.from(Array(28), () => Array(28).fill(0));
}
function Clear() {
    ClearCanvas();
    ClearPixelData();
}

function DrawBlurredCanvas() {
    ClearCanvas();
    let blurredPixels = BlurCanvas();
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            DrawPixel(i, j, blurredPixels[j][i]);
        }
    }
}

function BlurCanvas() {
    let blurredPixels = Array.from(Array(28), () => Array(28).fill(0));
    const scalar = 1/2;
    const kernel = [
        [1/4, 1/2, 1/4],
        [1/2,   1, 1/2],
        [1/4, 1/2, 1/4]
    ];

    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            for (let k = -1; k < 2; k++) {
                if (i + k < 0 || i + k >= 28) continue;
                for (let l = -1; l < 2; l++) {
                    if (j + l < 0 || j + l >= 28) continue;
                    blurredPixels[i][j] += kernel[k+1][l+1] * pixels[i + k][j + l];
                }
            }
            blurredPixels[i][j] *= scalar;
        }
    }
    return blurredPixels;
}

function DrawGraph(input) {
    let prediction = MaxVectorIndex(input);
    gctx.clearRect(0, 0, graph.clientWidth, graph.clientHeight);
    gctx.beginPath();
    gctx.font = "24px Arial";
    for (let i = 0; i < input.length; i++) {
        gctx.fillStyle = "rgb(53, 83, 253)";
        gctx.fillRect(0, i*(graphHeight / 10), input[i]*graphWidth, graphHeight / 10); 
        if (i == prediction) gctx.fillStyle = "white";
        else gctx.fillStyle = "rgb(150, 150, 150)";
        gctx.fillText(i, 10, (i+1)*(graphHeight/10)-12);
        gctx.fillText(`${Math.round(input[i] * 10000) / 100}%`, graphWidth - 90, (i+1)*(graphHeight/10)-12);
    }
    gctx.stroke();
}

window.onmousemove = function(e) {
    if (e.buttons & 1) {
        let x = Math.floor((e.clientX - canvasX) / pixelWidth);
        let y = Math.floor((e.clientY - canvasY) / pixelHeight);
        if (x >= 0 && y >= 0) {
            pixels[y][x] = 255;
            DrawBlurredCanvas();
            DrawGraph(PredictConfidence(BlurCanvas()));
        }
    }
}

window.onload = DrawGraph(PredictConfidence(BlurCanvas()));

window.onkeydown = function(e) {
    if (e.key == 'r') {
        Clear();
        DrawGraph(PredictConfidence(BlurCanvas()));
    }
}
window.onresize = function(e) {
    canvasX = canvas.getBoundingClientRect().x;
    canvasY = canvas.getBoundingClientRect().y;
}

function IsTouchEnabled() {
    return ( 'ontouchstart' in window ) || 
           ( navigator.maxTouchPoints > 0 ) ||
           ( navigator.msMaxTouchPoints > 0 );
}
if (IsTouchEnabled()) {
    document.addEventListener("touchmove", (e) => {
        let x = Math.floor((e.touches[0].clientX - canvasX) / pixelWidth);
        let y = Math.floor((e.touches[0].clientY - canvasY) / pixelHeight);
        if (x >= 0 && y >= 0) {
            pixels[y][x] = 255;
            DrawBlurredCanvas();
        }
    });
}