import * as tf from '@tensorflow/tfjs';
import store from './store.js';

export const vanillaModel = () => {
    const model = tf.sequential();

    console.log('model used : vanila model');

    tf.ENV.set('WEBGL_PACK',false);

    const { parameter } = store.getState();

    const { memoryCells } = parameter;
    
    //input layer
    model.add(tf.layers.dense({ inputShape: [null, 1], units: 1 }));
    
    //hidden layer
    model.add(tf.layers.lstm({
        units: memoryCells, 
        inputShape: [null, 1],
        returnSequences: true
    }));

    //output layer
    model.add(tf.layers.dense({ units: 1, returnSequences: true }));

    return model;
}

export const stackedModel = () => {
    const model = tf.sequential();

    tf.ENV.set('WEBGL_PACK',false);

    const {parameter} = store.getState();

    const {memoryCells} = parameter;

    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    model.add(tf.layers.lstm({
        units: memoryCells, 
        inputShape: [null, 1],
        returnSequences: true
    }));

    model.add(tf.layers.lstm({
        units: memoryCells, 
        returnSequences: true
    }));

    model.add(tf.layers.dense({ units: 1, returnSequences: true }));

    return model;
};

export const BiLSTMModel = () => {
    const model = tf.sequential();

    tf.ENV.set('WEBGL_PACK',false);

    const {parameter} = store.getState();

    const {memoryCells} = parameter;

    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    const BiLstmLayers = tf.layers.bidirectional({
        layer : tf.layers.lstm({ units: memoryCells, returnSequences: true }),
        inputShape: [null, 1],
    });
    
    model.add(BiLstmLayers);
    
    model.add(tf.layers.dense({ units: 1 }));

    return model;
}