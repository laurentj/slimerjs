SlimerJS will implement all [the API of Phantomjs](https://github.com/ariya/phantomjs/wiki/API-Reference) except deprecated API (at least in first releases).


Legend:

<table>
    <tr style="background-color:green"><td>Implemented</td></tr>
    <tr style="background-color:orange"><td>Almost Implemented, there are still some issues</td></tr>
    <tr style="background-color:red;"><td>Not Implemented yet</td></tr>
    <tr style="background-color:gray;"><td>Will Not be Implemented</td></tr>
</table>


Here is the compatibility table.


# Command-line arguments and options

<table>
    <tr style="background-color:red;"><td>--cookies-file=/path/to/cookies.txt</td><td></td></tr>
    <tr style="background-color:red;"><td>--disk-cache=\[yes\|no\]</td><td></td></tr>
    <tr style="background-color:red;"><td>--help or -h</td><td></td></tr>
    <tr style="background-color:red;"><td>--ignore-ssl-errors=\[yes\|no\]</td><td></td></tr>
    <tr style="background-color:red;"><td>--load-images=\[yes\|no\]</td><td></td></tr>
    <tr style="background-color:red;"><td>--local-to-remote-url-access=\[yes|no\]</td><td></td></tr>
    <tr style="background-color:red;"><td>--max-disk-cache-size=size</td><td></td></tr>
    <tr style="background-color:red;"><td>--output-encoding=encoding</td><td></td></tr>
    <tr style="background-color:red;"><td>--proxy=address:port</td><td></td></tr>
    <tr style="background-color:red;"><td>--proxy-type=\[http|socks5|none\]</td><td></td></tr>
    <tr style="background-color:red;"><td>--script-encoding=encoding</td><td></td></tr>
    <tr style="background-color:red;"><td>--version or -v</td><td></td></tr>
    <tr style="background-color:red;"><td>--web-security=\[yes|no\]</td><td></td></tr>
    <tr style="background-color:red;"><td>--config=/path/to/config.json</td><td></td></tr>
    <tr style="background-color:red;"><td>script path</td><td></td></tr>
    <tr style="background-color:red;"><td>script arguments</td><td></td></tr>
</table>

# phantom object

## properties

<table>
    <tr style="background-color:gray;"><td>args</td><td>deprecated</td></tr>
    <tr style="background-color:red;"><td>cookies</td><td></td></tr>
    <tr style="background-color:red;"><td>cookiesEnabled</td><td></td></tr>
    <tr style="background-color:red;"><td>libraryPath</td><td></td></tr>
    <tr style="background-color:gray;"><td>scriptName</td><td>deprecated</td></tr>
    <tr style="background-color:red;"><td>version</td><td></td></tr>
</table>

## methods

<table>
    <tr style="background-color:red;"><td>addCookie(cookie)</td><td></td></tr>
    <tr style="background-color:red;"><td>clearCookies()</td><td></td></tr>
    <tr style="background-color:red;"><td>deleteCookie(cookieName)</td><td></td></tr>
    <tr style="background-color:red;"><td>exit(returnValue)</td><td></td></tr>
    <tr style="background-color:red;"><td>injectJs(filename)</td><td></td></tr>
    <tr style="background-color:red;"><td>onerror(msg, trace)</td><td></td></tr>
</table>

# CommonJS API

<table>
    <tr style="background-color:red;"><td>require(modulename)</td><td></td></tr>
</table>

# Module: Webpage

<table>
    <tr style="background-color:red;"><td>create()</td><td></td></tr>
</table>

# Webpage object

## properties

<table>
    <tr style="background-color:red;"><td>clipRect</td><td></td></tr>
    <tr style="background-color:red;"><td>content</td><td></td></tr>
    <tr style="background-color:red;"><td>cookies</td><td></td></tr>
    <tr style="background-color:red;"><td>customHeaders</td><td></td></tr>
    <tr style="background-color:red;"><td>frameContent</td><td></td></tr>
    <tr style="background-color:red;"><td>framePlainText</td><td></td></tr>
    <tr style="background-color:red;"><td>frameUrl</td><td></td></tr>
    <tr style="background-color:red;"><td>libraryPath</td><td></td></tr>
    <tr style="background-color:red;"><td>navigationLocked</td><td></td></tr>
    <tr style="background-color:red;"><td>paperSize</td><td></td></tr>
    <tr style="background-color:red;"><td>plainText</td><td></td></tr>
    <tr style="background-color:red;"><td>scrollPosition</td><td></td></tr>
    <tr style="background-color:red;"><td>settings</td><td></td></tr>
    <tr style="background-color:red;"><td>url</td><td></td></tr>
    <tr style="background-color:red;"><td>viewportSize</td><td></td></tr>
    <tr style="background-color:red;"><td>zoomFactor</td><td></td></tr>
</table>

## methods

<table>
    <tr style="background-color:red;"><td>addCookie(Cookie)</td><td></td></tr>
    <tr style="background-color:red;"><td>clearCookies()</td><td></td></tr>
    <tr style="background-color:red;"><td>close()</td><td></td></tr>
    <tr style="background-color:red;"><td>deleteCookie(cookieName)</td><td></td></tr>
    <tr style="background-color:red;"><td>evaluate(function, arg1, arg2,...)</td><td></td></tr>
    <tr style="background-color:red;"><td>evaluateASync(function, arg1, arg2,...)</td><td></td></tr>
    <tr style="background-color:red;"><td>includeJs(url, callback)</td><td></td></tr>
    <tr style="background-color:red;"><td>injectJs(filename)</td><td></td></tr>
    <tr style="background-color:red;"><td>open(url, callback)</td><td></td></tr>
    <tr style="background-color:red;"><td>release()</td><td></td></tr>
    <tr style="background-color:red;"><td>render(filename)</td><td></td></tr>
    <tr style="background-color:red;"><td>renderBase64(format)</td><td></td></tr>
    <tr style="background-color:red;"><td>sendEvent(mouseEventType, mouseX, mouseY, button='left'])</td><td></td></tr>
    <tr style="background-color:red;"><td>sendEvent(keyboardEventType, keyOrKeys)</td><td></td></tr>
    <tr style="background-color:red;"><td>setContent(content, url)</td><td></td></tr>
    <tr style="background-color:red;"><td>uploadFile(selector, filename)</td><td></td></tr>
    <tr style="background-color:red;"><td>onalert</td><td></td></tr>
    <tr style="background-color:red;"><td>onCallback</td><td></td></tr>
    <tr style="background-color:red;"><td>onClosing</td><td></td></tr>
    <tr style="background-color:red;"><td>onConfirm</td><td></td></tr>
    <tr style="background-color:red;"><td>onConsoleMessage</td><td></td></tr>
    <tr style="background-color:red;"><td>onError</td><td></td></tr>
    <tr style="background-color:red;"><td>onInitialized</td><td></td></tr>
    <tr style="background-color:red;"><td>onLoadFinished</td><td></td></tr>
    <tr style="background-color:red;"><td>onLoadStarted</td><td></td></tr>
    <tr style="background-color:red;"><td>onNavigationRequested</td><td></td></tr>
    <tr style="background-color:red;"><td>onPageCreated</td><td></td></tr>
    <tr style="background-color:red;"><td>onPrompt</td><td></td></tr>
    <tr style="background-color:red;"><td>onResourceRequested</td><td></td></tr>
    <tr style="background-color:red;"><td>onResourceReceived</td><td></td></tr>
    <tr style="background-color:red;"><td>onUrlChanged</td><td></td></tr>
