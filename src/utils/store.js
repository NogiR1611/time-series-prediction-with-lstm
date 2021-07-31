import {createStore} from 'redux';

const initialState = {
    dataset: null,
    parameter: null,
    tensorData: null,
    trainInputsData: null,
    trainLabelsData: null,
}

export const SET_QUANTITY = 'set_quantity';
export const SET_PARAMETER = 'set_parameter';
export const SET_TENSOR_DATA = 'set_tensor_data';
export const SET_TRAIN_INPUTS_DATA = 'set_train_inputs_data';
export const SET_TRAIN_LABELS_DATA = 'set_train_labels_data';

export default createStore((state = initialState, { type,payload }) => {
    if(type === SET_QUANTITY){
        state.dataset = payload
    }

    if(type === SET_PARAMETER){
        state.parameter = payload
    }

    if(type === SET_TRAIN_INPUTS_DATA){
        state.trainInputsData = payload
    }

    if(type === SET_TRAIN_LABELS_DATA){
        state.trainLabelsData = payload
    }

    if(type === SET_TENSOR_DATA){
        state.tensorData = payload
    }

    return state;
})