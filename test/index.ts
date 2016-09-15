import expect = Chai.ExpectStatic;

describe('my awesome website', (): any => {
  it('should do some chai assertions', (): any => {
    browser.url('http://www.google.fr');
    expect(browser.getTitle()).to.be.equal('WebdriverIO');
  });
});
