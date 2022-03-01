import React from 'react';

export default class NormalizationTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            arrMergeNormalized : []
        }
    }

    componentDidMount(){
        if(this.props.afterNormalizedData){
            let arrBeforeNormalized = this.props.beforeNormalizedData.map((el, i) => {
                    return {...el, normalized: this.props.afterNormalizedData[i] }
                });
            
            this.setState({ arrMergeNormalized : arrBeforeNormalized })
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.afterNormalizedData !== this.props.afterNormalizedData){
            let arrBeforeNormalized = this.props.beforeNormalizedData.map((el, i) => {
                return {...el, normalized: this.props.afterNormalizedData[i] }
            });
            
            this.setState({ arrMergeNormalized : arrBeforeNormalized })
        }
        else{
            //
        }
    }

    render(){
        return (
            <div className="w-5/12 mx-6 my-4">
                <div className="flex justify-center border-t border-l border-r border-gray-500 rounded-t-lg py-2">
                    <p className="text-gray-900 font-semibold">{this.props.title}</p>
                </div>
                <div
                    className="flex flex-col border border-gray-500 pt-4 min-h-96"
                >
                    <div className="flex flex-wrap justify-center overflow-auto h-96">
                        <table>
                            <thead>
                                <tr>
                                    <th className="border-2 border-gray-500 bg-gray-200 font-bold text-gray-700 px-2 text-center">
                                        {this.props.leftHeader}
                                    </th>
                                    <th className="border-2 border-gray-500 bg-gray-200 font-bold text-gray-700 px-2 text-center">
                                        {this.props.rightHeader}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.arrMergeNormalized.map((el, i) => (
                                    <tr>
                                        <td className="border-2 border-gray-400 bg-transparent font-medium text-gray-700 px-2 text-left">
                                            {el[this.props.propertyData]}
                                        </td>
                                        <td className="border-2 border-gray-400 bg-transparent font-medium text-gray-700 px-2 text-left">
                                            {el["normalized"]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* <div className="w-5/12 mx-1 text-center font-medium">
                            <p>Sebelum : </p>
                        </div>
                        <div className="w-5/12 mx-1 text-center font-medium">
                            <p>Sesudah : </p>
                        </div> */}
                    </div>
                    <div className="flex flex-wrap justify-center">
                        {/* <div
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
                        </div> */}
                    </div>
                    <div className="flex justify-start pt-2 px-4 pb-4">
                        <p className="text-gray-900 font-semibold">Jumlah : {this.props.beforeNormalizedData.length}</p>
                    </div>
                </div>
            </div>
        );
    }
}

NormalizationTable.defaultProps = {
    leftHeader: 'Sebelum',
    rightHeader: 'Sesudah'
};