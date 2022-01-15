import React from 'react';
import { withRouter } from 'react-router-dom';
import NormalizationTable from './../tables/NormalizationTable.js';
import { dataCleaning } from './../utils/helpers';
import * as tf from '@tensorflow/tfjs';
import store, { SET_DATASET, SET_TENSOR_ACTUAL_DATA, SET_TRAIN_INPUTS_DATA, SET_TRAIN_LABELS_DATA } from './../utils/store';

class PreparationData extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            normalized_input_data: null,
            normalized_label_data: null,
            cleanedData: []
        }
    }

    convertToTensor = (data, quantityTrainSet) => { 
        return tf.tidy(() => {

            //membuang atribut missing value
            const reduced_data = data.filter((d, i) => d[Object.keys(d)[1]] !== "-");

            this.setState({ cleanedData: reduced_data });

            store.dispatch({ type: SET_DATASET, payload: reduced_data });

            //pembersihan noise
            const { inputs_cleaned, labels_cleaned } = dataCleaning(reduced_data);

            const input_tensor = tf.tensor2d(inputs_cleaned, [inputs_cleaned.length, 1]);
            const label_tensor = tf.tensor2d(labels_cleaned, [labels_cleaned.length, 1]);
    
            //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
            const input_max = input_tensor.max();
            const input_min = input_tensor.min();
            const label_max = label_tensor.max();
            const label_min = label_tensor.min();

            input_tensor.sub(input_min).div(input_max.sub(input_min))
                .data()
                .then(data => {
                    store.dispatch({ 
                        type: SET_TRAIN_INPUTS_DATA,  
                        payload: data.slice(0, Math.round(data.length * quantityTrainSet / 100))
                    })
                    this.setState({ normalized_input_data : data })
                })

            label_tensor.sub(label_min).div(label_max.sub(label_min))
                .data()
                .then(data => {
                    store.dispatch({
                        type: SET_TRAIN_LABELS_DATA,
                        payload: data.slice(0, Math.round(data.length * quantityTrainSet / 100))
                    })
                    this.setState({ normalized_label_data : data })
                })
            
            const normalized_inputs = input_tensor.sub(input_min).div(input_max.sub(input_min))

            const normalized_labels = label_tensor.sub(label_min).div(label_max.sub(label_min))

            return {
              inputs: normalized_inputs,
              labels: normalized_labels,
              // Return the min/max bounds so we can use them later.
              input_max,
              input_min,
              label_max,
              label_min,
            }
        })
    }

    componentDidMount(){
        const {dataset, parameter : { quantityTrainSet } } = store.getState();

        store.dispatch({ 
            type: SET_TENSOR_ACTUAL_DATA, 
            payload: this.convertToTensor(dataset, quantityTrainSet) 
        });
        
    }

    render(){
        const {dataset, parameter : { quantityTrainSet } } = store.getState();

        return (
            <div className="flex flex-col">
                <div className="flex flex-col py-4">
                    <div className="flex justify-center">
                        <p className="text-gray-900 font-semibold text-lg">Data {Object.keys(dataset[0])[0]}</p>
                    </div>
                    <div className="flex flex-wrap justify-center">
                        <NormalizationTable 
                            title="Normalisasi Data Training"
                            propertyData={this.state.cleanedData.length && Object.keys(this.state.cleanedData[0])[0]}
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice(0, Math.round(this.state.cleanedData.length * quantityTrainSet / 100 ))}
                            afterNormalizedData={this.state.normalized_label_data && this.state.normalized_label_data.slice(0, Math.round(this.state.normalized_label_data.length * quantityTrainSet / 100))}
                        />
                        <NormalizationTable 
                            title="Normalisasi Data Testing"
                            propertyData={this.state.cleanedData.length && Object.keys(this.state.cleanedData[0])[0]}
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice((Math.round(this.state.cleanedData.length * quantityTrainSet/100)),this.state.cleanedData.length)}
                            afterNormalizedData={this.state.normalized_label_data && this.state.normalized_label_data.slice((Math.round(this.state.normalized_label_data.length * quantityTrainSet/100)),this.state.normalized_label_data.length)}
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
                            propertyData={this.state.cleanedData.length && Object.keys(this.state.cleanedData[0])[1]}
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice(0,Math.round(this.state.cleanedData.length * quantityTrainSet / 100))}
                            afterNormalizedData={this.state.normalized_input_data && this.state.normalized_input_data.slice(0, Math.round(this.state.normalized_input_data.length * quantityTrainSet/100))}
                        />
                        <NormalizationTable 
                            title="Normalisasi Data Testing"
                            propertyData={this.state.cleanedData.length && Object.keys(this.state.cleanedData[0])[1]}
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice((Math.round(this.state.cleanedData.length * quantityTrainSet/100)), this.state.cleanedData.length)}
                            afterNormalizedData={this.state.normalized_input_data && this.state.normalized_input_data.slice((Math.round(this.state.normalized_input_data.length * quantityTrainSet/100)), this.state.normalized_input_data.length)}
                        />
                    </div>
                </div>
                <div className="flex justify-start px-12 py-4">
                    <h3 className="font-semibold">Data setelah dibersihkan : {this.state.cleanedData && this.state.cleanedData.length} records</h3>
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