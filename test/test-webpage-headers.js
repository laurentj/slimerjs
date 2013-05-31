
describe("WebPage", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/getHeaders";

    it("can set headers",function() {
        var loaded = false;

        webpage.customHeaders = {
            "X-foo": "bar",
        }

        webpage.settings.userAgent = "Super Browser / 1.0"
        // load the page that will returns received headers
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            var headers = JSON.parse(webpage.content)
            expect(headers['user-agent']).toEqual("Super Browser / 1.0");
            expect(headers['x-foo']).toEqual("bar");
        });
    });
});

