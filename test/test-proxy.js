describe('proxy runtime configuration', function () {
    it('should return null because there are no proxy set yet', function() {
        expect(phantom.proxy()).toEqual(null);
    });
    it('should set auto-config URL and return it (auto-config proxy)', function() {
        phantom.setProxy('http://www.example.com/proxy.pac', null, 'config-url');
        expect(phantom.proxy()).toEqual('http://www.example.com/proxy.pac');
    });
    it('should return null because the host is type of undefined', function() {
        phantom.setProxy(undefined);
        expect(phantom.proxy()).toEqual(null);
    });
    it('should set host and port (http proxy)', function() {
        phantom.setProxy('127.0.0.1', 50000, 'http');
        expect(phantom.proxy()).toEqual('127.0.0.1:50000');
    });
    it('should return null because the host is null', function() {
        phantom.setProxy(null);
        expect(phantom.proxy()).toEqual(null);
    });
    it('should set host and port (http proxy, without specifying that this is "http" proxy)', function() {
        phantom.setProxy('127.0.0.2', 50001);
        expect(phantom.proxy()).toEqual('127.0.0.2:50001');
    });
    it('should set host and port (http proxy, specifying null as proxy type)', function() {
        phantom.setProxy('127.0.0.3', 50002, null);
        expect(phantom.proxy()).toEqual('127.0.0.3:50002');
    });
    it('should return null because the host is false', function() {
        phantom.setProxy(false);
        expect(phantom.proxy()).toEqual(null);
    });
    it('should set host and port (socks proxy)', function() {
        phantom.setProxy('127.0.0.4', 50003, 'socks');
        expect(phantom.proxy()).toEqual('127.0.0.4:50003');
    });
    it('should return null because the host is an empty string', function() {
        phantom.setProxy('');
        expect(phantom.proxy()).toEqual(null);
    });
    it('should set host and port (socks5 proxy)', function() {
        phantom.setProxy('127.0.0.5', 50004, 'socks5');
        expect(phantom.proxy()).toEqual('127.0.0.5:50004');
    });
    it('should return null because the proxy has been reset', function() {
        phantom.setProxy(null);
        expect(phantom.proxy()).toEqual(null);
    });
})