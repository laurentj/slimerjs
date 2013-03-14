

window.addEventListener("load", function(event){
    let browser = document.createElement("webpage");
    function onReady(event) {
        browser.removeEventListener("BrowserReady", onReady, false);
        if ("arguments" in window
            && window.arguments[0]
            && window.arguments[0].callback) {
            window.arguments[0].callback(browser.browser);
        }
    }
    browser.addEventListener("BrowserReady", onReady, false);
    document.documentElement.appendChild(browser);
}, true);