</table>


# Module: system

<table>
    <tr style="background-color:red;"><td>create()</td><td></td></tr>
</table>

# System object

## properties

<table>
    <tr style="background-color:red;"><td>pid</td><td></td></tr>
    <tr style="background-color:red;"><td>platform</td><td></td></tr>
    <tr style="background-color:red;"><td>os</td><td></td></tr>
    <tr style="background-color:red;"><td>env</td><td></td></tr>
    <tr style="background-color:red;"><td>args</td><td></td></tr>
</table>

# Module: FileSystem

<table>
    <tr style="background-color:red;"><td>create()</td><td></td></tr>
</table>

# fs object

## properties

<table>
    <tr style="background-color:red;"><td>separator</td><td></td></tr>
    <tr style="background-color:red;"><td>workingDirectory</td><td></td></tr>
</table>

## methods

<table>
    <tr style="background-color:red;"><td>list(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>absolute(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>exists(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isDirectory(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isFile(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isAbsolute(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isExecutable(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isReadable(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isWritable(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>isLink(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>readLink(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>changeWorkingDirectory(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>makeDirectory(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>makeTree(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>removeDirectory(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>removeTree(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>copyTree(source, destination)</td><td></td></tr>
    <tr style="background-color:red;"><td>open(path, mode)</td><td></td></tr>
    <tr style="background-color:red;"><td>read(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>write(path, content, mode)</td><td></td></tr>
    <tr style="background-color:red;"><td>size(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>remove(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>copy(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>move(path)</td><td></td></tr>
    <tr style="background-color:red;"><td>touch(path)</td><td></td></tr>
</table>

# stream object

<table>
    <tr style="background-color:red;"><td>read()</td><td></td></tr>
    <tr style="background-color:red;"><td>readLine()</td><td></td></tr>
    <tr style="background-color:red;"><td>write(data)</td><td></td></tr>
    <tr style="background-color:red;"><td>writeLine(data)</td><td></td></tr>
    <tr style="background-color:red;"><td>flush()</td><td></td></tr>
    <tr style="background-color:red;"><td>close()</td><td></td></tr>
</table>

# Module: webserver

<table>
    <tr style="background-color:red;"><td>create()</td><td></td></tr>
</table>

# WebServer object

<table>
    <tr style="background-color:red;"><td>listen(port, callback)</td><td></td></tr>
</table>

## request object

<table>
    <tr style="background-color:red;"><td>method</td><td></td></tr>
    <tr style="background-color:red;"><td>url</td><td></td></tr>
    <tr style="background-color:red;"><td>httpVersion</td><td></td></tr>
    <tr style="background-color:red;"><td>headers</td><td></td></tr>
    <tr style="background-color:red;"><td>post</td><td></td></tr>
    <tr style="background-color:red;"><td>postRaw</td><td></td></tr>
</table>

## response object

<table>
    <tr style="background-color:red;"><td>headers</td><td></td></tr>
    <tr style="background-color:red;"><td>statusCode</td><td></td></tr>
    <tr style="background-color:red;"><td>write(data)</td><td></td></tr>
    <tr style="background-color:red;"><td>writeHead(statusCode, headers)</td><td></td></tr>
    <tr style="background-color:red;"><td>close()</td><td></td></tr>
</table>

