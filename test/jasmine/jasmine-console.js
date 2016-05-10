
// This console reporter comes from the PhantomJS project.
// LICENCE ?
// author: ivan.de.marino@gmail.com ?
//     inspired by mhevery's jasmine-node reporter
//     https://github.com/mhevery/jasmine-node
// contributor: Laurent Jouanneau (changed the output & fixed some issues)

jasmine.ConsoleReporter = function(print, doneCallback, showColors) {

  doneCallback = doneCallback || function() {};

  var ansi = {
      green: '\x1B[32m',
      red: '\x1B[31m',
      yellow: '\x1B[33m',
      none: '\x1B[0m'
    },
    language = {
      spec: "spec",
      failure: "failure"
    };

  function coloredStr(color, str) {
    return showColors ? (ansi[color] + str + ansi.none) : str;
  }

  function greenStr(str) {
    return coloredStr("green", str);
  }

  function redStr(str) {
    return coloredStr("red", str);
  }

  function yellowStr(str) {
    return coloredStr("yellow", str);
  }

  function newline() {
    print("\n");
  }

  function yellowStar() {
    print(yellowStr("*"));
  }

  function plural(str, count) {
    return count == 1 ? str : str + "s";
  }

  function repeat(thing, times) {
    var arr = [];
    for (var i = 0; i < times; i++) {
      arr.push(thing);
    }
    return arr;
  }

  function indent(str, spaces) {
    var lines = (str || '').split("\n");
    var newArr = [];
    for (var i = 0; i < lines.length; i++) {
      newArr.push(repeat(" ", spaces).join("") + lines[i]);
    }
    return newArr.join("\n");
  }

  function summary(colorF, specs, failed) {
    print(colorF(specs + " " + plural(language.spec, specs) + ", " +
      failed + " " + plural(language.failure, failed)));
  }

  function greenSummary(specs, failed) {
    summary(greenStr, specs, failed);
  }

  function redSummary(specs, failed) {
    summary(redStr, specs, failed);
  }

  function fullSuiteDescription(suite) {
    var fullDescription = suite.description;
    if (suite.parentSuite) fullDescription = fullSuiteDescription(suite.parentSuite) + " " + fullDescription;
    return fullDescription;
  }

  this.now = function() {
    return new Date().getTime();
  };

  this.reportRunnerStarting = function() {
    this.runnerStartTime = this.now();
    print("Started");
    newline();
  };

  this.reportSpecStarting = function() { /* do nothing */
  };


  this.reportSpecResults = function(spec) {
    var results = spec.results();
    var title = ' ' + spec.suite.description + ': ' + spec.description;
    var id = spec.id +1;
    if (results.skipped) {
        print(yellowStr( '*' + id + ' SKIPPED') + title);
    } else {
      if (results.passed()) {
        print(greenStr( '#' + id + ' PASS') + title + ' ('+results.passedCount+'/'+results.totalCount+')');
      } else {
        print(redStr('#' + id + ' FAIL' + title + ' ('+results.passedCount+'/'+results.totalCount+')'));
        results.getItems().forEach(function(result, i){
          if (result.passed_) {
            //print(indent((i+1)+': ' + greenStr(result.message), 2));
          }else {
            print(indent((i+1)+': ' + redStr(result.message), 2));
          }
        })
      }
    }
  };

  this.suiteResults = [];

  this.reportSuiteResults = function(suite) {
    var suiteResult = {
      description: fullSuiteDescription(suite),
      failedSpecResults: []
    };

    suite.results().items_.forEach(function(spec) {
      if (spec.failedCount > 0 && spec.description)
        suiteResult.failedSpecResults.push(spec);
    });
    if (suiteResult.failedSpecResults.length)
        this.suiteResults.push(suiteResult);
  };

  function eachSpecFailure(suiteResults, callback) {
    for (var i = 0; i < suiteResults.length; i++) {
      var suiteResult = suiteResults[i];
      for (var j = 0; j < suiteResult.failedSpecResults.length; j++) {
        var failedSpecResult = suiteResult.failedSpecResults[j];
        print(redStr(suiteResult.description + " " + failedSpecResult.description));
        failedSpecResult.getItems().forEach(function(failedResult, k){
            if (failedResult.passed_)
                return
            print(indent(failedResult.message, 2));
            var stack = failedResult.trace.stack;
            if (stack) {
                try {
                    showStack(stack);
                }
                catch(e) {
                    print(e)
                }
                
            }
            else {
                print(indent("Sorry, no stack",4))
            }
        })
      }
    }
  }

  function showStack(stack) {
    var r = /^\s*(.*)@(.*):(\d+)\s*$/gm;
    var m, a = [];
    // exemple of stack with mozilla
    // bla@resource://slimerjs/addon-sdk/loader.jsm -> file:///home/laurent/projets/slimerjs/test/initial-tests.js:130
    // @resource://slimerjs/addon-sdk/loader.jsm -> file:///home/laurent/projets/slimerjs/test/initial-tests.js:134
    // evaluate@resource://slimerjs/addon-sdk/loader.jsm:180

    while ((m = r.exec(stack))) {
        if (m[1].startsWith('jasmine.'))
            continue;
        if (m[2].indexOf('->') != -1) {
            m[2] = m[2].split('->')[1].trim();
        }
        print(indent(m[0], 4));
    }
  }
  
  
  this.reportRunnerResults = function(runner) {

    if (this.suiteResults.length) {
        newline();
        print("------------------------ failures details");
        eachSpecFailure(this.suiteResults);
    }

    print("------------------------");
    newline();
    print("Finished in " + ((this.now() - this.runnerStartTime) / 1000) + " seconds");

    var results = runner.results();
    var summaryFunction = results.failedCount === 0 ? greenSummary : redSummary;
    summaryFunction(runner.specs().length, results.failedCount);
    doneCallback(runner);
  };
};