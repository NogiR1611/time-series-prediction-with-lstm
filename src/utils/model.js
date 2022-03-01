import * as tf from '@tensorflow/tfjs';
import store from './store.js';

export const vanillaModel = () => {
    const model = tf.sequential();

    console.log('model used : vanilla model');

    tf.ENV.set('WEBGL_PACK',false);

    const { parameter } = store.getState();

    const { memory_cells } = parameter;
    
    //input layer
    model.add(tf.layers.dense({ inputShape: [null, 1], units: 512 }));
    
    //hidden layer
    model.add(tf.layers.lstm({
        units: memory_cells, 
        inputShape: [null, 1],
        returnSequences: true,
    }));

    //output layer
    model.add(tf.layers.dense({ units: 1, returnSequences: true }));

    return model;
}

export const stackedModel = () => {
    const model = tf.sequential();

    tf.ENV.set('WEBGL_PACK',false);

    console.log('model used : stack model');

    const {parameter} = store.getState();

    const {memory_cells} = parameter;

    //input layer
    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    //hidden layer
    model.add(tf.layers.lstm({
        units: memory_cells, 
        inputShape: [null, 1],
        returnSequences: true,
    }));

    //output layer
    model.add(tf.layers.lstm({
        units: memory_cells, 
        returnSequences: true,
    }));

    model.add(tf.layers.dense({ units: 1, returnSequences: true }));

    return model;
};

export const BiLSTMModel = () => {
    const model = tf.sequential();

    tf.ENV.set('WEBGL_PACK',false);

    console.log('model used : bilstm model');

    const { parameter } = store.getState();

    const { memory_cells } = parameter;

    //input layer
    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    //hidden layer
    const BiLstmLayers = tf.layers.bidirectional({
        layer : tf.layers.lstm({ 
            units: memory_cells, 
            returnSequences: true,
        }),
        inputShape: [null, 1],
    });
    
    //output layer
    model.add(BiLstmLayers);
    
    model.add(tf.layers.dense({ units: 1 }));

    return model;
}