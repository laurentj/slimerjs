
var webpage = require("webpage").create();
var url = "http://testapp.local/";

webpage.onLoadStarted = function(targetUrl) {
    console.log("\t--->onLoadStarted");
};


webpage.onUrlChanged = function(targetUrl) {
    console.log("\t--->onUrlChanged "+targetUrl);

};

webpage.onInitialized = function(targetUrl) {
    console.log("\t--->onInitialized");

};


webpage.onResourceRequested = function(request) {
    console.log('\t--->onResourceRequested  (#' + request.id + '): ' + JSON.stringify(request));

};
webpage.onResourceReceived = function(response) {
    //console.log('\t--->onResourceReceived (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));

};



webpage.onLoadFinished = function(targetUrl) {
    console.log("\t--->onLoadFinished");

};

webpage.open(url, function(success){
    webpage.close();
    console.log('\n------------------- END of tests\n');
    phantom.exit()
})