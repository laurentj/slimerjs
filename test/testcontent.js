var webpage = require("webpage").create();
var url = "http://testapp.local/";

webpage.onUrlChanged = function(targetUrl) {
    var currentUrl = webpage.evaluate(function() {
        return window.location.href;
    });
    console.log('Old URL: ' + currentUrl);
    console.log('New URL: ' + targetUrl);
};

webpage.open(url, function(success){
    //console.log(webpage.plainText);

    //console.log(webpage.content);

    webpage.close();
    console.log('\n------------------- END of tests\n');
    phantom.exit()
})