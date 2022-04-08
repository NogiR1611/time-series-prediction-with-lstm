import * as tf from '@tensorflow/tfjs';
import store from './store.js';

export const vanillaModel = () => {
    const model = tf.sequential();

    console.log('model used : vanilla model');

    tf.ENV.set('WEBGL_PACK',false);

    //ekstrasi parameter dari tempat penyimpanan redux
    const { parameter } = store.getState();

    //ekstrasi memory cells dari parameter
    const { memoryCells } = parameter;
    
    //input layer
    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    //hidden layer
    model.add(tf.layers.lstm({
        units: memoryCells, 
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

    //ekstrasi parameter dari tempat penyimpanan redux
    const { parameter } = store.getState();

    //ekstrasi memory cells dari parameter
    const { memoryCells } = parameter;

    //input layer
    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    //hidden layer ke 1
    model.add(tf.layers.lstm({
        units: memoryCells, 
        inputShape: [null, 1],
        returnSequences: true,
    }));

    //hidden layer ke 2
    model.add(tf.layers.lstm({
        units: memoryCells, 
        returnSequences: true,
    }));

    //output layer
    model.add(tf.layers.dense({ units: 1, returnSequences: true }));

    return model;
};

export const BiLSTMModel = () => {
    const model = tf.sequential();

    tf.ENV.set('WEBGL_PACK',false);

    console.log('model used : bilstm model');

    //ekstrasi parameter dari tempat penyimpanan redux
    const { parameter } = store.getState();

    //ekstrasi memory cells dari parameter
    const { memoryCells } = parameter;

    //input layer
    model.add(tf.layers.dense({ units: 512, inputShape: [null, 1] }));
    
    //hidden layer
    const BiLstmLayers = tf.layers.bidirectional({
        layer : tf.layers.lstm({ 
            units: memoryCells, 
            returnSequences: true,
            unitForgetBias: true
        }),
        inputShape: [null, 1],
    });
    
    //output layer
    model.add(BiLstmLayers);
    
    model.add(tf.layers.dense({ units: 1 }));

    return model;
}