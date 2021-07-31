import React from 'react';

export default class NormalizationTable extends React.Component{
    render(){
        return (
            <div className="w-5/12 mx-6 my-4">
                <div className="flex justify-center border-t border-l border-r border-gray-500 rounded-t-lg py-2 text-gray-900 font-semibold">
                    <p>{this.props.title}</p>
                </div>
                <div
                    className="flex flex-col border border-gray-500 pt-4 min-h-96"
                >
                    <div className="flex flex-wrap justify-center">
                        <div className="w-5/12 mx-1 text-center font-medium">
                            <p>Sebelum : </p>
                        </div>
                        <div className="w-5/12 mx-1 text-center font-medium">
                            <p>Sesudah : </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center">
                        <div
                            className="border border-gray-500 w-5/12 overflow-y-auto h-80 mx-1 p-2"
                        >
                            {this.props.beforeNormalizedData && this.props.beforeNormalizedData.map(data => {
                                return (
                                    <p className="text-gray-900">{data[this.props.propertyData]}</p>
                                );
                            })}
                        </div>
                        <div
                            className="border border-gray-500 w-5/12 overflow-y-auto h-80 mx-1 p-2"
                        >
                            {this.props.afterNormalizedData && Array.from(this.props.afterNormalizedData,x => {
                                return (
                                    <span className="block text-gray-900">{x}</span>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-start pt-2 px-4 pb-4">
                        <p>Jumlah : {this.props.beforeNormalizedData.length}</p>
                    </div>
                </div>
            </div>
        );
    }
}