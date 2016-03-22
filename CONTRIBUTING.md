
How to fill an issue
====================

When you find a bug in SlimerJS, and post an issue on github, please:

- Indicate which version of SlimerJS you are using, on which operating system
  you execute it, and if you are using Firefox with SlimerJS, which version of Firefox.
- Saying only "it doesn't work", is not a valid report. Please describe how the issue
  has appeared, what are the error messages, what it is displayed. etc. Execute
  SlimerJS with `--debug=true` to see more messages.
- Explain how to reproduce it, with the most minimal code. More your example
  will be tiny, more there is chance that the bug will be fixed quickly.


How to contribute to SlimerJS
=============================

If you want to provide modification on the source code of SlimerJS, or
any other files stored in the git repository, please follow these guidelines.

To propose any changes, you should:

- If this is a significant change, please **let's discuss about it on the
  mailing-list** before proposing your changes.
- **open an issue** to explain the issue you'll fix (except if it is a change about
  the documentation or the web site, and except if you fix a typo or a very little bug
  in the source code).
- "Fork" the repository into your github account
- **create a dedicated branch** from the master branch or from
  the latest stable branch.
  DO NOT commit your changes directly into the master or stable branch
  in your repository. It will be easier to propose several improvements,
  to improve your changes etc...
- **make your changes**. Follow the coding style of the file you change: indentation,
  UTF-8 encoding...
- **add unit tests** in the test directory if it is relevant for your change
- **test your changes** (see below)
- **run unit tests**: all should be green (see below)
- **Update the documentation** if necessary (new API, changes in the API etc).
- commit your modifications into the branch you created

If you want to propose several bug fixes or several improvements,
**create a branch for each of them**.

After you made your changes, **do a "pull request"** of your branch on
http://github.com/laurentj/slimerjs. SlimerJS's developers will then
comment your modifications. Probably you've been asked to correct
your code. *Do not be upset*. This is called "code review" and this is
an usual process in software quality assurance ;-).

And remember: the more you follow these guidelines, the more you'll have chance
to have your contribution accepted (and quickly) ;-)

Run unit tests!
---------------

You don't need to create package of SlimerJS to use it and to test it.
Just call the script *src/slimerjs*. If it does not find Firefox, indicate
the path of Firefox into a SLIMERJSLAUNCHER environment variable
(see the installation chapter in the documentation).

Unit tests are scripts that tests almost all features of SlimerJS. If you make
a change in the source code, running unit tests allows you to see if you
didn't introduce regressions. And you should add tests... that test your changes.

To run tests, just launch

    src/slimerjs  test/launch-main-tests.js
    src/slimerjs  test/launch-rendering-tests.js

We use the test framework [Jasmine](http://pivotal.github.io/jasmine/).
