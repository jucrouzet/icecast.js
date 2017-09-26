import * as Utils from '../../src/utils';

import {expect} from 'chai';

const call = (name: string, ...args: any[]): () => void => () => {
  (<any>Utils)[name].apply(null, args);
};

describe('#camelize()', () => {
  it('should accept valid arguments', () => {
    expect(call('camelize', 'lol')).to.not.throw();
    expect(call('camelize', '')).to.not.throw();
    expect(call('camelize', '', true)).to.not.throw();
    expect(call('camelize', '', false)).to.not.throw();
  });

  it('should work as expected', () => {
    expect(Utils.camelize('ok')).to.be.equal('ok');
    expect(Utils.camelize('hello world')).to.be.equal('helloWorld');
    expect(Utils.camelize(' hello world')).to.be.equal('helloWorld');
    expect(Utils.camelize('hello world', true)).to.be.equal('helloWorld');
    expect(Utils.camelize('hello world', false)).to.be.equal('HelloWorld');
    expect(Utils.camelize('')).to.be.equal('');
    expect(Utils.camelize('<test> ok')).to.be.equal('testOk');
  });
});

describe('#isString()', () => {
  it('should accept any arguments', () => {
    expect(call('isString')).to.not.throw();
    expect(call('isString', '')).to.not.throw();
    expect(call('isString', 'hello world')).to.not.throw();
    expect(call('isString', {})).to.not.throw();
    expect(call('isString', true)).to.not.throw();
    expect(call('isString', undefined)).to.not.throw();
    expect(call('isString', 5)).to.not.throw();
    expect(call('isString', () => {})).to.not.throw();
  });

  it('should work as expected', () => {
    expect(Utils.isString('')).to.be.equal(true);
    expect(Utils.isString('<test> ok')).to.be.equal(true);
    expect(Utils.isString({})).to.be.equal(false);
    expect(Utils.isString(undefined)).to.be.equal(false);
    expect(Utils.isString(5)).to.be.equal(false);
    expect(Utils.isString(() => {})).to.be.equal(false);
  });
});

describe('#isNotEmptyString()', () => {
  it('should accept any arguments', () => {
    expect(call('isNotEmptyString')).to.not.throw();
    expect(call('isNotEmptyString', '')).to.not.throw();
    expect(call('isNotEmptyString', 'hello world')).to.not.throw();
    expect(call('isNotEmptyString', {})).to.not.throw();
    expect(call('isNotEmptyString', true)).to.not.throw();
    expect(call('isNotEmptyString', undefined)).to.not.throw();
    expect(call('isNotEmptyString', 5)).to.not.throw();
    expect(call('isNotEmptyString', () => {})).to.not.throw();
  });

  it('should work as expected', () => {
    expect(Utils.isNotEmptyString('')).to.be.equal(false);
    expect(Utils.isNotEmptyString('<test> ok')).to.be.equal(true);
    expect(Utils.isNotEmptyString({})).to.be.equal(false);
    expect(Utils.isNotEmptyString(undefined)).to.be.equal(false);
    expect(Utils.isNotEmptyString(5)).to.be.equal(false);
    expect(Utils.isNotEmptyString(() => {})).to.be.equal(false);
  });
});

describe('#isUndefined()', () => {
  it('should accept any arguments', () => {
    expect(call('isUndefined')).to.not.throw();
    expect(call('isUndefined', '')).to.not.throw();
    expect(call('isUndefined', 'hello world')).to.not.throw();
    expect(call('isUndefined', {})).to.not.throw();
    expect(call('isUndefined', true)).to.not.throw();
    expect(call('isUndefined', undefined)).to.not.throw();
    expect(call('isUndefined', 5)).to.not.throw();
    expect(call('isUndefined', () => {})).to.not.throw();
  });

  it('should work as expected', () => {
    expect(Utils.isUndefined('')).to.be.equal(false);
    expect(Utils.isUndefined('<test> ok')).to.be.equal(false);
    expect(Utils.isUndefined({})).to.be.equal(false);
    expect(Utils.isUndefined(undefined)).to.be.equal(true);
    expect(Utils.isUndefined(0)).to.be.equal(false);
    expect(Utils.isUndefined(() => {})).to.be.equal(false);
  });
});

describe('#isObject()', () => {
  it('should accept any arguments', () => {
    expect(call('isObject')).to.not.throw();
    expect(call('isObject', '')).to.not.throw();
    expect(call('isObject', 'hello world')).to.not.throw();
    expect(call('isObject', {})).to.not.throw();
    expect(call('isObject', true)).to.not.throw();
    expect(call('isObject', undefined)).to.not.throw();
    expect(call('isObject', 5)).to.not.throw();
    expect(call('isObject', () => {})).to.not.throw();
  });

  it('should work as expected', () => {
    expect(Utils.isObject('')).to.be.equal(false);
    expect(Utils.isObject('<test> ok')).to.be.equal(false);
    expect(Utils.isObject({})).to.be.equal(true);
    expect(Utils.isObject(undefined)).to.be.equal(false);
    expect(Utils.isObject(0)).to.be.equal(false);
    expect(Utils.isObject(() => {})).to.be.equal(false);
  });
});

describe('#isFunction()', () => {
  it('should accept any arguments', () => {
    expect(call('isFunction')).to.not.throw();
    expect(call('isFunction', '')).to.not.throw();
    expect(call('isFunction', 'hello world')).to.not.throw();
    expect(call('isFunction', {})).to.not.throw();
    expect(call('isFunction', true)).to.not.throw();
    expect(call('isFunction', undefined)).to.not.throw();
    expect(call('isFunction', 5)).to.not.throw();
    expect(call('isFunction', () => {})).to.not.throw();
  });

  it('should work as expected', () => {
    expect(Utils.isFunction('')).to.be.equal(false);
    expect(Utils.isFunction('<test> ok')).to.be.equal(false);
    expect(Utils.isFunction({})).to.be.equal(false);
    expect(Utils.isFunction(undefined)).to.be.equal(false);
    expect(Utils.isFunction(0)).to.be.equal(false);
    expect(Utils.isFunction(() => {})).to.be.equal(true);
  });
});
