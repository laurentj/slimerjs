
describe("WebPage.viewportSize", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can change the size of the window",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            if (!system.os.isWindows()) {
                expect(webpage.viewportSize.width).toEqual(400);
                expect(webpage.viewportSize.height).toEqual(300);
            }
            webpage.viewportSize = { width:650, height:320 };
            var result = webpage.evaluate(function(){
                return window.innerWidth +"-"+window.innerHeight;
            })
            expect(result).toEqual("650-320");
            expect(webpage.viewportSize.width).toEqual(650);
            expect(webpage.viewportSize.height).toEqual(320);
            webpage.close();
        });
    });
});

describe("WebPage.renderBase64()", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can capture and return a base64 content",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                webpage.viewportSize = { width:300, height:210 };
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var capture = webpage.renderBase64();
            expect(typeof capture).toEqual("string");
            expect(capture.length > 1300).toBeTruthy();

            var capture = webpage.renderBase64({format:'jpg', quality:50});
            expect(typeof capture).toEqual("string");
            expect(capture.length > 2500).toBeTruthy();
        });
    });

    it("supports clipRect property",function() {
        expect(webpage.clipRect).toEqual({top:0, left:0, width:0, height:0});
        webpage.clipRect = {top:10, left:10, width:50, height:40};
        var capture = webpage.renderBase64();
        expect(typeof capture).toEqual("string");
        expect(capture.length > 300).toBeTruthy();
        webpage.close();
    });
});


