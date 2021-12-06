import axios from 'axios';
import moment from 'moment';
import crypt from './crypt';

export const address = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

['get','post','put','patch','delete','options'].forEach(method => {
    
    const proto  = address[method];
    
    address[method] = (...args) => {

        args[0] = encodeURI(args[0]);
        const url = new URL(`http://localhost/${args[0].replace(/^\/+|\/+$/g,'')}`);

        const params = {
            requested_at: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        url.searchParams.forEach((value,key) => {
            params[key] = value;
        });

        args[0] = `${url.pathname}?signature=${crypt.encrypt(params)}`

        return proto(...args);
    }
});