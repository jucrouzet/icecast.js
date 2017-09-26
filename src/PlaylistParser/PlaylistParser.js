"use strict";
exports.__esModule = true;
/**
 * Playlist parsers base class.
 */
var APlaylistParser = /** @class */ (function () {
    /**
     * Constructor.
     *
     * @param data Playlist file data.
     */
    function APlaylistParser(data) {
        if (data.length === 0) {
            throw new Error('Empty playlist file');
        }
        this.content = data;
        this.streams = [];
    }
    /**
     * Generate a default stream with empty data for non EXTM3U streams.
     */
    APlaylistParser.createDefaultStream = function () {
        return {
            title: '',
            duration: -1,
            description: '',
            metas: {},
            streamUrl: ''
        };
    };
    /**
     * Get playlist streams.
     */
    APlaylistParser.prototype.getStreams = function () {
        return this.streams;
    };
    return APlaylistParser;
}());
exports.APlaylistParser = APlaylistParser;
