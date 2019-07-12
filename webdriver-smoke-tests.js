const webdriver = require('selenium-webdriver');

// Input capabilities
const capabilities = {
  browserName: 'IE',
  browser_version: '11.0',
  os: 'Windows',
  os_version: '10',
  resolution: '1024x768',
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
  name: 'Smoke Tests',
};

var driver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(capabilities)
  .build();

driver
  .get('https://genetics.opentargets.org/gene/ENSG00000169174')
  .then(function() {
    driver.sleep(5000);
    driver.getTitle().then(function(title) {
      driver.quit();
      if (title === 'PCSK9 | Open Targets Genetics') {
        process.exit(0);
      } else {
        process.exit(2);
      }
    });
  })
  .catch(err => {
    driver.quit();
    process.stderr.write(err.stack + '\n');
    process.exit(2);
  });
