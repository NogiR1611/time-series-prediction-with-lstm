import React from 'react';
import AlertCard from './../cards/AlertCard.js';
import Cookies from 'js-cookie';
import {ReactComponent as Spinner} from './../assets/icon/Spinner.svg';
import {withRouter} from 'react-router-dom';
import {address} from './../utils/address.js';
import store,{SET_USER} from './../utils/store.js';

class Login extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            username: '',
            password: '',
            isLoading: false,
            message: null,
            isAlert: false
        }
    } 

    //melakukan request login
    requestLogin = async () => {
        try{
            
            this.setState({ isLoading:true })

            //kirim data akun ke server untuk pengecekan
            const response = await address.post('/users/login',{
                username : this.state.username,
                password: this.state.password
            })
            
            //bila akun login sesuai dengan data di server
            const { api_token } = response.data.data;
            const { username } = response.data.data;

            //pasang key pada cookies dengan nama 'user' dan value dari parameter username selama 7 hari masa kadaluwarsa
            Cookies.set('user', username, {
                expires: 7,
            });

            //pasang key pada cookies dengan nama 'token' dan value dari parameter api_token selama 7 hari masa kadaluwarsa
            Cookies.set('token', api_token, {
                expires: 7,
            });
    
            //store.dispatch({ type:SET_USER, payload:infoUser });
            this.props.history.push('/dashboard');
        }
        catch(e){
            //bila ada error diberitahu kepada user
            if(e.response && e.response.data){
                this.setState({ message:e.response.data.message, isAlert:true })
            }
        }
        finally{
            this.setState({ isLoading:false })
        }
    }

    //sebelum pengecekan request lakukan validasi terlebih dahulu
    validation = () => {
        if(!this.state.username || !this.state.password){
            this.setState({ message:'Mohon isi username dan password anda',isAlert:true })
        }
        else{
            this.requestLogin();
        }
    }

    componentDidMount(){
        let api_token = Cookies.get('token');

        if(api_token){
            this.props.history.push('/dashboard');
        }
    }

    render(){
        return (
            <div className="flex justify-center text-gray-900 bg-gray-100 min-h-screen">
                <div className="self-center flex justify-center border border-gray-800 rounded-md p-6 flex-col bg-white">
                    <p className="py-4 font-semibold text-lg">Silahkan login dengan akun anda</p>
                    <div className="flex flex-col border border-gray-400 rounded-xl p-2">
                        {this.state.isAlert ? 
                        (<AlertCard 
                            message={this.state.message}
                        />) : null}
                        <div>
                            <label className="block my-2">Username : </label>
                            <input className="w-full block border border-gray-400 rounded outline-none" type="text" value={this.state.username} onChange={({ target: { value } }) => this.setState({ username: value })} />
                        </div>
                        <div>
                            <label className="block my-2">Password : </label>
                            <input className="w-full block border border-gray-400 rounded outline-none" type="password" value={this.state.password} onChange={({ target: { value } }) => this.setState({ password : value })} />
                        </div>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={() => this.validation()}
                            className="flex justify-center bg-blue-500 h-12 w-16 px-2 rounded-md text-gray-200 font-semibold shadow-md hover:bg-opacity-70 active:bg-opacity-40 focus:outline-none transition duration-300 ease-in-out"
                        >
                            <span className="self-center">
                                {this.state.isLoading ? <Spinner className="h-8 w-8" /> : 'Login'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Login)