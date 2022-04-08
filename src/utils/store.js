import {createStore} from 'redux';

const initialState = {
    user: null,
    dataset: null,
    parameter: null,
    tensorActualData: null,
    tensorPredictedData: null,
    trainInputsData: null,
    trainLabelsData: null,
    resultTrainTest: null,
}

export const SET_USER = 'set_user';
export const SET_DATASET = 'set_dataset';
export const SET_TENSOR_ACTUAL_DATA = 'set_tensor_actual_data';
export const SET_TENSOR_PREDICTED_DATA = 'set_tensor_predicted_data';
export const SET_TRAIN_INPUTS_DATA = 'set_train_inputs_data';
export const SET_TRAIN_LABELS_DATA = 'set_train_labels_data';
export const SET_RESULT_TRAIN_TEST = 'set_result_train_test';
export const SET_ADD_PARAMETER = 'set_add_parameter';

export default createStore((state = initialState, { type, payload }) => {
    if(type === SET_USER){
        state.user = payload
    }

    if(type === SET_DATASET){
        state.dataset = payload
    }

    if(type === SET_ADD_PARAMETER){
        state.parameter = {...state.parameter,...payload}
    }

    if(type === SET_TRAIN_INPUTS_DATA){
        state.trainInputsData = payload
    }

    if(type === SET_TRAIN_LABELS_DATA){
        state.trainLabelsData = payload
    }

    if(type === SET_TENSOR_ACTUAL_DATA){
        state.tensorActualData = payload
    }

    if(type === SET_TENSOR_PREDICTED_DATA){
        state.tensorPredictedData = payload
    }

    if(type === SET_RESULT_TRAIN_TEST){
        state.resultTrainTest = payload
    }

    return state;
})