import React from 'react';
import {Line} from 'react-chartjs-2';
import store from '../utils/store.js';

export default class Testing extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            predict: null,
            lineErrorLevel:{
                labels: ['January', 'February', 'March',
                         'April', 'May'],
                datasets: [
                  {
                    label: 'RMSE',
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: [65, 59, 80, 81, 56]
                  }
                ]
            },
            DataTrain:{
                labels: ['January', 'February', 'March',
                         'April', 'May'],
                datasets: [
                  {
                    label: 'Data Prediksi',
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: [32, 44, 53, 41, 75]
                  },
                  {
                    label: 'Data Aktual',
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: [65, 59, 80, 81, 56]
                  },
                ]
            }
        }
    }

    componentDidMount(){
        console.log(store.getState().resultTrainTest);
    }

    render(){
        return (
            <div className="flex flex-col">
                <div className="w-9/12 mx-auto my-6">
                    <p className="text-gray-900 text-center font-semibold text-lg">Tingkat Error</p>
                    <Line
                        data={this.state.lineErrorLevel}
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
                    <p className="text-gray-900 text-center font-semibold text-lg">Hasil Pengujian</p>
                    <Line
                        data={this.state.DataTrain}
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
                        Denormalisasi Data
                    </button>
                </div>
            </div>
        );
    }
}