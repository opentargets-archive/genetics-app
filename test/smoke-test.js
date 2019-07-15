const tests = {
  'smoke test': browser => {
    return browser
      .url('http://localhost:8080/gene/ENSG00000169174')
      .waitForElementVisible('body', 3000)
      .assert.title('PCSK9 | Open Targets Genetics')
      .end();
  },
};

module.exports = tests;
