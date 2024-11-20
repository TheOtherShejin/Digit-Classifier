const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const graph = document.getElementById("graph");
const gctx = graph.getContext('2d');
const body = document.getElementById("body");

let pixelWidth = canvas.width / 28;
let canvasX = canvas.getBoundingClientRect().x;
let canvasWidth = canvas.getBoundingClientRect().width;

let pixels = Array.from(Array(28), () => Array(28).fill(0));

const nn = new NeuralNetwork(model.config, "Sigmoid", "SoftMax");
nn.SetAllWeights(model.weights);
nn.SetAllBiases(model.biases);

function DrawPixel(x, y, brightness) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.fillRect(x * pixelWidth, y * pixelWidth, pixelWidth, pixelWidth);
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
    DrawGraph(PredictConfidence(pixels));
}

function DrawBlurredCanvas() {
    ClearCanvas();
    const blurredPixels = BlurCanvas();
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            DrawPixel(i, j, blurredPixels[j][i]);
        }
    }
}

function BlurCanvas() {
    const blurredPixels = Array.from(Array(28), () => Array(28).fill(0));
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
    const prediction = MaxVectorIndex(input);
    gctx.clearRect(0, 0, graph.clientWidth, graph.clientHeight);
    gctx.beginPath();
    const fontSize = 24 * graph.clientHeight / 504;
    gctx.font = `${fontSize}px Arial`;
    for (let i = 0; i < input.length; i++) {
        gctx.fillStyle = "rgb(53, 83, 253)";
        gctx.fillRect(0, i*(graph.height / 10), input[i]*graph.width, graph.height / 10);
        if (i === prediction) gctx.fillStyle = "white";
        else gctx.fillStyle = "rgb(150, 150, 150)";
        
        gctx.textAlign = "left";
        gctx.fillText(i, 10, (i+1)*(graph.height/10)-fontSize*0.5);
        gctx.textAlign = "right";
        gctx.fillText(`${Math.round(input[i] * 10000) / 100}%`, graph.width - 10, (i+1)*(graph.height/10)-fontSize*0.5);
    }
    gctx.stroke();
}

function Update(x, y) {
    if (x < 0 || y < 0 || x >= 28 || y >= 28) return;
    pixels[y][x] = 255;
    DrawBlurredCanvas();
    DrawGraph(PredictConfidence(BlurCanvas()));
}

window.onmousemove = (e) => {
    if (e.buttons & 1) {
        const x = Math.floor((e.clientX - canvasX) / pixelWidth);
        const y = Math.floor((e.clientY - canvas.getBoundingClientRect().y) / pixelWidth);
        Update(x, y); 
    }
}
window.onload = () => {
    if (IsPortrait()) alert("Portrait mode detected. This website is best viewed in landscape mode.");
    Resize();
}
window.onkeydown = (e) => {
    if (e.key === 'r') {
        Clear();
        DrawGraph(PredictConfidence(BlurCanvas()));
    }
}
window.onresize = (e) => {
    Resize();
}

function Resize() {
    canvasX = canvas.getBoundingClientRect().x;

    if (IsPortrait()) {
        graph.width = graph.clientWidth;
        graph.height = graph.clientHeight;
    }
    else {
        graph.width = 252;
        graph.height = 504;
    }

    canvasWidth = canvas.clientWidth;
    canvas.width = canvasWidth;
    canvas.height = canvasWidth;
    pixelWidth = Math.round(canvasWidth / 28);

    DrawGraph(PredictConfidence(BlurCanvas()));
}

function IsTouchEnabled() {
    return ( 'ontouchstart' in window ) || 
           ( navigator.maxTouchPoints > 0 ) ||
           ( navigator.msMaxTouchPoints > 0 );
}

if (IsTouchEnabled()) {
    document.addEventListener("touchmove", (e) => {
        const x = Math.floor((e.touches[0].clientX - canvasX) / pixelWidth);
        const y = Math.floor((e.touches[0].clientY - canvas.getBoundingClientRect().y) / pixelWidth);
        if (x >= 0 && x < 28 && y >= 0 && y < 28) {
            Update(x, y);
        }
    });

    document.addEventListener("touchstart", (e) => {
        const x = Math.floor((e.touches[0].clientX - canvasX) / pixelWidth);
        const y = Math.floor((e.touches[0].clientY - canvas.getBoundingClientRect().y) / pixelWidth);
        if (x >= 0 && x < 28 && y >= 0 && y < 28) {
            body.style.overflowY = "clip";
        }
    })

    document.addEventListener("touchend", (e) => {
        body.style.overflowY = "scroll";
    })
}
function IsPortrait() {
    return document.body.clientWidth < 800;
}