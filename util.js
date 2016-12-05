function getMinMax(json, key) {
    var out = [];
    items = Object.keys(json);
    items.forEach(function(item) { 
        return out.push(json[item][key]); 
    }, []);
    return { min: Math.min.apply(null, out), max: Math.max.apply(null, out) };
}

function arrayToMinMax(array) {
    return array[0] < array[1] ? {min : array[0], max: array[1]} : {min : array[1], max: array[0]} 
}