"use strict";
exports.__esModule = true;
var Utils = require("./utils");
var LogLevel = require("loglevel");
LogLevel.setLevel(__LOG_LEVEL__);
var prefix = require('loglevel-plugin-prefix'); //tslint:disable-line: no-any no-var-requires
prefix.apply(LogLevel, {
    template: '%n',
    nameFormatter: function (name) {
        if (Utils.isUndefined(name)) {
            return '';
        }
        return "[" + name + "]: ";
    }
});
/**
 * Get a named logger instance.
 */
function logger(instanceName) {
    var name = (Utils.isUndefined(instanceName)) ? 'Icecast.js' : "Icecast.js/" + instanceName;
    var instance = LogLevel.getLogger(name);
    instance.setLevel(__LOG_LEVEL__);
    return instance;
}
exports.logger = logger;
