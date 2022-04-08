import React from 'react';
import * as XLSX from 'xlsx';
import {withRouter} from 'react-router-dom';
import store,{ SET_ADD_PARAMETER, SET_DATASET } from './../utils/store.js';
import {searchHeadersTable} from './../utils/helpers';
import { saveAs } from 'file-saver';

class ParameterCard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            file: null,
            dataset: null,
            alertFile: false,
            hiddenLayersUnit: 128,
            epochs: 10,
            quantityTrainSet: 50,
            numberUnitOption: [8,16,32,64,128,256,512,1024],
        }
        this.baseState = this.state;
    }

    //lakukan proses data hasil konversi
    processData = dataString => {
        
        const dataStringLines = dataString.split(/\r\n|\n/);
        const stringHeader = searchHeadersTable(dataStringLines)[0];
        const headers = stringHeader.split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

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
        
                // buang baris kosong
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }
            }
        }

        this.setState({ dataset:list })
    }

    //memulai proses upload file
    handleFileUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        this.setState({ file:e.target.files[0], alertFile:false });
        
        //mulai lakukan penguraian data pada file
        reader.onload = (evt) => {
            //urai data
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr,{ type:'binary' })

            //ambil worksheet pertama
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            
            //konversi array
            const data = XLSX.utils.sheet_to_csv(ws, { header:1 });

            this.processData(data);
        }
        
        reader.readAsBinaryString(file)
    }

    componentDidMount(){                      
        //penyimpanan dataset yang sudah diolah pada redux sebagai tempat penyimpanan memori untuk ditampilkan
        store.dispatch({ type: SET_DATASET, payload: this.state.dataset });
    }

    //untuk mendownload contoh dataset
    downloadDataset = () => {
        saveAs(`${process.env.PUBLIC_URL}/harga cabai rawit kota bandung 2017 - 2021.xls`, 'harga cabai rawit kota bandung 2017 - 2021.xls');
    }

    render(){
        return (
            <div className="w-3/12 h-1/2 mt-6 ml-4 border border-gray-400 rounded-lg p-6 text-gray-900">
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
                    <select 
                        className="block w-full font-semibold rounded-md outline-none focus:outline-none border-2 border-gray-400" 
                        onChange={({ target: { value } }) => this.setState({ quantityTrainSet:value })} value={this.state.quantityTrainSet}
                    >
                        <option value="50">50%</option>
                        <option value="60">60%</option>
                        <option value="70">70%</option>
                        <option value="80">80%</option>
                        <option value="90">90%</option>
                    </select>
                </div>
                <div className="my-4">
                    <button
                        onClick={this.downloadDataset}
                        className="outline-none focus:outline-none text-xs hover:underline hover:text-blue-400"
                    >
                        Download contoh dataset
                    </button>
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={() => this.setState(this.baseState)}
                        className="flex bg-gray-200 h-12 px-2 rounded-md text-gray-900 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-20 active:bg-gray-200 h-12 focus:outline-none transition duration-300 ease-in-out"
                    >
                        <span className="self-center">Reset</span>
                    </button>
                    <button
                        onClick={() => {
                            //bila berada pada halaman dashboard lakukan proses pengolahan data
                            if(window.location.pathname === '/dashboard'){
                                //komparasi training dataset disimpan ke redux
                                store.dispatch({ 
                                    type: SET_ADD_PARAMETER,
                                    payload: {
                                        quantityTrainSet: Number(this.state.quantityTrainSet),
                                    }
                                });

                                //dataset juga di simpan ke redux
                                store.dispatch({ type: SET_DATASET, payload: this.state.dataset })

                                //bila dataset sudah masukan lakukan pengoperan ke halaman persiapan data
                                if (this.state.file){
                                    this.setState({ addFile:false })
                                    this.props.history.push('/dashboard/preparation')
                                }
                                else{
                                    this.setState({ alertFile:true })
                                }
                            }
                            else{
                                //bila berada dihalaman lain maka tombol click ini akan menuju dashboard
                                this.props.history.push('/dashboard');
                                window.location.reload();
                            }
                        }}
                        className="flex bg-blue-500 h-12 px-2 rounded-md text-gray-200 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-20 active:bg-blue-500 h-12 focus:outline-none transition duration-300 ease-in-out"
                    >
                        <span className="self-center">{window.location.pathname !== '/dashboard' ? 'Ulangi' : 'Mulai'}</span>
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(ParameterCard);