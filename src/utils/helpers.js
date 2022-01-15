export const divideTensorToChunks = (x,y) => {
    let inputs,labels = 0;
    
    if(x){
        // if(x.length % 7 === 0){
        //     inputs = 7;
        // }
        // else if(x.length % 6 === 0){
        //     inputs = 6;
        // }
        // else if(x.length % 5 === 0){
        //     inputs = 5;
        // }
        // else if(x.length % 4 === 0){
        //     inputs = 4;
        // }
        if(x.length % 3 === 0){
            inputs = 3;
        }
        else if(x.length % 2 === 0){
            inputs = 2;
        }
        else{
            inputs = 1;
        }
    }

    if(y){
        // if(y.length % 7 === 0){
        //     labels = 7;
        // }
        // else if(y.length % 6 === 0){
        //     labels = 6;
        // }
        // else if(y.length % 5 === 0){
        //     labels = 5;
        // }
        // else if(y.length % 4 === 0){
        //     labels = 4;
        // }
        if(y.length % 3 === 0){
            labels = 3;
        }
        else if(y.length % 2 === 0){
            labels = 2;
        }
        else{
            labels = 1;
        }
    }

    return {
        inputs,
        labels,
    };
}

export const dataCleaning = (dataset) => {

    const inputsCleaned = dataset.map((d, i) => {
        return (Number(d[Object.keys(d)[1]].replace(/\s+|[a-zA-Z]|[^\w]/g, "")));
    });

    const labelsCleaned = dataset.map((d, i) => {
        return (Number(d[Object.keys(d)[0]].replace(/\s+|[^\w]/g, "")));
    });
    
    return {
        inputsCleaned,
        labelsCleaned
    };
}

export const root_mean_squared_error = (yPred,yTrue) => {
    return (((yTrue.sub(yPred)).square()).mean()).sqrt();
}

export const R_squared = (yPred,yTrue) => {
    return (1 - ((yTrue.sub(yPred)).div(yTrue.sub(yTrue.mean()))))
}

export const searchHeadersTable = (dataString) => {
    return dataString.filter(header => {
        let pattern = new RegExp(/[abcde..]/);
        return pattern.test(header);
    });
}

export const average = (data) => {
    let total = 0;

    for(let i=0; i < data.length; i++){
        total += data[i];
    }

    return total / data.length;
}

export const standard_deviation = (data) => {
    let total = 0;
    let averageData = average(data);

    for(let i=0; i < data.length; i++){
        total += Math.pow(data[i] - averageData,2);
    }

    return Math.sqrt(total / (data.length - 1));
}

export const generate_random_numbers = (min,max) => {
    return Math.random() * (max - min) + min;
}