SlimerJS will implement all [the API of Phantomjs](https://github.com/ariya/phantomjs/wiki/API-Reference)
except deprecated API (at least in first releases).

Here are compatibility tables and other specific API to SlimerJS.

# Main differences with PhantomJS 1.9

* webpage.sendEvent() for key events is more consistent. In phantomJS, there are
  [several issues](http://code.google.com/p/phantomjs/issues/detail?id=1094)
* ```webpage.open()``` returns [a promise](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/core/promise.html). It's easier to chain things executed asynchronously
* The webserver object has more methods to configure it easily

Of course, since SlimerJS is still under developpement, the other main difference
is that SlimerJS does not implement yet all the PhantomJS API. Help us!


# Command-line arguments and options

<table>
    <tr><td>--config=/path/to/config.json        </td><td></td></tr>
    <tr><td>--cookies-file=/path/to/cookies.txt  </td><td></td></tr>
    <tr><td>--debug=[yes|no]                     </td><td></td></tr>
    <tr><td>--disk-cache=[yes|no]                </td><td></td></tr>
    <tr><td>--help or -h                         </td><td>Implemented</td></tr>
    <tr><td>--ignore-ssl-errors=[yes|no]         </td><td></td></tr>
    <tr><td>--load-images=[yes|no]               </td><td></td></tr>
    <tr><td>--local-storage-path=/path/to/file   </td><td></td></tr>
    <tr><td>--local-storage-quota=number         </td><td></td></tr>
    <tr><td>--local-to-remote-url-access=[yes|no]</td><td></td></tr>
    <tr><td>--max-disk-cache-size=size           </td><td></td></tr>
    <tr><td>--output-encoding=encoding           </td><td></td></tr>
    <tr><td>--proxy=address:port                 </td><td></td></tr>
    <tr><td>--proxy-auth=username:password       </td><td></td></tr>
    <tr><td>--proxy-type=[http|socks5|none]      </td><td></td></tr>
    <tr><td>--remote-debugger-port=number        </td><td></td></tr>
    <tr><td>--remote-debugger-autorun=[yes|no]   </td><td></td></tr>
    <tr><td>--script-encoding=encoding           </td><td></td></tr>
    <tr><td>--ssl-protocol=[SSLv3|SSLv2|TLSv1|any] </td><td></td></tr>
    <tr><td>--ssl-certificates-path=/path/to/dir </td><td></td></tr>
    <tr><td>--version or -v                      </td><td>Implemented</td></tr>
    <tr><td>--webdriver or --wd or -w            </td><td></td></tr>
    <tr><td>--webdriver=ip:port                  </td><td></td></tr>
    <tr><td>--webdriver-logfile=/path/to/logfile </td><td></td></tr>
    <tr><td>--webdriver-loglevel=[ERROR|WARN|INFO|DEBUG]</td><td></td></tr>
    <tr><td>--webdriver-selenium-grid-hub=url    </td><td></td></tr>
    <tr><td>--web-security=[yes|no]              </td><td></td></tr>
    <tr><td>script path                          </td><td>Implemented</td></tr>
    <tr><td>script arguments                     </td><td>Implemented</td></tr>
</table>

# phantom object

## properties

<table>
    <tr><td>args                                </td><td>Implemented (deprecated)</td></tr>
    <tr><td>cookies                             </td><td></td></tr>
    <tr><td>cookiesEnabled                      </td><td></td></tr>
    <tr><td>defaultPageSettings                 </td><td>Implemented</td></tr>
    <tr><td>libraryPath                         </td><td>Implemented (deprecated)</td></tr>
    <tr><td>outputEncoding                      </td><td></td></tr>
    <tr><td>page                                </td><td></td></tr>
    <tr><td>scriptName                          </td><td>Implemented</td></tr>
    <tr><td>version                             </td><td>Implemented. Gives the PhantomJS version which is compatible to
                                                        the SlimerJS implementation.</td></tr>
    <tr><td>webdriverMode                       </td><td></td></tr>
</table>

## methods

<table>
    <tr><td>addCookie(cookie)                   </td><td></td></tr>
    <tr><td>callback(callback)                  </td><td></td></tr>
    <tr><td>clearCookies()                      </td><td></td></tr>
    <tr><td>defaultErrorHandler(message, stack) </td><td>Implemented</td></tr>
    <tr><td>deleteCookie(cookieName)            </td><td></td></tr>
    <tr><td>exit(returnValue)                   </td><td>Partial implementation. The exit code cannot be returned
                                                    to the shell console because the Mozilla toolkit does not
                                                    provide a way to return it.</td></tr>
    <tr><td>injectJs(filename)                  </td><td>Implemented</td></tr>
    <tr><td>onerror(msg, trace)                 </td><td>Implemented</td></tr>
</table>

# slimer object

It will contain API that does not exists in PhantomJS.

<table>
    <tr><td>version                             </td><td>Implemented. Gives the version of SlimerJS</td></tr>
    <tr><td>exit()                              </td><td>Implemented.</td></tr>
</table>

# CommonJS API

<table>
    <tr><td>require(modulename)                 </td><td>Implemented</td></tr>
    <tr><td>require.paths                       </td><td>Implemented. SlimerJS only. Array of path where modules can be found</td></tr>
</table>

# Module: webpage

<table>
    <tr><td>create()                            </td><td>Implemented</td></tr>
</table>

# WebPage object

## properties

<table>
    <tr><td>canGoBack                           </td><td>Implemented</td></tr>
    <tr><td>canGoForward                        </td><td>Implemented</td></tr>
    <tr><td>clipRect                            </td><td>Implemented</td></tr>
    <tr><td>content                             </td><td>Implemented. Setter not implemented yet</td></tr>
    <tr><td>captureContent                      </td><td>Implemented. list of regexp matching content <br>
                                                        types of resources for which you want to retrieve <br>
                                                        the content. The content is then set on the body <br>
                                                        property of the response object received by your <br>
                                                        onResourceReceived callback (SlimerJS only)</td></tr>
    <tr><td>cookies                             </td><td></td></tr>
    <tr><td>customHeaders                       </td><td></td></tr>
    <tr><td>event                               </td><td></td></tr>
    <tr><td>focusedFrameName                    </td><td>Implemented</td></tr>
    <tr><td>frameContent                        </td><td>Implemented. Setter is not implemented yet.</td></tr>
    <tr><td>frameName                           </td><td>Implemented</td></tr>
    <tr><td>framePlainText                      </td><td>Implemented</td></tr>
    <tr><td>frameTitle                          </td><td>Implemented</td></tr>
    <tr><td>frameUrl                            </td><td>Implemented</td></tr>
    <tr><td>framesCount                         </td><td>Implemented</td></tr>
    <tr><td>framesName                          </td><td>Implemented</td></tr>
    <tr><td>libraryPath                         </td><td>Implemented</td></tr>
    <tr><td>navigationLocked                    </td><td>Implemented</td></tr>
    <tr><td>offlineStoragePath                  </td><td></td></tr>
    <tr><td>offlineStorageQuota                 </td><td></td></tr>
    <tr><td>ownsPages                           </td><td></td></tr>
    <tr><td>pages                               </td><td></td></tr>
    <tr><td>pagesWindowName                     </td><td></td></tr>
    <tr><td>paperSize                           </td><td></td></tr>
    <tr><td>plainText                           </td><td>Implemented</td></tr>
    <tr><td>scrollPosition                      </td><td></td></tr>
    <tr><td>settings                            </td><td>Implemented</td></tr>
    <tr><td>settings.javascriptEnabled          </td><td></td></tr>
    <tr><td>settings.loadImages                 </td><td></td></tr>
    <tr><td>settings.localToRemoteUrlAccessEnabled</td><td></td></tr>
    <tr><td>settings.XSSAuditingEnabled         </td><td></td></tr>
    <tr><td>settings.webSecurityEnabled         </td><td></td></tr>
    <tr><td>settings.javascriptCanOpenWindows   </td><td></td></tr>
    <tr><td>settings.javascriptCanCloseWindows  </td><td></td></tr>
    <tr><td>settings.userAgent                  </td><td></td></tr>
    <tr><td>settings.userName                   </td><td></td></tr>
    <tr><td>settings.password                   </td><td></td></tr>
    <tr><td>settings.maxAuthAttempts            </td><td></td></tr>
    <tr><td>settings.resourceTimeout            </td><td></td></tr>
    <tr><td>title                               </td><td>Implemented</td></tr>
    <tr><td>url                                 </td><td>Implemented</td></tr>
    <tr><td>viewportSize                        </td><td>Implemented</td></tr>
    <tr><td>windowName                          </td><td>Implemented</td></tr>
    <tr><td>zoomFactor                          </td><td>Implemented</td></tr>
</table>

## methods

<table>
    <tr><td>addCookie(Cookie)                   </td><td></td></tr>
    <tr><td>childFramesCount()                  </td><td>Implemented. deprecated</td></tr>
    <tr><td>childFramesName()                   </td><td>Implemented. deprecated</td></tr>
    <tr><td>clearCookies()                      </td><td></td></tr>
    <tr><td>close()                             </td><td>Implemented</td></tr>
    <tr><td>currentFrameName()                  </td><td>Implemented. deprecated</td></tr>
    <tr><td>deleteCookie(cookieName)            </td><td></td></tr>
    <tr><td>evaluateJavascript(str)             </td><td>implemented</td></tr>
    <tr><td>evaluate(function, arg1, arg2,...)  </td><td>implemented</td></tr>
    <tr><td>evaluateASync(function, arg1, arg2,...)</td><td>implemented</td></tr>
    <tr><td>getPage(windowName)                 </td><td></td></tr>
    <tr><td>go(index)                           </td><td>Implemented</td></tr>
    <tr><td>goBack()                            </td><td>Implemented</td></tr>
    <tr><td>goForward()                         </td><td>Implemented</td></tr>
    <tr><td>includeJs(url, callback)            </td><td>implemented</td></tr>
    <tr><td>injectJs(filename)                  </td><td>Implemented</td></tr>
    <tr><td>open(url)                           </td><td>Implemented. SlimerJS only: it returns a promise</td></tr>
    <tr><td>open(url, callback)                 </td><td>Implemented. SlimerJS only: it returns a promise</td></tr>
    <tr><td>open(url, httpmethod)               </td><td></td></tr>
    <tr><td>open(url, httpmethod, callback)     </td><td></td></tr>
    <tr><td>open(url, httpmethod, data)         </td><td></td></tr>
    <tr><td>open(url, httpmethod, data, callback)</td><td></td></tr>
    <tr><td>open(url, httpmethod, data, headers, callback)</td><td></td></tr>
    <tr><td>openUrl(url, httpConf, settings)    </td><td></td></tr>
    <tr><td>release()                           </td><td></td></tr>
    <tr><td>reload()                            </td><td>Implemented</td></tr>
    <tr><td>render(filename, ratio)             </td><td>Implemented. Only PNG et JPG supported. SlimerJS only: ratio parameter (value between 0 and 1)</td></tr>
    <tr><td>renderBytes(format, ratio)          </td><td>Implemented. SlimerJS only. Only PNG et JPG supported.</td></tr>
    <tr><td>renderBase64(format, ratio)         </td><td>Implemented. Only PNG et JPG supported. SlimerJS only: ratio parameter (value between 0 and 1)</td></tr>
    <tr><td>sendEvent(mouseEventType, mouseX, mouseY, button='left')</td><td>Implemented</td></tr>
    <tr><td>sendEvent(keyboardEventType, keyOrKeys)</td><td>Implemented</td></tr>
    <tr><td>setContent(content, url)            </td><td></td></tr>
    <tr><td>stop()                              </td><td>Implemented</td></tr>
    <tr><td>switchToFocusedFrame()              </td><td>Implemented</td></tr>
    <tr><td>switchToFrame(frameName)            </td><td>Implemented</td></tr>
    <tr><td>switchToFrame(framePosition)        </td><td>Implemented</td></tr>
    <tr><td>switchToChildFrame(frameName)       </td><td>Implemented. deprecated</td></tr>
    <tr><td>switchToChildFrame(framePosition)   </td><td>Implemented. deprecated</td></tr>
    <tr><td>switchToMainFrame()                 </td><td>Implemented</td></tr>
    <tr><td>switchToParentFrame()               </td><td>Implemented</td></tr>
    <tr><td>uploadFile(selector, filename)      </td><td></td></tr>
</table>

## callbacks

<table>
    <tr><td>onalert                             </td><td>Implemented</td></tr>
    <tr><td>onCallback                          </td><td>Implemented</td></tr>
    <tr><td>onClosing                           </td><td>Implemented</td></tr>
    <tr><td>onConfirm                           </td><td>Implemented</td></tr>
    <tr><td>onConsoleMessage                    </td><td>Implemented (SlimerJS only: the callback receives the lineNumber and the sourceID, contrary to PhantomJS)</td></tr>
    <tr><td>onError                             </td><td>Implemented. (SlimerJS issue: For errors from the webpage directly, the stack is not available..)</td></tr>
    <tr><td>onFilePicker                        </td><td></td></tr>
    <tr><td>onInitialized                       </td><td>Implemented</td></tr>
    <tr><td>onLoadFinished                      </td><td>Implemented<br>SlimerJS only: the callback receives 3 parameters: the status ("success" or "fail"), the url and true if this is a frame that is loaded</td></tr>
    <tr><td>onLoadStarted                       </td><td>Implemented<br>SlimerJS only: the callback receives 2 parameters: the url and true if this is a frame that is loaded</td></tr>
    <tr><td>onNavigationRequested               </td><td>Implemented.<br>SlimerJS issue: navigationType is always "Undefined"</td></tr>
    <tr><td>onPageCreated                       </td><td>Implemented</td></tr>
    <tr><td>onPrompt                            </td><td>Implemented</td></tr>
    <tr><td>onResourceRequested                 </td><td>Implemented</td></tr>
    <tr><td>onResourceReceived                  </td><td>Implemented</td></tr>
    <tr><td>onUrlChanged                        </td><td>Implemented</td></tr>
</table>

Methods that send signals (private methods):

<table>
    <tr><td>closing(page)                       </td><td>Implemented</td></tr>
    <tr><td>initialized()                       </td><td>Implemented</td></tr>
    <tr><td>javaScriptAlertSent(message)        </td><td>Implemented</td></tr>
    <tr><td>javaScriptConsoleMessageSent(message)</td><td>Implemented</td></tr>
    <tr><td>loadFinished(status)                </td><td>Implemented</td></tr>
    <tr><td>loadStarted()                       </td><td>Implemented</td></tr>
    <tr><td>navigationRequested(url, navigationType, navigationLocked, isMainFrame)</td><td></td></tr>
    <tr><td>rawPageCreated(page)                </td><td>Implemented</td></tr>
    <tr><td>resourceReceived(request)           </td><td>Implemented</td></tr>
    <tr><td>resourceRequested(resource)         </td><td>Implemented</td></tr>
    <tr><td>urlChanged(url)                     </td><td>Implemented</td></tr>
</table>

## request object received onResourceRequested

<table>
    <tr><td>id                                  </td><td>Implemented</td></tr>
    <tr><td>method                              </td><td>Implemented</td></tr>
    <tr><td>url                                 </td><td>Implemented</td></tr>
    <tr><td>time                                </td><td>Implemented</td></tr>
    <tr><td>headers                             </td><td>Implemented</td></tr>
</table>

## response object received onResourceReceived

<table>
    <tr><td>id                                  </td><td>Implemented</td></tr>
    <tr><td>headers                             </td><td>Implemented</td></tr>
    <tr><td>body                                </td><td>Implemented (SlimerJS only. see webpage.captureContent)</td></tr>
    <tr><td>bodySize                            </td><td>Implemented</td></tr>
    <tr><td>contentType                         </td><td>Implemented</td></tr>
    <tr><td>contentCharset                      </td><td>Implemented (SlimerJS only)</td></tr>
    <tr><td>imageInfo                           </td><td>Implemented (SlimerJS only, for images)</td></tr>
    <tr><td>redirectURL                         </td><td>Implemented</td></tr>
    <tr><td>referrer                            </td><td>Implemented (SlimerJS only)</td></tr>
    <tr><td>stage                               </td><td>Implemented</td></tr>
    <tr><td>status                              </td><td>Implemented</td></tr>
    <tr><td>statusText                          </td><td>Implemented</td></tr>
    <tr><td>time                                </td><td>Implemented</td></tr>
    <tr><td>url                                 </td><td>Implemented</td></tr>

</table>


# Module: system

# System object

## properties

<table>
    <tr><td>pid                                 </td><td>Not Implemented. Always returns 0.
                                                    It seems Mozilla doesn't provide an API for that</td></tr>
    <tr><td>platform                            </td><td>Implemented</td></tr>
    <tr><td>os                                  </td><td>Implemented. SlimerJS only: an additional method isWindows()</td></tr>
    <tr><td>env                                 </td><td>Implemented</td></tr>
    <tr><td>args                                </td><td>Implemented</td></tr>
</table>

# Module: FileSystem

# fs object

## properties

<table>
    <tr><td>separator                           </td><td>Implemented</td></tr>
    <tr><td>workingDirectory                    </td><td>Implemented<br/>
                                                    Note that it is a property, to be compatible
                                                    with PhantomJS. In the CommonJS FileSystem
                                                    specification, it supposed to be a method</td></tr>
</table>

## methods

<table>
    <tr><td>open(path, mode)                    </td><td>Implemented</td></tr>
    <tr><td>read(path)                          </td><td>Implemented</td></tr>
    <tr><td>write(path, content, mode)          </td><td>Implemented</td></tr>
    <tr><td>copy(source, destination)           </td><td>Implemented</td></tr>
    <tr><td>move(source, destination)           </td><td>Implemented</td></tr>
    <tr><td>remove(path)                        </td><td>Implemented</td></tr>
    <tr><td>touch(path)                         </td><td>Implemented</td></tr>

    <tr><td>makeDirectory(path)                 </td><td>Implemented</td></tr>
    <tr><td>removeDirectory(path)               </td><td>Implemented</td></tr>
    <tr><td>makeTree(path)                      </td><td>Implemented</td></tr>
    <tr><td>removeTree(path)                    </td><td>Implemented</td></tr>
    <tr><td>copyTree(source, destination)       </td><td>Implemented</td></tr>

    <tr><td>list(path)                          </td><td>Implemented</td></tr>
    <tr><td>readLink(path)                      </td><td>Implemented</td></tr>

    <tr><td>lastModified(path) Date             </td><td>Implemented</td></tr>
    <tr><td>exists(path)                        </td><td>Implemented</td></tr>
    <tr><td>isFile(path)                        </td><td>Implemented</td></tr>
    <tr><td>isDirectory(path)                   </td><td>Implemented</td></tr>
    <tr><td>isLink(path)                        </td><td>Implemented</td></tr>
    <tr><td>isReadable(path)                    </td><td>Implemented</td></tr>
    <tr><td>isWritable(path)                    </td><td>Implemented</td></tr>

    <tr><td>absolute(path)                      </td><td>Implemented</td></tr>
    <tr><td>join(base)                          </td><td>Implemented</td></tr>
    <tr><td>split(path)                         </td><td>Implemented</td></tr>

    <tr><td>size(path)                          </td><td>Implemented</td></tr>

    <tr><td>isAbsolute(path)                    </td><td>Implemented (not a CommonJS FileSystem method)</td></tr>
    <tr><td>isExecutable(path)                  </td><td>Implemented (not a CommonJS FileSystem method)</td></tr>

    <tr><td>changeWorkingDirectory(path)        </td><td>Implemented</td></tr>
    <tr><td>fromNativeSeparators(path)          </td><td></td></tr>
    <tr><td>toNativeSeparators(path)            </td><td></td></tr>
</table>

Other additionnal methods not provided in PhantomJS 1.9, but that
are part of the CommonJS FileSystem specification

<table>
    <tr><td>rename(path, name)                  </td><td>Implemented</td></tr>

    <tr><td>listTree(path)                      </td><td></td></tr>
    <tr><td>listDirectoryTree(path)             </td><td></td></tr>

    <tr><td>link(source, target)                </td><td></td></tr>
    <tr><td>hardLink(source, target)            </td><td></td></tr>

    <tr><td>same(source, target)                </td><td></td></tr>

    <tr><td>workingDirectoryPath()              </td><td></td></tr>

    <tr><td>normal(path)                        </td><td></td></tr>
    <tr><td>canonical(path)                     </td><td></td></tr>
    <tr><td>directory(path)                     </td><td>Implemented</td></tr>
    <tr><td>base(path)                          </td><td>Implemented</td></tr>
    <tr><td>extension(path)                     </td><td>Implemented</td></tr>
</table>


# stream object

<table>
    <tr><td>atEnd()                             </td><td></td></tr>
    <tr><td>read()                              </td><td>Implemented</td></tr>
    <tr><td>readLine()                          </td><td></td></tr>
    <tr><td>write(data)                         </td><td>Implemented</td></tr>
    <tr><td>writeLine(data)                     </td><td></td></tr>
    <tr><td>flush()                             </td><td>Implemented</td></tr>
    <tr><td>close()                             </td><td>Implemented</td></tr>
</table>

# Module: webserver

<table>
    <tr><td>create()                            </td><td>Implemented</td></tr>
</table>

# WebServer object

<table>
    <tr><td>listen(port, callback)              </td><td>Implemented. The callback is called for every http request. Don't give it if you
                                                    use one of register* methods (it calls <code>registerPrefixHandler("/", callback);</code>)</td></tr>
    <tr><td>registerFile(path, filePath)        </td><td>Implemented (SlimerJS only). Maps the given path to a file.</td></tr>
    <tr><td>registerDirectory(path, directoryPath)</td><td>Implemented (SlimerJS only). Maps a path to a dir (directoryPath)</td></tr>
    <tr><td>registerPathHandler(path, callback) </td><td>Implemented (SlimerJS only). Register a callback that will be called when an HTTP client request the given path.</td></tr>
    <tr><td>registerPrefixHandler(prefixPath, callback)</td><td>Implemented (SlimerJS only). Register a callback that will be called when an HTTP client request a path starting with prefixPath.</td></tr>
</table>

## request object

<table>
    <tr><td>method                              </td><td>Implemented</td></tr>
    <tr><td>url                                 </td><td>Implemented</td></tr>
    <tr><td>httpVersion                         </td><td>Implemented</td></tr>
    <tr><td>headers                             </td><td>Implemented</td></tr>
    <tr><td>post                                </td><td>Implemented</td></tr>
    <tr><td>postRaw                             </td><td>Implemented</td></tr>
    <tr><td>path                                </td><td>Implemented (SlimerJS only). Contains the path part of the URL (Readonly)</td></tr>
    <tr><td>queryString                         </td><td>Implemented (SlimerJS only). Contains the query part of the URL (Readonly)</td></tr>
</table>

## response object

<table>
    <tr><td>headers                             </td><td>Implemented</td></tr>
    <tr><td>header(name)                        </td><td>Implemented</td></tr>
    <tr><td>setHeader(name, value)              </td><td>Implemented</td></tr>
    <tr><td>setEncoding(encoding)               </td><td>Implemented</td></tr>
    <tr><td>statusCode                          </td><td>Implemented</td></tr>
    <tr><td>write(data)                         </td><td>Implemented</td></tr>
    <tr><td>writeHead(statusCode, headers)      </td><td>Implemented</td></tr>
    <tr><td>close()                             </td><td>Implemented</td></tr>
    <tr><td>closeGracefully()                   </td><td>Implemented</td></tr>
</table>

