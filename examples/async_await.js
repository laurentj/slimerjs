const webserver = require("webserver");
const webpage = require("webpage");
const system = require('system');

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  page = webpage.create();
  var isLoading = false;

  page.onLoadStarted = (url, isFrame) => {
    console.log(`Loading: ${url}`);
    isLoading = true;
  };

  page.onLoadFinished = (status, url, isFrame) => {
    console.log(`Loaded ${url}  (${status})`);
    isLoading = false;
  };

  page.onConsoleMessage = (message, line, file) => {
    console.log(`LOG: ${message} -- ${file}:${line}`);
  };

  await page.open('https://news.ycombinator.com');

  await page.evaluate(() => {
    var field = document.querySelector('input[name=q]');
    field.value = "Slimerjs";

    console.log('Searching "Slimerjs" on HackerNews');

    field.parentNode.submit();
  });

  console.log(`Waiting saerch results page to load`);

  while (!page.url.match(/Slimerjs/i) || isLoading || !page.plainText.match(/Slimerjs/i)) {
    await sleep(300);
    system.stdout.write('.');
  }
  system.stdout.write('\n');

  console.log(`Page content:\n${page.plainText}`);

  slimer.exit();
})().catch(error => {
  if (error.message && error.stack) {
    console.log(`Script Error: ${error.constructor.prototype.name}: ${error.message}`);
    error.stack.split("\n").forEach(line => {
      if (line.trim() != "") {
        console.log(`         -> ${line}`);
      }
    });
  } else {
    console.log(`Script Error: ${error}`);
  }
  slimer.exit(1);
});
