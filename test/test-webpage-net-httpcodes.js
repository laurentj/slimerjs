

describe("webpage and http code support", function() {
    var domain = "http://localhost:8083/";

    var async = new AsyncSpec(this);

    var testCodes = [
        101, 102, 118,
        200, 201, 202, 203, 204, 205, 206, 207, 210,
        300, 301, 302, 303, 304, 305, 307, 310,
        400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
            414, 415, 416, 417, 418, 422, 423, 424, 425, 426, 449, 450,
        500, 501, 502, 503, 504, 505, 507, 509
    ];
    // missing code: 100 is CONTINUE, so don't expect a terminated response
    // 102, 118, 408 are buggy in gecko
    testCodes.forEach(function(statusCode){
        async.it("is opening a page with response status code "+statusCode,function(done) {
            networkUtils.trace = "";
            networkUtils.receivedRequest = [];
            networkUtils.init();
            networkUtils.webpage.open(domain+'statuscode/'+statusCode, function(success){
                if (statusCode == 204 || statusCode == 205 || (URLUtils && slimer.geckoVersion.major <= 25 && statusCode == 408)) {
                    expect(success).toEqual("fail");
                }
                else
                    expect(success).toEqual("success");

                var r = networkUtils.receivedRequest.filter(function(result, i) {
                    if (i == 0)
                        return false;
                    return result.req.url == (domain + 'statuscode/'+statusCode);
                })[0];
                expect(r).toNotBe(null);
                expect(r.req).toNotBe(null);
                var startHasToBeNull = false;
                if (URLUtils && slimer.geckoVersion.major <= 25 && statusCode == 408) {
                    startHasToBeNull = true;
                }
                else if (!URLUtils && (statusCode <= 199 || statusCode == 204 || statusCode == 304)) {
                    startHasToBeNull = true;
                }
                if (!startHasToBeNull) {
                    expect(r.start).toNotBe(null);
                    if (statusCode != 102 && statusCode != 118) { // gecko doesn't return response code for this http response
                        expect(r.start.status).toEqual(statusCode);
                    }
                }
                else {
                    expect(r.start).toBeNull();
                }
                expect(r.end).toNotBe(null);
                if (statusCode >= 400) {
                    expect(r.err).toNotBe(null);
                }
                else {
                    expect(r.err).toBeNull();
                }

                if (r.end && statusCode != 102 && statusCode != 118 && statusCode != 408) { // gecko doesn't return response code for this http response
                    expect(r.end.status).toEqual(statusCode);
                }
                if (r.end) {
                    expect(r.req.id == r.end.id).toBeTruthy();
                    expect(r.req.url == r.end.url).toBeTruthy();
                }
                else expect(false).toBeTruthy();
                expect(r.req.method).toEqual("GET");
                done();
            });
        });
    });

    async.it("test end", function(done){
        networkUtils.reset();
        done();
    });
});
