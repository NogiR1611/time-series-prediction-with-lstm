import * as tf from '@tensorflow/tfjs';
import {divideTensorToChunks} from './helpers.js';
import store from './store.js';
import { input } from '@tensorflow/tfjs';

export const vanillaModel = () => {
    const model = tf.sequential();

    tf.ENV.set('WEBGL_PACK',false);

    const {dataset, tensorActualData, trainInputsData, trainLabelsData, parameter} = store.getState();

    const {hiddenLayersUnit, hiddenLayers, memoryCells} = parameter;
    
    const tensorToChunks = divideTensorToChunks(trainInputsData, trainLabelsData);
        
    let x = tf.tensor2d(trainLabelsData, [trainLabelsData.length, 1]);
    let y = tf.tensor2d(trainInputsData, [trainInputsData.length, 1]);

    let inputSteps = trainInputsData.length / tensorToChunks.inputs;
    let labelSteps = trainLabelsData.length / tensorToChunks.labels;

    console.log(tensorActualData);
    const input_layer_shape = [inputSteps, 1];

    const rnn_output_unit = Number(hiddenLayersUnit);
    const rnn_input_shape = 128;

    const output_layer_unit = 1;

    model.add(tf.layers.dense({ inputShape: input_layer_shape, units: 128 }));
    //model.add(tf.layers.reshape({ targetShape: rnn_input_shape }));

    let lstm_cells = [];
        
    for(let i=0; i < hiddenLayers; i++){
        lstm_cells.push(tf.layers.lstmCell({ units : memoryCells }));
    }   
        
    model.add(tf.layers.rnn({
        cell: lstm_cells,
        activation: 'relu',
        inputShape: rnn_input_shape,
        returnSequences: true
    }));
    
    model.add(tf.layers.dense({ units: output_layer_unit, returnSequences: true }));

    return model;
}

export const BiLSTMModel = () => {
    const model = tf.sequential();

    const {dataset, tensorData, trainInputsData, trainLabelsData, parameter} = store.getState();

    const {hiddenLayersUnit, hiddenLayers} = parameter;
    
    const tensorToChunks = divideTensorToChunks(trainInputsData, trainLabelsData);
        
    let x = tf.tensor2d(trainLabelsData, [trainLabelsData.length, 1]);
    let y = tf.tensor2d(trainInputsData, [trainInputsData.length, 1]);

    let inputSteps = trainInputsData.length / tensorToChunks.inputs;
    let labelSteps = trainLabelsData.length / tensorToChunks.labels;

    const input_layer_shape = [inputSteps, 1];

    const rnn_output_unit = Number(hiddenLayersUnit);
    const rnn_input_shape = 128;

    const output_layer_unit = 1;
    
    const BiLstmLayers = tf.layers.bidirectional({
        layers : tf.layers.lstm({ units: rnn_output_unit, activation: 'relu' }),
        inputShape: input_layer_shape
    });

    model.add(BiLstmLayers);

    console.log(BiLstmLayers.getConfig());
    
    model.add(tf.layers.dense({ units: 1 }));

    return model;
}