
How to contribute to SlimerJS
=============================

If you want to provide modification on the source code of SlimerJS, or
any other files stored in the git repository, please follow these guidelines.

To propose any changes, you should:

- "Fork" the repository into your github account
- **create a dedicated branch** from the master branch or from
  the latest stable branch.
  DO NOT commit your changes directly into the master or stable branch
  in your repository. It will be easier to propose several improvements,
  to improve your changes etc...
- **make your changes**. Follow the current coding style: indentation with 4 spaces,
  UTF-8 encoding...
- **add unit tests** in the test directory
- commit your modifications into this dedicated branch
- **test your changes** (see below)
- **run unit tests**: all should be green (see below)

If you want to propose several bug fixes or several improvements,
**create a branch for each of them**.

Unless you fix a typo or a very little bug, please **open an issue**
on github.

If this is a significant change, please **let's discuss about it on the
mailing-list** before proposing your changes.

After you made your changes, **do a "pull request"** of your branch on
http://github.com/laurentj/slimerjs. SlimerJS's developers will then
comment your modifications. Probably you've been asked to correct
your code. *Do not be upset*. This is called "code review" and this is
an usual process in software quality assurance ;-).

Run unit tests!
---------------

You don't need to create package of SlimerJS to use it and to test it.
Just call src/slimerjs. If it does not find Firefox or XulRunner, indicate
the path of Firefox or XulRunner into a SLIMERJSLAUNCHER environment variable
(see the installation chapter in the documentation).

Unit tests are scripts that tests almost all features of SlimerJS. If you make
a change in the source code, running unit tests allows you to see if you
didn't introduce regressions. And you should add tests that test your changes.

To run tests, just launch

    src/slimerjs  test/main-tests.js

