/*
 * Web server which takes screenshots of other pages.
 * 
 * To use this web server, you can point your browser at
 * http://localhost:9005/
 * 
 * Alternatively, and more usefully, you can have some other app (e.g.
 * a web app) send requests to 
 * http://localhost:9005/screenshot?url=<some url>
 * 
 * The response should be a JPG image.
 * 
 * This script demonstrates the webpage.renderBytes API.
 */

var webserver = require("webserver");
var webpage = require("webpage");

function handle_root_request(request, response) {
    /*
     * Serve a minimal html form for the root page.
     */
    response.status=200;
    response.headers['Content-type'] = 'text/html';
    response.write("<!DOCTYPE html>" +
"<head><title>Screenshot API</title></head>" +
"<body>" +
"<form action=/screenshot method=GET> " +
"URL:<input type='text' name='url' size=50> " +
" <input type=submit>");
    response.close();
}

function init_page(page) {
    // Use this function to set all your favourite settings
    // on the webpage objects.
    // We could also install event handlers here.
    page.settings.userAgent = 'Super Screenshot server';
    var w = 1200;
    var h = 800;
    page.viewportSize = { width: w, height: h };
    page.clipRect = { top:0, left: 0, width:w, height:h };
}

function make_screenshot(request, response, targetUrl) {
    var page = webpage.create();
    init_page(page);
    page.open(targetUrl, function(status) {
        if (status != "success") {
            // Fail
            response.statusCode = 500;
            response.write("SOMETHING FAILED - SORRY");
            response.close();
        }
        // Render into a byte array:
        var bytes = page.renderBytes(
            {"format":"jpg"} 
            );
        // Set response status and headers etc:
        response.statusCode = 200;
        response.headers["Content-Type"] = "image/jpeg";
        // This is important: to avoid text conversion etc.
        response.setEncoding("binary");
        // Write bytes to the connection.
        response.write(bytes);
        response.close();
        // Close the page to free resources.
        page.close();
    });
}

function handle_request(request, response) {
    if (request.url == "/") {
        return handle_root_request(request, response);
    }
    
    var i = request.url.indexOf("url=");
    if (i != -1) {
        // Parse url.
        var targetUrl = request.url.substring(i + 4);
        // decode any special chars etc.
        targetUrl = decodeURIComponent(targetUrl);
        return make_screenshot(request, response, targetUrl);
    }
    
    response.statusCode = 404;
    response.write("NOT FOUND");
    response.close();
}

function main() {
    var port = 9005;
    var svr = webserver.create();
    svr.listen(port, handle_request);
}

main();
