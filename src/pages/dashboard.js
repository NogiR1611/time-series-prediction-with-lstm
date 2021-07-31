import React from 'react';
import {Switch,Route,Link} from 'react-router-dom';
import ParameterCard from './../cards/ParameterCard.js';
import RestrictedRoute from './../utils/restrictedRoute.js';

//import component
import Normalization from './normalization.js';
import Training from './training.js';
import Testing from './testing.js';
import Denormalization from './denormalization.js';
import Result from './result.js';

export default class Dashboard extends React.Component{
    render(){
        return (
            <div className="flex flex-nowrap">
                <ParameterCard />
                <div className="min-h-screen w-8/12 mx-2">
                    <ul className=" w-full bg-blue-400 mt-6 text-gray-100 font-semibold rounded-t-lg flex justify-center ml-4 overflow-hidden">
                        <li className="mx-1">
                            <Link
                                className={"inline-block px-6 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/normalisasi') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent") }
                                to='/dashboard/normalisasi'
                            >
                                Normalisasi Data
                            </Link>
                        </li>
                        <li className="mx-1">
                            <Link
                                to='/dashboard/pelatihan'
                                className={"inline-block px-6 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/pelatihan') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent")}
                            >
                                Proses Training
                            </Link>
                        </li>
                        <li className="mx-1">
                            <Link
                                to='/dashboard/pengujian'
                                className={"inline-block px-6 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/pengujian') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent")}
                            >
                                Proses Testing
                            </Link>
                        </li>
                        <li className="mx-1">
                            <Link
                                to='/dashboard/denormalisasi' 
                                className={"inline-block px-6 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/denormalisasi') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent")}
                            >
                                Denormalisasi Data
                            </Link>
                        </li>
                        <li className="mx-1">
                            <Link
                                to='/dashboard/hasil' 
                                className={"inline-block px-6 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/hasil') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent")}
                            >
                                Hasil Prediksi
                            </Link>
                        </li>
                    </ul>
                    <div className="w-full h-auto min-h-96 ml-4 mb-8 border-r border-b border-l border-gray-400">
                        <Switch>
                            <RestrictedRoute path={`${this.props.match.path}/normalisasi`} component={Normalization} />
                            <RestrictedRoute path={`${this.props.match.path}/pelatihan`} component={Training} />
                            <RestrictedRoute path={`${this.props.match.path}/pengujian`} component={Testing} />
                            <RestrictedRoute path={`${this.props.match.path}/denormalisasi`} component={Denormalization} />
                            <RestrictedRoute path={`${this.props.match.path}/hasil`} component={Result} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}