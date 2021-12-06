import React from 'react';

export default class AlertCard extends React.Component{
    render(){
        return (
            <div className={`bg-${this.props.backgroundColor}-300 text-center p-1 w-full rounded-md`}>
                <p className="text-gray-900 font-medium text-sm">{this.props.message}</p>
            </div>
        );
    }
} 

AlertCard.defaultProps = {
    backgroundColor: 'red',
    message: ''
}