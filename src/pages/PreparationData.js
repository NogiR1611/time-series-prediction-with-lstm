import React from 'react';
import {withRouter} from 'react-router-dom';
import NormalizationTable from './../tables/NormalizationTable.js';
import {divideTensorToChunks, dataCleaning} from './../utils/helpers';
import * as tf from '@tensorflow/tfjs';
import store, {SET_TENSOR_ACTUAL_DATA, SET_TRAIN_INPUTS_DATA, SET_TRAIN_LABELS_DATA} from './../utils/store';

class PreparationData extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            normalizedInputsData: null,
            normalizedLabelsData: null
        }
    }

    convertToTensor = (data, quantityTrainSet) => { 
        return tf.tidy(() => {

            const {inputsCleaned, labelsCleaned} = dataCleaning(data);

            console.log(inputsCleaned);
            console.log(labelsCleaned);

            const inputTensor = tf.tensor2d(inputsCleaned, [inputsCleaned.length,1]);
            const labelTensor = tf.tensor2d(labelsCleaned, [labelsCleaned.length,1]);
            
            //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();
            const labelMax = labelTensor.max();
            const labelMin = labelTensor.min();

            inputTensor.sub(inputMin).div(inputMax.sub(inputMin))
                .data()
                .then(data => {
                    store.dispatch({ 
                        type: SET_TRAIN_INPUTS_DATA,  
                        payload: data.slice(0, Math.round(data.length * quantityTrainSet / 100))
                    })
                    this.setState({ normalizedInputsData : data })
                })

            labelTensor.sub(labelMin).div(labelMax.sub(labelMin))
                .data()
                .then(data => {
                    store.dispatch({
                        type: SET_TRAIN_LABELS_DATA,
                        payload: data.slice(0, Math.round(data.length * quantityTrainSet / 100))
                    })
                    this.setState({ normalizedLabelsData : data })
                })
            
            const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin))

            const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin))
            
            return {
              inputs: normalizedInputs,
              labels: normalizedLabels,
              // Return the min/max bounds so we can use them later.
              inputMax,
              inputMin,
              labelMax,
              labelMin,
            }
        })
    }

    componentDidMount(){
        const {dataset, tensorData, parameter : { quantityTrainSet, inputLayersUnit, hiddenLayersUnit } } = store.getState();
        
        const { inputs, labels } = this.convertToTensor(dataset, quantityTrainSet);

        store.dispatch({ 
            type: SET_TENSOR_ACTUAL_DATA, 
            payload: this.convertToTensor(dataset, quantityTrainSet) 
        });
        
        // inputs.data().then(data => {
        //     this.setState({ normalizedInputsData : data })
        //     console.log(this.state.normalizedInputsData);
        // });

        // labels.data().then(data => {
        //     this.setState({ normalizedLabelsData : data })
        // });

        // console.log(this.state.normalizedInputsData);
        /*
        let x = tf.tensor([1,2,3,4,5,6])
        let y = tf.tensor([1,2,3,4,5,6])
        
        let xs = x.reshape([2,3,1]);
        let ys = y.reshape([2,3,1]);

        xs.print();

        const model = tf.sequential();
        
        model.add(tf.layers.dense({ units:3,inputShape:[3,1] }))

        model.add(tf.layers.rnn({
            cell:[
                tf.layers.lstmCell({ units:1 }),
                tf.layers.lstmCell({ units:1 }),
            ],
            inputShape: [3,1],
            returnSequences:true
        }))

        model.add(tf.layers.dense({ units:1,returnSequences:true }));

        model.compile({
            optimizer:tf.train.adam(0.01),
            loss:tf.losses.meanSquaredError
        });

        await model.fit(xs, ys, { epochs: 20,callbacks:{
            onEpochEnd : async (epoch,log) => {
                console.log(log.loss);
            }
        }});

        const inputs = tf.tensor3d([[[1],[2],[3]],[[4],[5],[6]]])
        const pred = model.predict(xs.reshape([2,3,1]));
        pred.print();
        */
    }

    render(){
        const {dataset,parameter : { quantityTrainSet }, tensorData } = store.getState();
    
        return (
            <div
                className="flex flex-col"
            >
                <div className="flex flex-col py-4">
                    <div className="flex justify-center">
                        <p className="text-gray-900 font-semibold text-lg">Data {Object.keys(dataset[0])[0]}</p>
                    </div>
                    <div className="flex flex-wrap justify-center">
                        <NormalizationTable 
                            title="Normalisasi Data Training"
                            propertyData={Object.keys(dataset[0])[0]}
                            beforeNormalizedData={dataset.slice(0, Math.round(dataset.length * quantityTrainSet / 100 ))}
                            afterNormalizedData={this.state.normalizedLabelsData && this.state.normalizedLabelsData.slice(0, Math.round(this.state.normalizedLabelsData.length * quantityTrainSet / 100))}
                        />
                        <NormalizationTable 
                            title="Normalisasi Data Testing"
                            propertyData={Object.keys(dataset[0])[0]}
                            beforeNormalizedData={dataset.slice((Math.round(dataset.length * quantityTrainSet/100)),dataset.length)}
                            afterNormalizedData={this.state.normalizedLabelsData && this.state.normalizedLabelsData.slice((Math.round(this.state.normalizedLabelsData.length * quantityTrainSet/100)),this.state.normalizedLabelsData.length)}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-center">
                        <p className="text-gray-900 font-semibold text-lg">Data {Object.keys(dataset[0])[1]}</p>
                    </div>
                    <div className="flex flex-wrap justify-center">
                        <NormalizationTable 
                            title="Normalisasi Data Training"
                            propertyData={Object.keys(dataset[0])[1]}
                            beforeNormalizedData={dataset.slice(0,Math.round(dataset.length * quantityTrainSet/100))}
                            afterNormalizedData={this.state.normalizedInputsData && this.state.normalizedInputsData.slice(0, Math.round(this.state.normalizedInputsData.length * quantityTrainSet/100))}
                        />
                        <NormalizationTable 
                            title="Normalisasi Data Testing"
                            propertyData={Object.keys(dataset[0])[1]}
                            beforeNormalizedData={dataset.slice((Math.round(dataset.length * quantityTrainSet/100)),dataset.length)}
                            afterNormalizedData={this.state.normalizedInputsData && this.state.normalizedInputsData.slice((Math.round(this.state.normalizedInputsData.length * quantityTrainSet/100)), this.state.normalizedInputsData.length)}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => this.props.history.push('/dashboard/modelling')}
                        className="my-6 mr-4 bg-blue-500 py-2 text-center text-gray-200 font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md"
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(PreparationData);