describe("WebPage.render()", function(){
    var webpage;
    var urlbase = "http://127.0.0.1:8083/";
    var url = urlbase+"render_fix.html";

    // we cannot compare generated files and expected files directly, because
    // png content can be different between version (and between phantomjs/slimerjs)
    // so we render expected files into canvas (in rendering_fix.html). Same thing
    // for produced files, and we compare content of these two canvas.
    var expectedFixPage = null;
    var expectedFixUrl = urlbase+ "rendering/rendering_fix.html";
    var prefixResult = 'slimerjs_capture_fix_';
    var imageResultLoaded = false;
    var currentImageFile = '';
    var setViewport = false;

    beforeEach(function() {
        if (!expectedFixPage) {
            expectedFixPage = require("webpage").create();
        }
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    afterEach(function() {
        if (currentImageFile && fs.exists(currentImageFile)) {
            fs.remove(currentImageFile);
        }

        if (webpage) {
            webpage.close();
            webpage = null;
        }
    });

    it(" has nothing to test, prepare the results",function() {
        var loaded = false;
        runs(function() {
            expectedFixPage.open(expectedFixUrl, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expectedFixPage.onCallback = function() {
                imageResultLoaded = true;
            }
            expectedFixPage.evaluate(function(){ fillCanvas(); })
        });
    });

    it("can capture and save it into a file",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            currentImageFile = 'slimerjs_capture.png';
            expect(webpage.render(currentImageFile)).toBeTruthy();
            expect(fs.exists(currentImageFile)).toBeTruthy();
        });
    });

    it("can capture and save it as PDF into a file",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            currentImageFile = 'slimerjs_capture.pdf';
            expect(webpage.render(currentImageFile)).toBeTruthy();
            expect(fs.exists(currentImageFile)).toBeTruthy();
        });
    });

    function doAndTestRendering(resultNumber, doZoom, clip, scroll) {
        var loaded = false;

        var filename = prefixResult+resultNumber+'.png';
        currentImageFile = phantom.libraryPath+'/www/'+filename;
        var expectedData;
        var onlyViewport = false;

        runs(function() {
            webpage.open(url, function(success){
                if (setViewport) {
                    webpage.viewportSize = setViewport;
                }
                if (clip === true) {
                    onlyViewport = true;
                }
                else if (clip) {
                    webpage.clipRect = clip;
                }
                else webpage.clipRect = {top:0, left:0, width:0, height:0}

                webpage.zoomFactor = doZoom || 1;
                // wait after zoom is applied
                window.setTimeout(function() {
                    if (scroll) {
                        webpage.scrollPosition = scroll;
                    }
                    loaded = true;
                }, 600);
            });
        });

        waitsFor(function(){ return loaded;}, 1200);
        runs(function(){
            if (onlyViewport) {
                webpage.render(currentImageFile, {onlyViewport:true});
            }
            else
                webpage.render(currentImageFile);

            expect(fs.exists(currentImageFile)).toBeTruthy();
            imageResultLoaded = false;
            expectedFixPage.evaluate(function(idx, src){ setResultImage(idx, src );},  resultNumber, urlbase+filename);
        });
        waitsFor(function(){ return imageResultLoaded;}, 1300);
        runs(function(){
            let resultData = expectedFixPage.evaluate(function(idx){ return compareImages(idx); }, resultNumber);
            expect(resultData[0][1]).toEqual(resultData[0][0]); // width
            expect(resultData[1][1]).toEqual(resultData[1][0]); // height
            expect(resultData[2][1]).toEqual(resultData[2][0]); // length of data
            expect(resultData[3]).toEqual(true); // data
            //expectedFixPage.render("rendering_"+prefixResult+resultNumber+".png")
        });
    }

    it(" capture an entire page with fix design (1)",function() {
        doAndTestRendering(1);
    });

    it(" capture an entire page with fix design + zoom in (2)",function() {
        doAndTestRendering(2, 2);
    });

    it(" capture an entire page with fix design + zoom out (3)",function() {
        doAndTestRendering(3, 0.5);
    });

    it(" capture an entire page with fix design + clip rect (4)",function() {
        doAndTestRendering(4, false, {top:50, left:50, width:100, height:100});
    });

    it(" capture an entire page with fix design + clip rect + zoom in (5)",function() {
         doAndTestRendering(5, 2, {top:50, left:50, width:100, height:100});
    });

    it(" capture an entire page with fix design + clip rect + zoom out (6)",function() {
        doAndTestRendering(6, 0.5, {top:50, left:50, width:100, height:100});
    });

    it(" capture an entire page with fix design + scroll (7)",function() {
        doAndTestRendering(7, null, null, {top:25, left:25});
    });

    it(" capture an entire page with fix design + zoom in + scroll (8)",function() {
        doAndTestRendering(8, 2, null, {top:25, left:25});
    });

    it(" capture an entire page with fix design + zoom out + scroll (9)",function() {
        doAndTestRendering(9, 0.5, null, {top:25, left:25});
    });

    it(" capture an entire page with fix design + onlyViewport (10)",function() {
        doAndTestRendering(10, false, true);
    });

    it(" capture an entire page with fix design + onlyViewport + zoom in (11)",function() {
         doAndTestRendering(11, 2, true);
    });

    it(" capture an entire page with fix design + onlyViewport + zoom out (12)",function() {
        doAndTestRendering(12, 0.5, true);
    });

    it(" capture an entire page with fix design + onlyViewport + scroll (13)",function() {
        doAndTestRendering(13, null, true, {top:25, left:25});
    });

    it(" capture an entire page with fix design + onlyViewport + zoom in + scroll (14)",function() {
        doAndTestRendering(14, 2, true, {top:25, left:25});
    });

    it(" capture an entire page with fix design + onlyViewport + zoom out + scroll (15)",function() {
        doAndTestRendering(15, 0.5, true, {top:25, left:25});
    });

    it(" has nothing to test, prepare the results for adaptive page",function() {
        url = urlbase+"render_adaptive.html";
        expectedFixUrl = urlbase+ "rendering/rendering_adaptive.html";
        prefixResult = 'slimerjs_capture_adapt_';
        setViewport = { width:300, height:500 };

        var loaded = false;
        runs(function() {
            
            expectedFixPage.open(expectedFixUrl, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expectedFixPage.onCallback = function() {
                imageResultLoaded = true;
            }
            expectedFixPage.evaluate(function(){ fillCanvas(); })
        });
    });

    it(" capture an entire page with adaptive design (1)",function() {
        doAndTestRendering(1);
    });

    it(" capture an entire page with adaptive design + zoom in (2)",function() {
        doAndTestRendering(2, 2);
    });

    it(" capture an entire page with adaptive design + zoom out (3)",function() {
        doAndTestRendering(3, 0.5);
    });

    it(" capture an entire page with adaptive design + clip rect (4)",function() {
        doAndTestRendering(4, false, {top:50, left:50, width:100, height:100});
    });

    it(" capture an entire page with adaptive design + clip rect + zoom in (5)",function() {
         doAndTestRendering(5, 2, {top:50, left:50, width:100, height:100});
    });

    it(" capture an entire page with adaptive design + clip rect + zoom out (6)",function() {
        doAndTestRendering(6, 0.5, {top:50, left:50, width:100, height:100});
    });

    it(" capture an entire page with adaptive design + scroll (7)",function() {
        doAndTestRendering(7, null, null, {top:25, left:25});
    });

    it(" capture an entire page with adaptive design + zoom in + scroll (8)",function() {
        doAndTestRendering(8, 2, null, {top:25, left:25});
    });

    it(" capture an entire page with adaptive design + zoom out + scroll (9)",function() {
        doAndTestRendering(9, 0.5, null, {top:25, left:25});
    });
});
