import React from 'react';
import { Line } from 'react-chartjs-2';
import { vanillaModel, BiLSTMModel, stackedModel } from './../utils/model.js';
import { root_mean_squared_error, dataCleaning, divideTensorToChunks, average, standard_deviation } from './../utils/helpers.js';
import {ReactComponent as StripLoad} from './../assets/icon/StripLoad.svg';
import * as tf from '@tensorflow/tfjs';
import store, { SET_RESULT_TRAIN_TEST } from './../utils/store.js';
import { withRouter } from 'react-router-dom';

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

const ListError = ({ error }) => {

    // const errorRef = React.useRef();
    // React.useEffect(() => {
    //     errorRef.current.scrollIntoView();
    // },[error]);

    return (
        <div className="w-9/12 mx-auto text-left my-4">
            <p className="text-gray-900 text-center font-semibold text-lg">Nilai Error</p>
            <div className="border border-gray-500 h-48 overflow-y-auto">
                { error.map((error, index) => {
                    return (
                        <div>{index + 1}. Error : {error}</div>
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
            lossError: null,
            actualTrainingInputs : null,
            actualTestingInputs : null,
            actualTrainingLabels : null,
            actualTestingLabels : null,
            predictTrainingInputs : null,
            predictTestingInputs : null, 
            predict: null,
            loadGraphic: true,
            listError: [],
            lossError: lossErrorLevel,
            resultTrain: resultTrainLevel,
            selectedModel: null
        }
    }

    // selectingModel = () => {
    //     const { parameter : { model } } = store.getState();

    //     if(model === 'stackedLstm'){
    //         this.setState({ selectedModel: stackedModel() });
    //     }
    //     else if(model === 'BiLstm'){
    //         this.setState({ selectedModel: BiLSTMModel() });
    //     }
    //     else{
    //         this.setState({ selectedModel: vanillaModel() });
    //     }

    //     return this.state.selectedModel;
    // }

    trainModel = async (dataset, tensorActualData, parameter, model) => {

        const { learningRate, epochs, quantityTrainSet } = parameter;
            
        const { input_max, input_min, inputs, labels } = tensorActualData;

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

        const { inputsCleaned } = dataCleaning(dataset);

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
            
            console.log('numTensors (in tidy): ' + tf.memory().numTensors);
            
            return {
                xTraining,
                yTraining,
                xTesting,
                yTesting
            };
        });

        console.log('numTensors (outside tidy): ' + tf.memory().numTensors);

        const batchSize = 100;
        const shuffle = true;

        model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: root_mean_squared_error,
            metrics:['acc'],
        });

        console.log('numbytes before : ' + tf.memory().numBytes);
        console.log(tf.memory());
        console.log(data.xTraining.shape);
        console.log(data.yTraining.shape);
        console.log(data.xTesting.shape);
        console.log(data.yTesting.shape);

        let lossError = [], quantityEpochs = [];

        //misal pake data training
        tf.engine().startScope()
        await model.fit(data.xTraining, data.yTraining, { shuffle, batchSize, epochs, callbacks: { 
            onEpochEnd: async (epoch,log) => {
                lossError.push(log.loss);
                quantityEpochs.push(epoch); 
                this.setState({ listError:[...this.state.listError, log.loss] });
            }
        }});

        await model.save('indexeddb://trained-model-1');

        tf.engine().endScope();

        model.summary();

        console.log('numbytes after : ' + tf.memory().numBytes);
        console.log(tf.memory());

        const outps = model.predict(data.yTesting);

        //sedangkan predictnya pakai data testing
        const resultPredicted = model.evaluate(data.xTesting, data.yTesting, { batchSize: 30 });

        let lossErrorVar = this.state.lossError; 

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

        let resultTrainVar = this.state.resultTrain;

        lossErrorVar.labels = quantityEpochs;
        lossErrorVar.datasets[0].data = lossError;
        resultTrainVar.labels = dataset.slice(0, labels.length).map(d => d[Object.keys(d)[0]]);
        resultTrainVar.datasets[0].data = unNormActTrain.dataSync();
        resultTrainVar.datasets[1].data = mergePredictedAndDate;
        resultTrainVar.datasets[2].data = inputsCleaned;

        this.setState({ loadGraphic:false, lossErrorVar, resultTrainVar });
    }

    async componentDidMount(){
        const {dataset, tensorActualData, trainInputsData, trainLabelsData, parameter } = store.getState();

        console.log(dataset.length);

        const batchTensor = divideTensorToChunks(tensorActualData.inputs.dataSync(), tensorActualData.labels.dataSync());
        
        const loadedModel = await tf.loadLayersModel('localstorage://my-model-1');

        await this.trainModel(dataset, tensorActualData, parameter, loadedModel);
        
    }   

    // componentDidUpdate(prevProps,prevState){
    //     if(JSON.stringify(prevState.lossError) !== JSON.stringify(this.state.lossErrorLevel)){
    //         let lossError = this.state.lossError;
    //         lossError.datasets[0].data = [...[null]];

    //         let resultTrain = this.state.resultTrain;
    //         resultTrain.datasets[0].data = [...[null]];
    //         resultTrain.datasets[1].data = [...[null]];

    //         this.setState({lossError,resultTrain});
    //     }
    // }

    render(){
        return (
            <div className="flex flex-col">
                <ListError 
                    error={this.state.listError}
                />
                <div className="relative">
                    {this.state.loadGraphic ? (
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <StripLoad className="w-16 h-16 bg-transparent" />   
                            <span className="text-gray-900">Mohon Tunggu</span>
                        </div>
                    ) : null}
                    <div className={`w-9/12 mx-auto my-6 ${this.state.loadGraphic ? `bg-white opacity-20`: null}`}>
                        <p className="text-gray-900 text-center font-semibold text-lg">Statistik Error</p>
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
                        <p className="text-gray-900 text-center font-semibold text-lg">Hasil Pelatihan</p>
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
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={this.state.resultTrain.datasets[1].data.length !== 1 ? () => this.props.history.push('/dashboard/modelling') : (e) => e.preventDefault()}
                        className={`${this.state.resultTrain.datasets[1].data.length !== 1 ? 'bg-gray-200 text-gray-900' : 'bg-gray-200 text-gray-100'} my-6 mr-4 py-2 text-center font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md`}
                    >
                        Kembali
                    </button>
                    <button
                        onClick={this.state.resultTrain.datasets[1].data.length !== 1 ? (e) => e.preventDefault() : (e) => e.preventDefault()}
                        className={`${this.state.resultTrain.datasets[1].data.length !== 1 ? 'bg-blue-500 text-gray-200' : 'bg-gray-200 text-gray-100'} my-6 mr-4 py-2 text-center font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md`}
                    >
                        Download PNG
                    </button>
                    <button
                        onClick={this.state.resultTrain.datasets[1].data.length !== 1 ? this.validateModel : (e) => e.preventDefault()}
                        className={`${this.state.resultTrain.datasets[1].data.length !== 1 ? 'bg-blue-500 text-gray-200' : 'bg-gray-200 text-gray-100'} my-6 mr-4 py-2 text-center font-medium hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 transition duration-300 ease-in-out px-2 rounded-md`}
                    >
                        Validasi Model
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(Evaluation);