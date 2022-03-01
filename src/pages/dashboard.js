import React from 'react';
import {Switch,Link} from 'react-router-dom';
import ParameterCard from './../cards/ParameterCard.js';
import RestrictedRoute from './../utils/restrictedRoute.js';

//import component
import Header from './../header/header.js';
import Footer from './../footer/footer.js';
import PreparationData from './PreparationData';
import Modelling from './Modelling.js';
import Evaluation from './Evaluation.js';

export default class Dashboard extends React.Component{
    render(){
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex flex-nowrap">
                    <ParameterCard />
                    <div className="min-h-screen w-8/12 mx-2">
                        <ul className=" w-full bg-blue-400 mt-6 text-gray-100 font-semibold rounded-t-lg flex justify-center ml-4 overflow-hidden">
                            <li className={"inline-block px-3 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/preparation') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent") }
                            >
                                Persiapan Data
                            </li>
                            <li className={"inline-block px-3 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/modelling') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent")}
                            >
                                Pemodelan
                            </li>
                            <li className={"inline-block px-3 py-2 text-gray-100 " + 
                                (window.location.href.indexOf('/dashboard/evaluation') !== -1 ? "bg-white text-gray-900 border-t-2 border-blue-400 rounded-t-lg" : "bg-transparent")}
                            >
                                Evaluasi
                            </li>
                        </ul>
                        <div className="w-full h-auto min-h-96 ml-4 mb-8 border-r border-b border-l border-gray-400">
                            <Switch>
                                <RestrictedRoute path={`${this.props.match.path}/preparation`} component={PreparationData} />
                                <RestrictedRoute path={`${this.props.match.path}/modelling`} component={Modelling} />
                                <RestrictedRoute path={`${this.props.match.path}/evaluation`} component={Evaluation} />
                            </Switch>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}