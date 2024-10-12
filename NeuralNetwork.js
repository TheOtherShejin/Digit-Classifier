class Layer {
    constructor(numOfNodes, numOfIncomingNodes) {
        this.numOfNodes = numOfNodes;
        this.numOfIncomingNodes = numOfIncomingNodes;

        this.weights = Array.from(Array(numOfNodes), () => Array(numOfIncomingNodes).fill(0));
        this.biases = Array(numOfNodes).fill(0);
    }

    FeedForward(input) {
        let output = Array(this.numOfNodes).fill(0);
        for (let i = 0; i < this.numOfNodes; i++) {
            output[i] = this.biases[i];
            for (let j = 0; j < this.numOfIncomingNodes; j++) {
                output[i] += this.weights[i][j] * input[j];
            }
            output[i] = Sigmoid(output[i]);
        }
        return output;
    }

    SetWeights(weights) {
        this.weights = weights;
    }

    SetBiases(biases) {
        this.biases = biases;
    }
}

class NeuralNetwork {
    constructor(layersSize) {
        this.layers = Array(layersSize.length - 1);
        for (let i = 0; i < layersSize.length-1; i++) {
            this.layers[i] = new Layer(layersSize[i+1], layersSize[i]);
        }
    }

    Evaluate(input) {
        let output = input;
        for (let i = 0; i < this.layers.length; i++) {
            output = this.layers[i].FeedForward(output);
        }
        return output;
    }

    SetAllWeights(weights) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].SetWeights(weights[i]);
        }
    }

    SetAllBiases(biases) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].SetBiases(biases[i]);
        }
    }
}

function Sigmoid(input) {
    return 1 / (1 + Math.exp(-input));
}

function MatrixToVector(mat) {
    let vector = Array(mat.length * mat[0].length);
    for (let i = 0; i < mat.length; i++) {
        for (let j = 0; j < mat[0].length; j++) {
            vector[i * mat.length + j] = mat[i][j];
        }
    }
    return vector;
}

function SoftMax(vector) {
    let output = Array(vector.length).fill(0);
    let sum = 0;
    for (let i = 0; i < vector.length; i++) {
        output[i] = Math.exp(vector[i]);
        sum += output[i];
    }
    output.forEach((num, idx, arr) => { arr[idx] /= sum });
    return output;
}

function MaxVectorIndex(vector) {
    let maxElement = vector[0];
    let maxIndex = 0;
    for (let i = 0; i < vector.length; i++) {
        if (vector[i] > maxElement) {
            maxElement = vector[i];
            maxIndex = i;
        }
    }
    return maxIndex;
}

function Predict(input) {
    return MaxVectorIndex(PredictConfidence(input));
}

function PredictConfidence(input) {
    return SoftMax(nn.Evaluate(MatrixToVector(input)))
}