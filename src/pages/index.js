import React from 'react';
import * as XLSX from 'xlsx';
import {withRouter} from 'react-router-dom';
import store,{SET_QUANTITY} from './../utils/store.js';

class Index extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            file: null,
            dataset: null
        }
    }

    processData = dataString => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[1].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
        
        const list = [];
        for (let i = 2; i < dataStringLines.length; i++) {
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
        
        this.setState({ file:e.target.files[0] })
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

    render(){
        return (
            <div className="flex justify-center text-gray-900 bg-gray-100 min-h-screen">
                <div className="self-center flex justify-center border border-gray-400 rounded-md p-6 flex-col bg-white">
                    <p className="py-4 font-semibold text-lg">Silahkan upload dataset dengan ekstensi .csv atau .xlsx</p>
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
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => {
                                store.dispatch({ type:SET_QUANTITY,payload:this.state.dataset })
                                this.props.history.push('/dashboard')
                            }}
                            className="flex bg-blue-500 h-12 px-2 rounded-md text-gray-200 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-40 focus:outline-none transition duration-300 ease-in-out"
                        >
                            <span className="self-center">Upload Data</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Index)