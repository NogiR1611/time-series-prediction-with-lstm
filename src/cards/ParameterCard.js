import React from 'react';
import {withRouter} from 'react-router-dom';
import store,{SET_PARAMETER} from './../utils/store.js';

class ParameterCard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            memoryCells: 128,
            hiddenLayers: 1,
            epochs: 10,
            quantityTrainSet: 50,
        }
        this.baseState = this.state;
    }

    render(){
        const {dataset} = store.getState();
        return (
            <div className="w-3/12 h-1/2 mt-6 ml-4 border border-black rounded-lg p-6 text-gray-900">
                <p className="font-semibold">Jumlah Sampel Data : {dataset.length}</p>
                <div className="mt-4">
                    <label className="block font-semibold">Memory Cells : </label>
                    <select className="block w-full font-semibold rounded-md border-2 border-black" onChange={e => this.setState({ memoryCells:e.target.value })} value={this.state.memoryCells}>
                        <option value="128">128</option>
                        <option value="256">256</option>
                        <option value="512">512</option>
                        <option value="1024">1024</option>
                    </select>
                </div>
                <div className="mt-4">
                    <label className="block font-semibold">Hidden Layers : </label>
                    <input
                        type="number"
                        className="border-2 border-black w-full font-semibold rounded-md"
                        onChange={e => this.setState({ hiddenLayers:e.target.value })}
                        value={this.state.hiddenLayers} 
                    />
                </div>
                <div className="mt-4">
                    <label className="block font-semibold">Epochs : </label>
                    <input
                        type="number"
                        className="border-2 border-black w-full font-semibold rounded-md"  
                        onChange={e => this.setState({ epochs:e.target.value })}
                        value={this.state.epochs}
                    />
                </div>
                <div className="mt-4">
                    <label className="block font-semibold">Training Dataset : </label>
                    <select className="block w-full font-semibold rounded-md border-2 border-black" onChange={e => this.setState({ quantityTrainSet:e.target.value })} value={this.state.quantityTrainSet}>
                        <option value="50">50%</option>
                        <option value="60">60%</option>
                        <option value="70">70%</option>
                        <option value="80">80%</option>
                        <option value="90">90%</option>
                    </select>
                </div>
                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => this.setState(this.baseState)}
                        className="flex bg-gray-200 h-12 px-2 rounded-md text-gray-900 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-20 active:bg-gray-200 h-12 focus:outline-none transition duration-300 ease-in-out"
                    >
                        <span className="self-center">Reset</span>
                    </button>
                    <button
                        onClick={() => {
                            store.dispatch({ 
                                type: SET_PARAMETER,
                                payload: {
                                    memoryCells: this.state.memoryCells,
                                    hiddenLayers: this.state.hiddenLayers,
                                    epochs: this.state.epochs,
                                    quantityTrainSet: this.state.quantityTrainSet,
                                }
                            })
                            this.props.history.push('/dashboard/normalisasi')
                        }}
                        className="flex bg-blue-500 h-12 px-2 rounded-md text-gray-200 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 h-12 focus:outline-none transition duration-300 ease-in-out"
                    >
                        <span className="self-center">Proses</span>
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(ParameterCard);