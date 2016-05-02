describe("fs module", function() {
    it("absolute() should support relative path", function(){
        var wd = fs.join(
            fs.directory(fs.workingDirectory),
            'hello.foo');
        expect(fs.absolute('../hello.foo')).toEqual(wd);
    });
    // should be equal to the content of test.txt
    var content = "Loreméèàùô ipsum dolor sit amet, consectetur adipiscing elit.\nEtiam eleifend vel tellus vestibulum posuere.\n\nVestibulum sagittis dolor tortor, eget lacinia metus rutrum venenatis.\nCurabitur ornare, ligula id dignissim congue, felis ante gravida enim,\nid maximus arcu quam nec nisi. Aliquam quis dapibus elit.";
    var content2 = "Loreméèàùô ipsum dol";
    it("can read a file", function(){
        var str = fs.read(phantom.libraryPath+'/fs/test.txt', 'r');
        expect(str).toEqual(content);
    });

    it("can read a latin1 file", function(){
        var str = fs.read(phantom.libraryPath+'/fs/testlatin1.txt', {mode:'r', charset:'ISO-8859-1'});
        expect(str).toEqual(content);
    });

    it("can read part of a file", function(){
        var s = fs.open(phantom.libraryPath+'/fs/test.txt', 'r');
        var str = s.read(20);
        s.close();
        expect(str).toEqual("Loreméèàùô ipsum dol");
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

    it("can write and delete a file", function(){
        let f = phantom.libraryPath+'/fs/testwrite.txt';
        if (fs.exists(f)) {
            fs.remove(f);
        }
        expect(!fs.exists(f)).toBeTruthy();
        fs.write(f, content2);
        expect(fs.exists(f)).toBeTruthy();
        var str = fs.read(f, 'r');
        expect(str).toEqual(content2);
        fs.remove(f);
        expect(!fs.exists(f)).toBeTruthy();
    });
    it("can write and delete a latin1 file", function(){
        let f = phantom.libraryPath+'/fs/testwritelatin1.txt';
        if (fs.exists(f)) {
            fs.remove(f);
        }
        expect(!fs.exists(f)).toBeTruthy();

        let expected = fs.read(phantom.libraryPath+'/fs/testlatin1.txt', {mode:'r', charset:'ISO-8859-1'});

        fs.write(f, expected, {mode:'w', charset:'iso-8859-1'});
        expect(fs.exists(f)).toBeTruthy();
        var str = fs.read(f, {charset:'iso-8859-1'});
        expect(str).toEqual(expected);
        fs.remove(f);
        expect(!fs.exists(f)).toBeTruthy();
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
