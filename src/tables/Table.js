import React from 'react';

export default class Table extends React.Component{
    constructor(props){
        super(props);
    }

    // componentDidMount(){
    //     console.log(this.props.leftRow);
    //     console.log(this.props.rightRow);

    //     if(this.props.leftRow && this.props.rightRow){

    //         let arrMerge = this.props.leftRow.map((x, i) => {
    //             return {
    //                 x : x,
    //                 y : this.props.rightRow[i]
    //             }
    //         })

    //         this.setState({ arrMergeNormalized: arrMerge });
    //     }

    //     console.log(this.state.arrMergeNormalized);
    // }

    render(){
        return (
            <div className="w-9/12 mx-auto my-4">
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
                                        {this.props.centerHeader}
                                    </th>
                                    <th className="border-2 border-gray-500 bg-gray-200 font-bold text-gray-700 px-2 text-center">
                                        {this.props.rightHeader}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.arrMergeNormalized && this.props.arrMergeNormalized.map((el, i) => (
                                    <tr>
                                        <td className="border-2 border-gray-400 bg-transparent font-medium text-gray-700 px-2 text-left">
                                            {el.x}
                                        </td>
                                        <td className="border-2 border-gray-400 bg-transparent font-medium text-gray-700 px-2 text-left">
                                            {el.y}
                                        </td>
                                        <td className="border-2 border-gray-400 bg-transparent font-medium text-gray-700 px-2 text-left">
                                            {el.z}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

Table.defaultProps = {
    arrMergeNormalized: null,
    leftHeader: '',
    centerHeader: '',
    rightHeader: ''
}