import React from 'react';
import { Line } from 'react-chartjs-2';
import { vanillaModel, BiLSTMModel, stackedModel } from './../utils/model.js';
import { root_mean_squared_error, dataCleaning, divideTensorToChunks, average, standard_deviation } from './../utils/helpers.js';
import {ReactComponent as StripLoad} from './../assets/icon/StripLoad.svg';
import * as tf from '@tensorflow/tfjs';
import store, { SET_RESULT_TRAIN_TEST } from './../utils/store.js';
import Table from './../tables/Table.js';
import { withRouter } from 'react-router-dom';

const lossErrorLevel = {
    labels: [...[null]],
    datasets: [
      {
        label: 'Training Loss',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(12,199,46,1)',
        borderWidth: 1,
        borderColor: 'rgba(12,199,46,1)',
        data: [...[null]],
      },
      {
        label: 'Testing Loss',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(52,134,235,1)',
        borderWidth: 1,
        borderColor: 'rgba(52,134,235,1)',
        data: [...[null]],
      },
    ]
}

const resultTrainLevel = {
    labels: [...[null]],
    datasets: [
      {
        label: 'Training Data',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(245,167,32,1)',
        borderColor: 'rgba(245,167,32,1)',
        borderWidth: 2,
        data: [...[null]]
      },
      {
        label: 'Testing Data',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(52, 217, 95,1)',
        borderColor: 'rgba(52, 217, 95,1)',
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

const ListError = ({ errors }) => {
    return (
        <div className="w-9/12 mx-auto text-left my-4">
            <p className="text-gray-900 text-center font-semibold text-lg">Nilai Training Loss dan Testing Loss</p>
            <div className="border border-gray-500 h-48 overflow-y-auto">
                {errors.map((error, index) => {
                    return (
                        <div>{index + 1}. Training Loss : {error.loss}, Testing Loss: {error.val_loss}</div>
                    );
                })}
            </div>
        </div>
    )
}

class Evaluation extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            actualTrainingInputs : null,
            actualTestingInputs : null,
            actualTrainingLabels : null,
            actualTestingLabels : null,
            predictTrainingInputs : null,
            predictTestingInputs : null, 
            mergeActualAndPredicted: null,
            predict: null,
            loadGraphic: true,
            listTrainingError: [],
            listTestingError: [],
            testingError: null,
            lossError: lossErrorLevel,
            resultTrain: resultTrainLevel,
            selectedModel: null,
        }
    }

    trainModel = async (dataset, tensorActualData, parameter, model) => {

        const { epochs, quantityTrainSet } = parameter;
            
        const { input_max, input_min, inputs, labels } = tensorActualData;

        //Pembagian dataset untuk ditampilkan pada grafik
        await inputs.data().then(data => {
            this.setState({ 
                actualTrainingInputs : data.slice(0, Math.round(data.length * quantityTrainSet / 100)),
                actualTestingInputs : data.slice((Math.round(data.length * quantityTrainSet / 100)), data.length)
            })
        });

        await labels.data().then(data => {
            this.setState({ 
                actualTrainingLabels : data.slice(0, Math.round(data.length * quantityTrainSet / 100)),
                actualTestingLabels : data.slice((Math.round(data.length * quantityTrainSet / 100)), data.length)
            });
        });

        const { inputs_cleaned } = dataCleaning(dataset);
        
        //untuk mengurangi memori pada data pelatihan dan pengujian
        const data = tf.tidy(() => {
            //untuk data pelatihan
            let trainingLabels = tf.tensor2d(this.state.actualTrainingLabels, [this.state.actualTrainingLabels.length, 1]);
            let trainingInputs = tf.tensor2d(this.state.actualTrainingInputs, [this.state.actualTrainingInputs.length, 1]);

            //cari nilai batch size untuk dimensional data training
            const batchTraining = divideTensorToChunks(trainingInputs.dataSync(), trainingLabels.dataSync());

            //steps pada shape dalam data tensor training
            let inputTrainingSteps = trainingInputs.size / batchTraining.inputs;
            let labelTrainingSteps = trainingLabels.size / batchTraining.labels;

            //diubah ulang shape data training
            let xTraining = trainingLabels.reshape([batchTraining.labels, labelTrainingSteps, 1]);
            let yTraining = trainingInputs.reshape([batchTraining.inputs, inputTrainingSteps, 1]);
            // let xTraining = trainingLabels.reshape([1, trainingInputs.size, 1]);
            // let yTraining = trainingInputs.reshape([1, trainingLabels.size, 1]);

            //untuk data pengujian
            let testingLabels = tf.tensor2d(this.state.actualTestingLabels, [this.state.actualTestingLabels.length, 1]);
            let testingInputs = tf.tensor2d(this.state.actualTestingInputs, [this.state.actualTestingInputs.length, 1]);
            
            //cari nilai batch size untuk dimensional data testing
            const batchTesting = divideTensorToChunks(testingInputs.dataSync(), testingLabels.dataSync());

            //steps pada shape dalam data tensor testing
            let inputTestingSteps = testingInputs.size / batchTesting.inputs;
            let labelTestingSteps = testingLabels.size / batchTesting.labels;

            //diubah ulang shape data testing
            let xTesting = testingLabels.reshape([batchTesting.labels, labelTestingSteps, 1]);
            let yTesting = testingInputs.reshape([batchTesting.inputs, inputTestingSteps, 1]);

            // let xTesting = testingLabels.reshape([1, testingInputs.size, 1]);
            // let yTesting = testingInputs.reshape([1, testingLabels.size, 1]);
            
            console.log('numTensors (in tidy): ' + tf.memory().numTensors);
            
            return {
                xTraining,
                yTraining,
                xTesting,
                yTesting
            };
        });

        console.log('numTensors (outside tidy): ' + tf.memory().numTensors);

        console.log(data.xTesting);
        console.log(data.yTesting);

        const batchSize = 100;
        const shuffle = true;

        model.compile({
            optimizer: tf.train.adam(0.0001),
            loss: root_mean_squared_error
        });

        console.log('numbytes before : ' + tf.memory().numBytes);
        console.log(tf.memory());
 
        model.summary();

        let lossTrainError = [], lossTestError = [], quantityEpochs = [];

        //misal pake data training
        tf.engine().startScope()
        await model.fit(data.xTraining, data.yTraining, { 
            shuffle, 
            batchSize, 
            epochs, 
            validationData: [data.xTraining, data.yTraining], 
            callbacks: [
                //tf.callbacks.earlyStopping({ monitor: 'val_loss' }),
                new tf.CustomCallback({
                    onEpochEnd: async (epoch, log) => {
                        console.log(log);
                        lossTrainError.push(log.loss);
                        lossTestError.push(log.val_loss);
                        quantityEpochs.push(epoch); 
                        this.setState({ listTrainingError:[...this.state.listTrainingError, log] });
                    }
                })
            ]
        });

        await model.save('indexeddb://trained-model-1');

        // const loadedModel = await tf.loadGraphModel('indexeddb://trained-model-1');

        // console.log(loadedModel.loadSync);

        tf.engine().endScope();

        // console.log('numbytes after : ' + tf.memory().numBytes);
        // console.log(tf.memory());
        
        //sedangkan predictnya pakai data testing
        const resultPredicted = await model.evaluate(data.xTesting, data.yTesting, { batchSize: batchSize });

        console.log(resultPredicted.dataSync());

        const outps = model.predict(data.yTesting);

        this.setState({ testingError: resultPredicted.dataSync() });

        console.log(this.state.testingError[0]);
        // let normalizedResultInp = resultPredicted[0].mul(input_max.sub(input_min)).add(input_min);
        // let normalizedResultLab = resultPredicted[1].mul(labelMax.sub(labelMin)).add(labelMin);

        //denormalisasi data testing
        const unNormActTrain = data.yTraining.mul(input_max.sub(input_min)).add(input_min);
        const unNormPreds = outps.mul(input_max.sub(input_min)).add(input_min);

        let mergePredictedAndDate = dataset.slice(Math.round(dataset.length * quantityTrainSet / 100), dataset.length).map((value, i) => {
            return {
                x : value[Object.keys(value)[0]],
                y : unNormPreds.dataSync()[i]
            }
        });

        let mergeActualAndPredicted = dataset.slice(Math.round(dataset.length * quantityTrainSet / 100), dataset.length).map((value, i) => {
            return {
                x : value[Object.keys(value)[0]],
                y : value[Object.keys(value)[1]],
                z : unNormPreds.dataSync()[i]
            };  
        });

        this.setState({     
            predictTestingInputs: unNormPreds.dataSync(),
            mergeActualAndPredicted: mergeActualAndPredicted
        });

        console.log(mergeActualAndPredicted);

        let resultTrainVar = this.state.resultTrain;
        let lossErrorVar = this.state.lossError; 

        lossErrorVar.labels = quantityEpochs;
        lossErrorVar.datasets[0].data = lossTrainError;
        lossErrorVar.datasets[1].data = lossTestError;
        resultTrainVar.labels = dataset.slice(0, labels.length).map(d => d[Object.keys(d)[0]]);
        resultTrainVar.datasets[0].data = unNormActTrain.dataSync();
        resultTrainVar.datasets[1].data = mergePredictedAndDate;
        resultTrainVar.datasets[2].data = inputs_cleaned;

        this.setState({ loadGraphic:false, lossErrorVar, resultTrainVar });
    }


    async componentDidMount(){

        const {dataset, tensorActualData, parameter } = store.getState();

        const loadedModel = await tf.loadLayersModel('indexeddb://my-model-1');

        await this.trainModel(dataset, tensorActualData, parameter, loadedModel);

        console.log(this.state.listTrainingError);
    }   

    render(){
        return (
            <div className="flex flex-col">
                <ListError 
                    errors={this.state.listTrainingError}
                />
                <div className="relative">
                    {this.state.loadGraphic ? (
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <StripLoad className="w-16 h-16 bg-transparent" />   
                            <span className="text-gray-900">Mohon Tunggu</span>
                        </div>
                    ) : null}
                    <div className={`w-9/12 mx-auto my-6 ${this.state.loadGraphic ? `bg-white opacity-20`: null}`}>
                        <p className="text-gray-900 text-center font-semibold text-lg">Statistik Nilai Training Loss dan Testing Loss</p>
                        <Line
                            data={{...this.state.lossError}}
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
                        <p className="text-gray-900 text-center font-semibold text-sm">Training Loss: {this.state.listTrainingError.length ? this.state.listTrainingError[this.state.listTrainingError.length - 1].loss : ''}</p>
                        <p className="text-gray-900 text-center font-semibold text-sm">Testing Loss: {this.state.listTrainingError.length ? this.state.listTrainingError[this.state.listTrainingError.length - 1].val_loss : ''}</p>
                        {/* <p className="text-gray-900 text-center font-semibold text-sm">Testing Loss: {this.state.testingError ? this.state.testingError[0] : null}</p> */}
                    </div>
                </div>
                <div className="relative">
                    {this.state.loadGraphic ? (
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <StripLoad className="w-16 h-16 bg-transparent" />   
                            <span className="text-gray-900">Mohon Tunggu</span>
                        </div>
                    ) : null}
                    <div className={`w-9/12 mx-auto my-6 ${this.state.loadGraphic ? `bg-white opacity-20` : null}`}>
                        <p className="text-gray-900 text-center font-semibold text-lg">Hasil Prediksi</p>
                        <Line
                            data={{...this.state.resultTrain}}
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
                    {/* <div className={`w-9/12 mx-auto my-6 ${this.state.loadGraphic ? `bg-white opacity-20` : null}`}>
                        <p className="text-gray-900 text-center font-semibold text-lg">Tabel Perbandingan data aktual dan data prediksi</p>
                        <Table 
                            leftHeader={'Tanggal'}
                            centerHeader={'Harga Aktual'}
                            rightHeader={'Harga Prediksi'}
                            arrMergeNormalized={this.state.mergeActualAndPredicted}
                        />
                    </div> */}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={this.state.resultTrain.datasets[1].data.length !== 1 ? () => this.props.history.push('/dashboard/modelling') : (e) => e.preventDefault()}
                        className={`${this.state.resultTrain.datasets[1].data.length !== 1 ? 'bg-gray-200 text-gray-900' : 'bg-gray-200 text-gray-100'} my-6 mr-4 py-2 text-center font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md`}
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(Evaluation);