describe("fs module", function() {
    it("absolute() should support relative path", function(){
        var wd = fs.workingDirectory.replace('/sources', '/hello.foo');
        expect(fs.absolute('../hello.foo')).toEqual(wd);
    });
    var content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nEtiam eleifend vel tellus vestibulum posuere.\n\nVestibulum sagittis dolor tortor, eget lacinia metus rutrum venenatis.\nCurabitur ornare, ligula id dignissim congue, felis ante gravida enim,\nid maximus arcu quam nec nisi. Aliquam quis dapibus elit.";

    it("can read a file", function(){
        var str = fs.read(phantom.libraryPath+'/fs/test.txt', 'r');
        expect(str).toEqual(content);
    });

    it("can read part of a file", function(){
        var s = fs.open(phantom.libraryPath+'/fs/test.txt', 'r');
        var str = s.read(20);
        s.close();
        expect(str).toEqual("Lorem ipsum dolor si");
    });

    it("stream support atEnd and readLine", function(){
        var str = '';
        var s = fs.open(phantom.libraryPath+'/fs/test.txt', 'r');
        while (!s.atEnd()) {
            str+=s.readLine()+"\n";
        }
        s.close();
        expect(str).toEqual(content+"\n");
    });

    it("can extract extension", function(){
        var ext = fs.extension(phantom.libraryPath+'/fs/test.txt');
        expect(ext).toEqual(".txt");
        ext = fs.extension('test.hop');
        expect(ext).toEqual(".hop");
        ext = fs.extension('test.hop', true);
        expect(ext).toEqual("hop");
    });



});
