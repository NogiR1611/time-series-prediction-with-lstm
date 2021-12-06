import React from 'react';
import Cookies from 'js-cookie';
import {withRouter} from 'react-router-dom';
import {ReactComponent as Avatar} from '../assets/icon/avatar.svg';
import {ReactComponent as Arrow} from '../assets/icon/arrow.svg';
import store from './../utils/store.js';

class Header extends React.Component{
    constructor(props){
        super(props)       
        this.state = {
            showUserDropdown : false,
        }    
    }

    logout = () => {
        Cookies.remove('api_token');
        this.props.history.push('/')
    }

    render(){
        return (
            <div className="flex justify-end w-full bg-blue-400 h-16 px-4">
                <div className="p-2 rounded-full bg-blue-400 self-center">
                    <button
                        className="flex outline-none"
                        onClick={() => this.setState({ showUserDropdown: !this.state.showUserDropdown })}
                    >
                        <Avatar className={`fill-current text-white w-8 h-8 ${this.state.showUserDropdown ? 'opacity-40' : 'opacity-100'}`} />
                        <Arrow className={`fill-current text-white w-4 h-4 self-center transform ${this.state.showUserDropdown ? '-rotate-180 opacity-40' : 'rotate-0'} transition duration-500 ease-in-out`} />
                    </button>
                    <div className={`w-32 h-auto divide-y divide-gray-200 ${this.state.showUserDropdown ? 'block' : 'hidden'} -ml-24 bg-white absolute shadow-lg`}>
                        <div className="p-2">                
                            {Cookies.get('user')}
                        </div>
                        <div className="w-full block">
                            <button
                                className="p-2 w-full font-medium text-left"
                                onClick={() => this.logout()}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Header);