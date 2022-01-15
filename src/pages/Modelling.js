import React from 'react';
import store, { SET_ADD_PARAMETER } from './../utils/store.js';
import {vanillaModel, BiLSTMModel, stackedModel} from './../utils/model.js';

export default class Modelling extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            memoryCells: 8,
            hiddenLayers: 1,
            epochs: 10,
            learningRate: 0.001,
            typeModel: 'vanillaLstm',
            model: null
        }
    }

    handleProcess = async () => {
        store.dispatch({ 
            type: SET_ADD_PARAMETER,
            payload: {
                memoryCells: Number(this.state.memoryCells),
                learningRate: Number(this.state.learningRate),
                epochs: Number(this.state.epochs),
                model: this.state.typeModel
            }
        });

        if(this.state.typeModel === 'vanillaLstm'){
            const model = vanillaModel();
            const saved = await model.save('localstorage://my-model-1');
        }

        if(this.state.typeModel === 'stackedLstm'){
            const model = stackedModel();
            const saved = await model.save('localstorage://my-model-1');
        }

        if(this.state.typeModel === 'BiLstm'){
            const model = BiLSTMModel();
            const saved = await model.save('localstorage://my-model-1');
        }

        this.props.history.push('/dashboard/evaluation');
    }

    // componentDidMount(){
    //     if(this.state.typeModel === 'stackedLstm'){
    //         this.setState({ model: stackedModel });
    //     }
    //     else if(this.state.typeModel === 'BiLstm'){
    //         this.setState({ model: BiLSTMModel });
    //     }
    //     else{
    //         this.setState({ model: vanillaModel })
    //     }
    // }

    render(){
        return (
            <div className="flex justify-center py-6">
                <div className="flex flex-col w-full px-6">
                    <div className="mt-4">
                        <label className="block font-semibold">Model LSTM : </label>
                        <select 
                            className="block w-full font-semibold rounded-md border-2 border-black" 
                            onChange={({ target: { value } }) => this.setState({ typeModel:value })} 
                            value={this.state.typeModel}
                        >
                            <option value='vanillaLstm'>Vanilla LSTM</option>
                            <option value='stackedLstm'>Stack LSTM</option>
                            <option value='BiLstm'>Bidirectional LSTM</option>
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="block font-semibold">Memory Cells : </label>
                        <select 
                            className="block w-full font-semibold rounded-md border-2 border-black" 
                            onChange={({ target: { value } }) => this.setState({ memoryCells:value })} 
                            value={this.state.memoryCells}
                        >
                            {[8,16,32,64,128,256,512,1024].map(x => {
                                return (
                                    <option value={x}>{x}</option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="block font-semibold">Learning Rate : </label>
                        <input
                            type="number"
                            className="border-2 border-black w-full font-semibold rounded-md"  
                            onChange={({ target: { value } }) => this.setState({ learningRate:value })}
                            value={this.state.learningRate}
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block font-semibold">Epochs : </label>
                        <input
                            type="number"
                            className="border-2 border-black w-full font-semibold rounded-md"  
                            onChange={({ target: { value } }) => this.setState({ epochs:value })}
                            value={this.state.epochs}
                        />
                    </div>
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={() => this.props.history.push('/dashboard/preparation')}
                            className="flex bg-gray-200 h-12 px-2 mx-1 rounded-md text-gray-900 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-20 active:bg-gray-200 h-12 focus:outline-none transition duration-300 ease-in-out"
                        >
                            <span className="self-center">Kembali</span>
                        </button>
                        <button
                            onClick={this.handleProcess}
                            className="flex bg-blue-500 h-12 px-2 mx-1 rounded-md text-gray-200 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 h-12 focus:outline-none transition duration-300 ease-in-out"
                        >
                            <span className="self-center">Proses</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}