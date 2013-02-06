
function assertExists(arg, title) {
    if (arg) {
        console.log(title+"\tOK");
    }
    else
        console.log(title+"\t\t-----> FAIL!!!");
}

function assertEquals(expected, result, title) {
    if (expected == result) {
        console.log(title+"\tOK");
    }
    else{
        console.log(title+"\t\t-----> FAIL!!! given result: "+result+"");
    }
}
function assertNotEquals(expected, result, title) {
    if (expected != result) {
        console.log(title+"\tOK");
    }
    else{
        console.log(title+"\t\t-----> FAIL!!! given result: "+result);
    }
}



var webserver = require("webserver").create();
var service = webserver.listen(8082, function(request, response) {
    response.statusCode = 200;
    response.write('<html><head><title>Inject test</title></head>');
    response.write('<body><p id="test">example</p></body></html>');
    response.close();
});

var fs = require("fs");
var webpage = require("webpage").create();
var url = "http://127.0.0.1:8082/";
console.log(webpage.libraryPath)
webpage.libraryPath += '/wwwfile';
setTimeout(function(){ // wait after the webserver init process
    
    webpage.open(url, function(success){
        webpage.injectJs('inject.js');
        assertEquals("foo", webpage.evaluate(function(){
                    return document.getElementById("test").getAttribute('class');
                }), "retrieve change");        
        webpage.close();
        webserver.close();
        console.log('\n------------------- END of tests\n');
        // Why exit, how will you see results?
        //phantom.exit()
    })
},100);
