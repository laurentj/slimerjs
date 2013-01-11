var webpage = require("webpage").create();
var url = "http://testapp.local/";

webpage.open(url, function(success){
    console.log(webpage.plainText);

    //console.log(webpage.content);

    webpage.close();
    console.log('\n------------------- END of tests\n');
    phantom.exit()
})