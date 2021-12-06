import React from 'react';
import * as XLSX from 'xlsx';
import {withRouter} from 'react-router-dom';
import store,{SET_PARAMETER, SET_QUANTITY} from './../utils/store.js';
import {searchHeadersTable} from './../utils/helpers';

class ParameterCard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            file: null,
            dataset: null,
            alertFile: false,
            hiddenLayersUnit: 128,
            hiddenLayers: 1,
            epochs: 10,
            learningRate: 0.001,
            quantityTrainSet: 50,
            numberUnitOption: [8,16,32,64,128,256,512,1024],
        }
        this.baseState = this.state;
    }

    processData = dataString => {
        const dataStringLines = dataString.split(/\r\n|\n/);
       // const filteredObjectValue = dataStringLines.filter(x => console.log(Object.values(x)[0])/*Object.values(x)[0].match(/^[a-z]/) && Object.values(x)[1].match(/^[a-z]/)*/);
        const stringHeader = searchHeadersTable(dataStringLines)[0];
        const headers = stringHeader.split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

        //console.log(dataStringLines.filter(x => x.match(/[a-zA-Z]/)));
        const list = [];
        for (let i = 1; i < dataStringLines.length; i++) {
            const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
            if (headers && row.length === headers.length) {
                const obj = {};
                for (let j = 0; j < headers.length; j++) {
                    let d = row[j];
                    if (d.length > 0) {
                        if (d[0] === '"')
                        d = d.substring(1, d.length - 1);
                        if (d[d.length - 1] === '"')
                        d = d.substring(d.length - 2, 1);
                    }
                    if (headers[j]) {
                        obj[headers[j]] = d;
                    }
                }
        
                // remove the blank rows
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }
            }
        }

        this.setState({ dataset:list })
    }

    handleFileUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        this.setState({ file:e.target.files[0],alertFile:false });
        reader.onload = (evt) => {
            //parse data
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr,{ type:'binary' })

            //get first worksheet
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            
            //convert array of arrays
            const data = XLSX.utils.sheet_to_csv(ws, { header:1 });
            this.processData(data);
        }
        
        reader.readAsBinaryString(file)
    }

    componentDidMount(){
        store.dispatch({ 
            type: SET_PARAMETER,
            payload: {
                hiddenLayersUnit: Number(this.state.hiddenLayersUnit),
                learningRate: Number(this.state.learningRate),
                hiddenLayers: Number(this.state.hiddenLayers),
                epochs: Number(this.state.epochs),
                quantityTrainSet: Number(this.state.quantityTrainSet),
            }
        });
        store.dispatch({ type: SET_QUANTITY, payload: this.state.dataset });
    }

    render(){
        return (
            <div className="w-3/12 h-1/2 mt-6 ml-4 border border-black rounded-lg p-6 text-gray-900">
                <div className="flex flex-nowrap border border-gray-400 rounded-xl p-2">
                    <div className="flex-shrink p-2 rounded-md shadow-md bg-gray-200 hover:bg-gray-300 cursor-pointer text-center w-12 h-10 transition duration-300 ease-in-out">
                        <label for="files" className="cursor-pointer">File</label>
                        <input
                            className="hidden rounded-md"
                            type="file"
                            id="files"
                            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            onChange={e => this.handleFileUpload(e)}
                        />
                    </div>
                    <div className="flex flex-auto justify-start ml-2">
                        <p className="self-center">{this.state.file ? this.state.file.name : 'Silahkan diupload'}</p>
                    </div>
                </div>
                {this.state.alertFile ? <p className="text-red-600 text-sm">Anda belum memasukan dataset</p> : null}
                <p className="font-semibold">Jumlah Sampel Data : {this.state.dataset ? this.state.dataset.length : null}</p>
                <div className="mt-4">
                    <label className="block font-semibold">Training Dataset : </label>
                    <select className="block w-full font-semibold rounded-md border-2 border-black" onChange={({ target: { value } }) => this.setState({ quantityTrainSet:value })} value={this.state.quantityTrainSet}>
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
                                    quantityTrainSet: Number(this.state.quantityTrainSet),
                                }
                            });
                            store.dispatch({ type: SET_QUANTITY, payload: this.state.dataset })

                            if (this.state.file){
                                this.setState({ addFile:false })
                                this.props.history.push('/dashboard/preparation')
                            }
                            else{
                                this.setState({ alertFile:true })
                            }
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