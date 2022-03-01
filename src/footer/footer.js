import React from 'react';
import { withRouter } from 'react-router-dom';

class Footer extends React.Component{
    constructor(props){
        super(props)       
        this.state = {
            showUserDropdown : false,
        }    
    }

    render(){
        return (
            <div className="flex justify-center w-full bg-blue-400 py-8 px-4">
                <div className="text-center font-semibold text-sm text-white items-center">
                    Copyright &copy; 2022 Tugas akhir, All rights reserved
                    <br />
                    Design by Nogi Ragil Triwardana
                </div>
            </div>
        );
    }
}

export default withRouter(Footer);