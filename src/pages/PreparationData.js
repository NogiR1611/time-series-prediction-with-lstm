import React from 'react';
import { withRouter } from 'react-router-dom';
import NormalizationTable from './../tables/NormalizationTable.js';
import { dataCleaning, splitSequences } from './../utils/helpers';
import * as tf from '@tensorflow/tfjs';
import store, { SET_DATASET, SET_TENSOR_ACTUAL_DATA, SET_TRAIN_INPUTS_DATA, SET_TRAIN_LABELS_DATA } from './../utils/store';

class PreparationData extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            normalizedInputData: null,
            normalizedTargetData: null,
            cleanedData: []
        }
    }

    convertToTensor = (data, quantityTrainSet) => { 
        return tf.tidy(() => {

            //membuang atribut missing value
            const reducedData = data.filter((d, i) => d[Object.keys(d)[1]] !== "-");

            //masukan ke state cleanedData dari hasil pembuangan atribut
            this.setState({ cleanedData: reducedData });

            //selain ke state juga disimpan ke redux
            store.dispatch({ type: SET_DATASET, payload: reducedData });

            //pembersihan noise dari dataset yang sudah dibuang atributnya
            const { inputsCleaned, targetsCleaned } = dataCleaning(reducedData);

            //buatkan data tensor dengan dimensi 2d pada inputsCleaned sebagai tanggal dan targetsCleaned sebagai harga
            const inputTensor = tf.tensor2d(inputsCleaned, [inputsCleaned.length, 1]);
            const targetTensor = tf.tensor2d(targetsCleaned, [targetsCleaned.length, 1]);
            
            //tentukan nilai terbesar dan terkecil pada inputs dan juga targets
            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();
            const targetMax = targetTensor.max();
            const targetMin = targetTensor.min();

            //normalisasi dataset dengan mengkonversi menjadi rentang antara 0-1 dengan metode min-max scaling sebanyak dua kali

            //normalisasi untuk ditampilkan pada halaman persiapan data
            
            //normalisasi pada inputs
            inputTensor.sub(inputMin).div(inputMax.sub(inputMin))
                .data()
                .then(data => {
                    //hasil normalisasi disimpan pada redux
                    store.dispatch({ 
                        type: SET_TRAIN_INPUTS_DATA,  
                        payload: data.slice(0, Math.round(data.length * quantityTrainSet / 100))
                    })
                    //selain itu juga disimpan pada state
                    this.setState({ normalizedInputData : data })
                })

            //normalisasi pada targets
            targetTensor.sub(targetMin).div(targetMax.sub(targetMin))
                .data()
                .then(data => {
                    //hasil normalisasi disimpan pada redux
                    store.dispatch({
                        type: SET_TRAIN_LABELS_DATA,
                        payload: data.slice(0, Math.round(data.length * quantityTrainSet / 100))
                    })
                    //selain itu juga disimpan pada state
                    this.setState({ normalizedTargetData : data })
                })
            
            //normmalisasi untuk disimpan pada redux agar dapat digunakan pada halaman selanjutnya
            
            //mulai perhitungan normalisasi pada inputs
            const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin))

            //mulai perhitungan normalisasi pada targets
            const normalizedTargets = targetTensor.sub(targetMin).div(targetMax.sub(targetMin))

            //dari fungsi disini mengembalikan nilai inputs,targets,inputMax,inputMin,targetMax,targetMin
            return {
              inputs: normalizedInputs,
              targets: normalizedTargets,
              inputMax,
              inputMin,
              targetMax,
              targetMin,
            }
        })
    }

    componentDidMount(){
        //ekstrasi state/nilai dari redux yang sudah disimpan sebelumnya untuk digunakan
        const {dataset, parameter : { quantityTrainSet } } = store.getState();

        //dari hasil pengembalian nilai pada fungsi convertToTensor(), simpan pada redux
        store.dispatch({ 
            type: SET_TENSOR_ACTUAL_DATA, 
            payload: this.convertToTensor(dataset, quantityTrainSet) 
        });
    }

    render(){
        const { dataset, parameter : { quantityTrainSet } } = store.getState();

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
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice(0,Math.round(this.state.cleanedData.length * quantityTrainSet / 100))}
                            afterNormalizedData={this.state.normalizedInputData && this.state.normalizedInputData.slice(0, Math.round(this.state.normalizedInputData.length * quantityTrainSet/100))}
                        />
                        <NormalizationTable 
                            title="Normalisasi Data Testing"
                            propertyData={this.state.cleanedData.length && Object.keys(this.state.cleanedData[0])[0]}
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice((Math.round(this.state.cleanedData.length * quantityTrainSet/100)), this.state.cleanedData.length)}
                            afterNormalizedData={this.state.normalizedInputData && this.state.normalizedInputData.slice((Math.round(this.state.normalizedInputData.length * quantityTrainSet/100)), this.state.normalizedInputData.length)}
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
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice(0, Math.round(this.state.cleanedData.length * quantityTrainSet / 100 ))}
                            afterNormalizedData={this.state.normalizedTargetData && this.state.normalizedTargetData.slice(0, Math.round(this.state.normalizedTargetData.length * quantityTrainSet / 100))}
                        />
                        <NormalizationTable 
                            title="Normalisasi Data Testing"
                            propertyData={this.state.cleanedData.length && Object.keys(this.state.cleanedData[0])[1]}
                            beforeNormalizedData={this.state.cleanedData.length && this.state.cleanedData.slice((Math.round(this.state.cleanedData.length * quantityTrainSet/100)),this.state.cleanedData.length)}
                            afterNormalizedData={this.state.normalizedTargetData && this.state.normalizedTargetData.slice((Math.round(this.state.normalizedTargetData.length * quantityTrainSet/100)),this.state.normalizedTargetData.length)}
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