import React from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from "react-datepicker";
import { vanillaModel, BiLSTMModel, stackedModel } from './../utils/model.js';
import { root_mean_squared_error, dataCleaning, divideTensorToChunks, splitSequences } from './../utils/helpers.js';
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
        label: 'Predicted Data',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(235, 225, 52, 1)',
        borderColor: 'rgba(235, 225, 52, 1)',
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
            actualTrainingTargets : null,
            actualTestingTargets : null,
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
            startDatePredicted: new Date(),
            endDatePredicted: new Date()
        }
    }

    getDate = (start, end) => {
        let dateArr = new Array();
        let currentDate = start;

        while(currentDate <= end) {
            currentDate = currentDate.addDays(1);
            dateArr.push(new Date(currentDate));
        }

        return dateArr;
    }

    trainModel = async (dataset, tensorActualData, parameter, model) => {

        //lakukan ekstrasi nilai berupa epoch dan quantityTrainSet dari parameter
        const { epochs, quantityTrainSet } = parameter;
            
        //lakukan ekstrasi nilai berupa targetMax, targetMin, inputs, dan targets dari tensorActualData
        const { targetMax, targetMin, inputs, targets } = tensorActualData;

        //reminder
        //definisikan inputs sebagai tanggal
        //definisikan targets sebagai harga

        //Pembagian inputs menjadi training set dan testing set untuk tampilan pada grafik
        await inputs.data().then(data => {
            //simpan hasil pembagian keduanya pada state
            this.setState({ 
                actualTrainingInputs : data.slice(0, Math.round(data.length * quantityTrainSet / 100)),
                actualTestingInputs : data.slice((Math.round(data.length * quantityTrainSet / 100)), data.length)
            })
        });

        //Pembagian targets menjadi training set dan testing set untuk tampilan pada grafik
        await targets.data().then(data => {
            //simpan hasil pembagian keduanya pada state
            this.setState({ 
                actualTrainingTargets : data.slice(0, Math.round(data.length * quantityTrainSet / 100)),
                actualTestingTargets : data.slice((Math.round(data.length * quantityTrainSet / 100)), data.length)
            });
        });
        
        //gunakan tf.tidy pada saat pembagian training set dan testing set pada inputs dan targets untuk mengurangi memori pada data pelatihan model agar lebih ringan
        const data = tf.tidy(() => {
            //buat data tensor 2d untuk training set pada inputs dan targets 
            let trainingTargets = tf.tensor2d(this.state.actualTrainingTargets, [this.state.actualTrainingTargets.length, 1]);
            let trainingInputs = tf.tensor2d(this.state.actualTrainingInputs, [this.state.actualTrainingInputs.length, 1]);

            //tentukan nilai batch size untuk dimensional training set pada inputs dan targets
            const batchTraining = divideTensorToChunks(trainingInputs.dataSync(), trainingTargets.dataSync());

            //tentukan timesteps pada shape dalam data tensor training set
            let inputTrainingSteps = trainingInputs.size / batchTraining.inputs;
            let targetTrainingSteps = trainingTargets.size / batchTraining.targets;

            //diubah ulang shape pada data tensor training set yang sebelumnya 2d menjadi 3d
            let xTraining = trainingInputs.reshape([batchTraining.inputs, inputTrainingSteps, 1]);
            let yTraining = trainingTargets.reshape([batchTraining.targets, targetTrainingSteps, 1]);
            
            //buat data tensor 2d untuk testing set pada inputs dan targets
            let testingTargets = tf.tensor2d(this.state.actualTestingTargets, [this.state.actualTestingTargets.length, 1]);
            let testingInputs = tf.tensor2d(this.state.actualTestingInputs, [this.state.actualTestingInputs.length, 1]);
            
            //tentukan nilai batch size untuk dimensional testing set pada inputs dan targets
            const batchTesting = divideTensorToChunks(testingInputs.dataSync(), testingTargets.dataSync());

            //tentukan timesteps pada shape dalam data tensor testing set
            let inputTestingSteps = testingInputs.size / batchTesting.inputs;
            let targetTestingSteps = testingTargets.size / batchTesting.targets;

            //diubah ulang shape pada data tensor testing set yang sebelumnya 2d menjadi 3d
            let xTesting = testingInputs.reshape([batchTesting.inputs, inputTestingSteps, 1]);
            let yTesting = testingTargets.reshape([batchTesting.targets, targetTestingSteps, 1]);

            console.log('numTensors (in tidy): ' + tf.memory().numTensors);
            
            return {
                xTraining,
                yTraining,
                xTesting,
                yTesting
            };
        });

        console.log('numTensors (outside tidy): ' + tf.memory().numTensors);

        const shuffle = true;

        //untuk proses kompilasi gunakan optimizer adam dan loss yaitu root_mean_squared_error yang sudah dibuat sendiri sebelumnya
        model.compile({
            optimizer: tf.train.adam(0.0001),
            loss: root_mean_squared_error
        });

        console.log('numbytes before : ' + tf.memory().numBytes);
        console.log(tf.memory());
        
        //untuk menampilkan spesifikasi model yang sudah ditentukan sebelumnya
        model.summary();

        let lossTrainError = [], lossTestError = [], quantityEpochs = [];

        //sebelum memulai pelatihan model gunakan tf.engine().startScope() sebagai awalan pembungkus
        tf.engine().startScope() 

        //data.xTraining sebagai inputs
        //data.yTraining sebagai targets
        
        //mulai pelatihan model
        await model.fit(data.yTraining, data.xTraining, {
            epochs, 
            shuffle,
            validationData: [data.yTraining, data.xTraining], 
            callbacks: [
                tf.callbacks.earlyStopping({ monitor: 'val_loss' }),
                new tf.CustomCallback({
                    onEpochEnd: async (epoch, log) => { 
                        lossTrainError.push(log.loss);
                        lossTestError.push(log.val_loss);
                        quantityEpochs.push(epoch); 
                        this.setState({ listTrainingError:[...this.state.listTrainingError, log] });
                    }
                })
            ]
        });

        //model yang sudah dilatihan disimpan pada indexxeddb di browser
        await model.save('indexeddb://trained-model-1');

        //gunakan tf.engine().endscope() untuk sebagai penutup dari pembungkus
        tf.engine().endScope();

        console.log('numbytes after : ' + tf.memory().numBytes);
        console.log(tf.memory());

        //prediksi pada model menggunakan data testing        
        const outps = model.predict(data.yTesting);

        //denormalisasi training set dan testing set
        const unNormActTrain = data.yTraining.mul(targetMax.sub(targetMin)).add(targetMin);
        const unNormPredsTest = data.yTesting.mul(targetMax.sub(targetMin)).add(targetMin);
        const unNormPreds = outps.mul(targetMax.sub(targetMin)).add(targetMin);

        //gabungkan tanggal atau inputs testing set dengan harga atau targets hasil prediksi
        const mergePredictedAndDate = dataset.slice(Math.round(dataset.length * quantityTrainSet / 100), dataset.length).map((value, i) => {
            return {
                x : value[Object.keys(value)[0]],
                y : unNormPreds.dataSync()[i]
            }
        });

        //gabungkan tanggal atau inputs testing set dengan harga atau targets aktual
        const mergeActTestAndDate = dataset.slice(Math.round(dataset.length * quantityTrainSet / 100), dataset.length).map((value, i) => {
            return {
                x : value[Object.keys(value)[0]],
                y : unNormPredsTest.dataSync()[i]
            }
        });

        //gabungkan harga aktual dan hasil prediksi untuk ditampilkan sebagai perbandingan data aktual dan prediksi pada tabel
        let mergeActualAndPredicted = dataset.slice(Math.round(dataset.length * quantityTrainSet / 100), dataset.length).map((value, i) => {
            return {
                x : value[Object.keys(value)[0]],
                y : value[Object.keys(value)[1]],
                z : unNormPreds.dataSync()[i]
            };  
        });

        //simpan mergeActualAndPredicted pada state
        this.setState({     
            mergeActualAndPredicted: mergeActualAndPredicted
        });

        let resultTrainVar = this.state.resultTrain;
        let lossErrorVar = this.state.lossError; 

        //untuk tampilan pada grafik
        lossErrorVar.labels = quantityEpochs;
        lossErrorVar.datasets[0].data = lossTrainError;
        lossErrorVar.datasets[1].data = lossTestError;
        resultTrainVar.labels = dataset.slice(0, targets.length).map(d => d[Object.keys(d)[0]]);
        resultTrainVar.datasets[0].data = unNormActTrain.dataSync();
        resultTrainVar.datasets[1].data = mergePredictedAndDate;
        resultTrainVar.datasets[2].data = mergeActTestAndDate;

        this.setState({ loadGraphic:false, lossErrorVar, resultTrainVar });
    }


    async componentDidMount(){

        //keluar beberapa nilai yang disimpan sebelumnya pada redux 
        const {dataset, tensorActualData, parameter } = store.getState();
        
        //mulai penggunaan model yang disimpan sebelumnya pada indexxeddb
        const loadedModel = await tf.loadLayersModel('indexeddb://my-model-1');

        //mulai jalankan fungsi trainModel untuk melakukan pelatihan model
        await this.trainModel(dataset, tensorActualData, parameter, loadedModel);

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
                        </div>
                </div>
                <div className="relative">
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
                    <div className={`w-9/12 mx-auto my-6 ${this.state.loadGraphic ? `bg-white opacity-20` : null}`}>
                        <p className="text-gray-900 text-center font-semibold text-lg">Tabel Perbandingan data aktual dan data prediksi</p>
                        <Table 
                            leftHeader={'Tanggal'}
                            centerHeader={'Harga Aktual'}
                            rightHeader={'Harga Prediksi'}
                            arrMergeNormalized={this.state.mergeActualAndPredicted}
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
                </div>
            </div>
        );
    }
}

export default withRouter(Evaluation);