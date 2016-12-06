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

// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
}; 

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    }
}; 

Array.prototype.removeIfExist = function(element) {
    var index = this.indexOf(element);
    if (index > -1) {
        this.splice(index, 1);
    }
}
