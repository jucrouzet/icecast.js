"use strict";
/**
 * Various utilies.
 */
exports.__esModule = true;
/**
 * Camel-Case a string.
 *
 * @todo Handle unicodes
 */
function camelize(value, firstCharLower) {
    if (firstCharLower === void 0) { firstCharLower = true; }
    return value
        .split(/[^a-z0-9]+/i)
        .map(function (part, i) {
        var firstLetter = part.substr(0, 1);
        return ((firstCharLower && i === 0) ? firstLetter.toLowerCase() : firstLetter.toUpperCase()) + part.substr(1).toLowerCase();
    })
        .join('');
}
exports.camelize = camelize;
/**
 * Types checks.
 */
//tslint:disable: no-any
/**
 * If value a string.
 */
function isString(value) {
    return (typeof value === 'string');
}
exports.isString = isString;
/**
 * If value a not-empty string.
 */
function isNotEmptyString(value) {
    return (isString(value) && (value.length > 0));
}
exports.isNotEmptyString = isNotEmptyString;
/**
 * If value undefined.
 */
function isUndefined(value) {
    return (value === undefined);
}
exports.isUndefined = isUndefined;
/**
 * If value an object.
 */
function isObject(value) {
    return (typeof value === 'object');
}
exports.isObject = isObject;
/**
 * If value is a function.
 */
function isFunction(value) {
    return (typeof value === 'function');
}
exports.isFunction = isFunction;
//tslint:enable: no-any
