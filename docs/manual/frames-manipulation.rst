
================================
Manipulating frames with webpage
================================

A web page may have different frames, and even some frames inside frames. If you want
to do things related to a specific frame, like evaluating code, the `webpage <../api/webpage.html>`_
object have some methods to select the frame you want to work with.

These methods are:

  - `webpage.switchToFocusedFrame() <../api/webpage.html#webpage-switchtofocusedframe>`_:
    to select the frame that has the focus. You can retrieve its name with
    `webpage.focusedFrameName <../api/webpage.html#webpage-focusedframename>`_.
  - `webpage.switchToFrame(framename) <../api/webpage.html#webpage-switchtoframe>`_ (or
    ``webpage.switchToChildFrame()``): to select a frame (in the current frame) that has
    the given name. You can retrieve the list of frame names with `framesName <../api/webpage.html#webpage-framesname>`_,
    and the count with `framesCount <../api/webpage.html#webpage-framescount>`_.
  - `webpage.switchToParentFrame() <../api/webpage.html#webpage-switchtoparentframe>`_: to select
    the parent frame of the current frame
  - `webpage.switchToMainFrame() <../api/webpage.html#webpage-switchtomainframe>`_: to return to
    the main frame (i.e. the root window)

Exemple to select an frame
--------------------------

.. code-block:: html

    root window:
    <frameset>
      <frame name="f1" src="frame1.html" />
      <frame name="f2" src="frame2.html" />
    </frameset>

.. code-block:: html

    frame1.html:
    <html>... <iframe name="f3" src="frame3.html">... </html>

.. code-block:: html

    frame2.html and frame3.html:
    <html>... simple web page ....</html>


To select frame2.html, you'll do:

.. code-block:: javascript

    webpage.switchToFrame('f2');

If you want to select the frame3.html after that, you'll do:

.. code-block:: javascript

    // first return to the parent frame
    webpage.switchToParentFrame(); // or switchToMainFrame() in this example
    
    // then select frame1.html because frame3.html is a child of it
    webpage.switchToFrame('f1');
    
    // then select frame3.html
    webpage.switchToFrame('f3');

Manipulating the current frame
-------------------------------

After selecting a frame, you have some properties to retrieve the frame properties:
`webpage.frameContent <../api/webpage.html#webpage-framecontent>`_,
`webpage.frameTitle <../api/webpage.html#webpage-frametitle>`_,
`webpage.frameName <../api/webpage.html#webpage-framename>`_,
`webpage.frameUrl <../api/webpage.html#webpage-frameurl>`_,
`webpage.framePlainText <../api/webpage.html#webpage-frameplaintext>`_.


And you can evaluate javascript in the current frame with 
`evaluateJavaScript() <../api/webpage.html#webpage-evaluatejavadcript>`_,
`evaluate() <../api/webpage.html#webpage-evaluate>`_,
`evaluateAsync() <../api/webpage.html#webpage-evaluateasync>`_,
`includeJs() <../api/webpage.html#webpage-includejs>`_ or
`injectJs() <../api/webpage.html#webpage-injectjs>`_


