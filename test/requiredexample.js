
exports.myExample = 'foo';

exports.myCalcFunc = function (a) {
    return a+3;
}

exports.throwExcept = function(){
    throw new Error("Test onerror listener")
}
exports.throwExcept2 = function(){
    throw "An exception"
}

exports.hasWindowObject = (window != undefined);
exports.hasDocumentObject = (document != undefined);
exports.hasConsoleObject = (console != undefined);
exports.hasAlertFunction = (alert != undefined);
exports.hasConfirmFunction = (confirm != undefined);
exports.hasPhantomObject = (phantom != undefined)
