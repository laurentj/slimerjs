SlimerJS will implement all [the API of Phantomjs](https://github.com/ariya/phantomjs/wiki/API-Reference)
except deprecated API (at least in first releases).

Here are compatibility tables and other specific API to SlimerJS.


# Command-line arguments and options

<table>
    <tr><td>--cookies-file=/path/to/cookies.txt </td><td></td></tr>
    <tr><td>--disk-cache=[yes|no]               </td><td></td></tr>
    <tr><td>--help or -h                        </td><td>Implemented</td></tr>
    <tr><td>--ignore-ssl-errors=[yes|no]        </td><td></td></tr>
    <tr><td>--load-images=[yes|no]              </td><td></td></tr>
    <tr><td>--local-to-remote-url-access=[yes|no]</td><td></td></tr>
    <tr><td>--max-disk-cache-size=size          </td><td></td></tr>
    <tr><td>--output-encoding=encoding          </td><td></td></tr>
    <tr><td>--proxy=address:port                </td><td></td></tr>
    <tr><td>--proxy-type=[http|socks5|none]     </td><td></td></tr>
    <tr><td>--script-encoding=encoding          </td><td></td></tr>
    <tr><td>--version or -v                     </td><td>Implemented</td></tr>
    <tr><td>--web-security=[yes|no]             </td><td></td></tr>
    <tr><td>--config=/path/to/config.json       </td><td></td></tr>
    <tr><td>script path                         </td><td>Implemented</td></tr>
    <tr><td>script arguments                    </td><td>Implemented</td></tr>
</table>

# phantom object

## properties

<table>
    <tr><td>args                                </td><td>deprecated in phantomjs: not implemented</td></tr>
    <tr><td>cookies                             </td><td></td></tr>
    <tr><td>cookiesEnabled                      </td><td></td></tr>
    <tr><td>libraryPath                         </td><td>Implemented</td></tr>
    <tr><td>scriptName                          </td><td>deprecated in phantomjs: not implemented</td></tr>
    <tr><td>version                             </td><td>Implemented. Gives the PhantomJS version which is compatible to
                                                        the SlimerJS implementation.</td></tr>
</table>

## methods

<table>
    <tr><td>addCookie(cookie)                   </td><td></td></tr>
    <tr><td>clearCookies()                      </td><td></td></tr>
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
    <tr><td>require(modulename)                 </td><td>Implemented
                                                    <br/>Limitation: it imports only modules from the same directory
                                                        of the launched script (or from its sub-directories)
                                                    </td></tr>
</table>

# Module: webpage

<table>
    <tr><td>create()                            </td><td>Implemented</td></tr>
</table>

# WebPage object

## properties

<table>
    <tr><td>clipRect                            </td><td></td></tr>
    <tr><td>content                             </td><td>Implemented. Setter not implemented yet</td></tr>
    <tr><td>cookies                             </td><td></td></tr>
    <tr><td>customHeaders                       </td><td></td></tr>
    <tr><td>frameContent                        </td><td></td></tr>
    <tr><td>framePlainText                      </td><td></td></tr>
    <tr><td>frameUrl                            </td><td></td></tr>
    <tr><td>libraryPath                         </td><td>Implemented</td></tr>
    <tr><td>navigationLocked                    </td><td></td></tr>
    <tr><td>paperSize                           </td><td></td></tr>
    <tr><td>plainText                           </td><td>Implemented</td></tr>
    <tr><td>scrollPosition                      </td><td></td></tr>
    <tr><td>settings                            </td><td></td></tr>
    <tr><td>url                                 </td><td>Implemented</td></tr>
    <tr><td>viewportSize                        </td><td></td></tr>
    <tr><td>zoomFactor                          </td><td></td></tr>
</table>

## methods

<table>
    <tr><td>addCookie(Cookie)                   </td><td></td></tr>
    <tr><td>clearCookies()                      </td><td></td></tr>
    <tr><td>close()                             </td><td>Implemented</td></tr>
    <tr><td>deleteCookie(cookieName)            </td><td></td></tr>
    <tr><td>evaluate(function, arg1, arg2,...)  </td><td>implemented</td></tr>
    <tr><td>evaluateASync(function, arg1, arg2,...)</td><td>implemented</td></tr>
    <tr><td>includeJs(url, callback)            </td><td>implemented</td></tr>
    <tr><td>injectJs(filename)                  </td><td>Implemented</td></tr>
    <tr><td>open(url, callback)                 </td><td>Implemented</td></tr>
    <tr><td>release()                           </td><td></td></tr>
    <tr><td>render(filename)                    </td><td></td></tr>
    <tr><td>renderBase64(format)                </td><td></td></tr>
    <tr><td>sendEvent(mouseEventType, mouseX, mouseY, button='left')</td><td></td></tr>
    <tr><td>sendEvent(keyboardEventType, keyOrKeys)</td><td></td></tr>
    <tr><td>setContent(content, url)            </td><td></td></tr>
    <tr><td>uploadFile(selector, filename)      </td><td></td></tr>
    <tr><td>onalert                             </td><td></td></tr>
    <tr><td>onCallback                          </td><td></td></tr>
    <tr><td>onClosing                           </td><td></td></tr>
    <tr><td>onConfirm                           </td><td></td></tr>
    <tr><td>onConsoleMessage                    </td><td></td></tr>
    <tr><td>onError                             </td><td></td></tr>

    <tr><td>onInitialized                       </td><td>Implemented</td></tr>
    <tr><td>onLoadFinished                      </td><td>Implemented</td></tr>
    <tr><td>onLoadStarted                       </td><td>Implemented</td></tr>
    <tr><td>onNavigationRequested               </td><td></td></tr>
    <tr><td>onPageCreated                       </td><td></td></tr>
    <tr><td>onPrompt                            </td><td></td></tr>
    <tr><td>onResourceRequested                 </td><td>Implemented</td></tr>
    <tr><td>onResourceReceived                  </td><td>Implemented</td></tr>
    <tr><td>onUrlChanged                        </td><td>Implemented</td></tr>
</table>



## request object received onResourceRequested

<table>
    <tr><td>id                                  </td><td>Implemented</td></tr>
    <tr><td>method                              </td><td>Implemented</td></tr>
    <tr><td>url                                 </td><td>Implemented</td></tr>
    <tr><td>time                                </td><td>Implemented</td></tr>
    <tr><td>headers                             </td><td></td></tr>
</table>

## response object received onResourceReceived

<table>
    <tr><td>id                                  </td><td>Implemented</td></tr>
    <tr><td>headers                             </td><td></td></tr>
    <tr><td>bodySize                            </td><td>Implemented</td></tr>
    <tr><td>contentType                         </td><td></td></tr>
    <tr><td>redirectURL                         </td><td></td></tr>
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
    <tr><td>os                                  </td><td>Implemented</td></tr>
    <tr><td>env                                 </td><td>Implemented</td></tr>
    <tr><td>args                                </td><td>Implemented</td></tr>
</table>

# Module: FileSystem

# fs object

## properties

<table>
    <tr><td>separator                           </td><td></td></tr>
    <tr><td>workingDirectory                    </td><td>Implemented as method, as specified in the
                                                    CommonJS FileSystem specification</td></tr>
</table>

## methods

<table>
    <tr><td>open(path, mode)                    </td><td>Implemented. "a" mode is still missing</td></tr>
    <tr><td>read(path)                          </td><td>Implemented</td></tr>
    <tr><td>write(path, content, mode)          </td><td>Implemented. "a" mode not implemented</td></tr>
    <tr><td>copy(source, destination)           </td><td>Implemented</td></tr>
    <tr><td>move(source, destination)           </td><td>Implemented</td></tr>
    <tr><td>remove(path)                        </td><td>Implemented</td></tr>
    <tr><td>touch(path)                         </td><td>Implemented</td></tr>


    <tr><td>makeDirectory(path)                 </td><td>Implemented</td></tr>
    <tr><td>removeDirectory(path)               </td><td>Implemented</td></tr>
    <tr><td>makeTree(path)                      </td><td></td></tr>
    <tr><td>removeTree(path)                    </td><td></td></tr>
    <tr><td>copyTree(source, destination)       </td><td></td></tr>

    <tr><td>list(path)                          </td><td>Implemented</td></tr>
    <tr><td>readLink(path)                      </td><td></td></tr>


    <tr><td>exists(path)                        </td><td>Implemented</td></tr>
    <tr><td>isFile(path)                        </td><td>Implemented</td></tr>
    <tr><td>isDirectory(path)                   </td><td>Implemented</td></tr>
    <tr><td>isLink(path)                        </td><td>Implemented</td></tr>
    <tr><td>isReadable(path)                    </td><td>Implemented</td></tr>
    <tr><td>isWritable(path)                    </td><td>Implemented</td></tr>

    <tr><td>absolute(path)                      </td><td></td></tr>

    <tr><td>size(path)                          </td><td>Implemented</td></tr>

    <tr><td>isAbsolute(path)                    </td><td>(not a CommonJS FileSystem method)</td></tr>
    <tr><td>isExecutable(path)                  </td><td>(not a CommonJS FileSystem method)</td></tr>

    <tr><td>changeWorkingDirectory(path)        </td><td>Implemented</td></tr>
</table>

Other additionnal methods not provided in PhantomJS 1.7, but that
are part of the CommonJS FileSystem specification

<table>

    <tr><td>rename(path, name)                  </td><td>Implemented</td></tr>

    <tr><td>listTree(path)                      </td><td></td></tr>
    <tr><td>listDirectoryTree(path)             </td><td></td></tr>

    <tr><td>link(source, target)                </td><td></td></tr>
    <tr><td>hardLink(source, target)            </td><td></td></tr>

    <tr><td>same(source, target)                </td><td></td></tr>

    <tr><td>lastModified(path) Date             </td><td></td></tr>

    <tr><td>workingDirectoryPath()              </td><td></td></tr>

    <tr><td>join(base)                          </td><td>Implemented</td></tr>
    <tr><td>split(path)                         </td><td></td></tr>
    <tr><td>normal(path)                        </td><td></td></tr>
    <tr><td>canonical(path)                     </td><td></td></tr>
    <tr><td>directory(path)                     </td><td></td></tr>
    <tr><td>base(path)                          </td><td></td></tr>
    <tr><td>extension(path)                     </td><td></td></tr>
</table>


# stream object

<table>
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

