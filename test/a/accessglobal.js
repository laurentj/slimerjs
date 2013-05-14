var isOk = false;
try {
    if (thisIsMyGlobalFunction)
        isOk = thisIsMyGlobalFunction();
}
catch(e){
    
}

exports.accessToGlobalFunction = isOk;