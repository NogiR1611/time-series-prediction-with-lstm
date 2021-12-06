import {generate_random_numbers} from './helpers';

class RNN{
    constructor(){
        this.layers = []
    }
}

export default class LSTMCell extends RNN{
    constructor(){
        super();
    }

    addNewLayers(sample){
        let min = -(1/Math.sqrt(sample.units));
        let max = 1/Math.sqrt(sample.units);

        const random_weight = generate_random_numbers(min,max);

        this.layers.push(sample);
        return this.layers + 'with weight : ' + random_weight;
    }

    getAllLayers(){
        return this.layers;
    }
}