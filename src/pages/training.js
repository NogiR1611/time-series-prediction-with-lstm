import React from 'react';
import {Line} from 'react-chartjs-2';
import * as tf from '@tensorflow/tfjs';
import store from './../utils/store.js';
import { lstm, rnn } from '@tensorflow/tfjs-layers/dist/exports_layers';

const lossErrorLevel = {
    labels: [...[null]],
    datasets: [
      {
        label: 'Error',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(12,199,46,1)',
        borderWidth: 1,
        borderColor: 'rgba(12,199,46,1)',
        data: [...[null]],
      }
    ]
}

const resultTrainLevel = {
    labels: [...[null]],
    datasets: [
      {
        label: 'Train Data',
        fill: false,
        lineTension: 0.2,
        backgroundColor: 'rgba(245,167,32,1)',
        borderColor: 'rgba(245,167,32,1)',
        borderWidth: 2,
        data: [...[null]]
      },
      {
        label: 'Actual Data',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        data: [...[null]]
      },
    ]
}

export default class Training extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            lossError: null,
            predict: null,
        }
    }

    trainModel = async (dataset,tensorData,inputs,labels) => {
        const model = tf.sequential();
        const {inputMax,inputMin} = tensorData;
        const xs = tf.tensor2d(labels,[labels.length,1]);
        const ys = tf.tensor2d(inputs,[inputs.length,1]);
        
        const window_size = 1;
        const input_layer_shape = window_size;
        const input_layer_neurons = 8;
        
        const rnn_input_layer_features = 2;
        const rnn_input_layer_timesteps = input_layer_neurons / rnn_input_layer_features;

        const rnn_input_shape = [rnn_input_layer_features,rnn_input_layer_timesteps];
        const rnn_output_neurons = 10;

        const output_layer_shape = rnn_output_neurons;
        const output_layer_neurons = 1;

        const batchSize = 32;
        const n_layers = 3;
        const epochs = 20;

        model.add(tf.layers.dense({ inputShape:[input_layer_shape],units:input_layer_neurons }));
        model.add(tf.layers.reshape({ targetShape:rnn_input_shape }))
        
        let lstm_cells = [];

        for(let i=0; i < n_layers; i++){
            lstm_cells.push(tf.layers.lstmCell({ units:rnn_output_neurons }))
        }

        model.add(tf.layers.rnn({
            cell: lstm_cells,
            inputShape: rnn_input_shape,
            returnSequences: false
        }))
        
        model.add(tf.layers.dense({ units:output_layer_neurons,inputShape:[output_layer_shape] }))

        model.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.meanSquaredError,
          });
        
        const lossError = [],quantityEpochs=[];
        await model.fit(xs, ys, {batchSize,epochs,callbacks: { 
            onEpochEnd: async (epoch,log) => {
                console.log(log.loss);
                lossError.push(log.loss);
                quantityEpochs.push(epoch);
            }
        }});
        
        const outps = model.predict(ys);
        
        const unNormAct = ys.mul(inputMax.sub(inputMin)).add(inputMin)
        const unNormPreds = outps.mul(inputMax.sub(inputMin)).add(inputMin)

        lossErrorLevel.labels = quantityEpochs;
        lossErrorLevel.datasets[0].data = lossError;
        resultTrainLevel.labels = dataset.slice(0,labels.length).map(d => d[Object.keys(d)[0]]);
        resultTrainLevel.datasets[0].data = unNormPreds.dataSync();
        resultTrainLevel.datasets[1].data = unNormAct.dataSync();

        this.setState({});
    }

    async componentDidMount(){
        const {dataset,tensorData,trainInputsData,trainLabelsData} = store.getState();

        await this.trainModel(dataset,tensorData,trainInputsData,trainLabelsData);
    }
    render(){
        return (
            <div className="flex flex-col">
                <div className="w-9/12 mx-auto my-6">
                    <p className="text-gray-900 text-center font-semibold text-lg">Tingkat Error</p>
                    <Line
                        data={{...lossErrorLevel}}
                        options={{
                            title:{
                                display:true,
                                text:'Average Rainfall per month',
                                fontSize:20
                            },
                            legend:{
                                display:true,
                                position:'right'
                            }
                        }}
                    />
                </div>
                <div className="w-9/12 mx-auto my-6">
                    <p className="text-gray-900 text-center font-semibold text-lg">Hasil Pelatihan</p>
                    <Line
                        data={{...resultTrainLevel}}
                        options={{
                            title:{
                                display:true,
                                text:'Average Rainfall per month',
                                fontSize:20
                            },
                            legend:{
                                display:true,
                                position:'right'
                            }
                        }}
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="my-6 mr-4 bg-blue-500 py-2 text-center text-gray-200 font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md"
                    >
                        Download PDF
                    </button>
                    <button
                        className="my-6 mr-4 bg-blue-500 py-2 text-center text-gray-200 font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md"
                    >
                        Download PNG
                    </button>
                    <button
                        className="my-6 mr-4 bg-blue-500 py-2 text-center text-gray-200 font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md"
                    >
                        Validasi Model
                    </button>
                    <button
                        className="my-6 mr-4 bg-blue-500 py-2 text-center text-gray-200 font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md"
                    >
                        Buat Prediksi
                    </button>
                </div>
            </div>
        );
    }
}