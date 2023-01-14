"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpotifyDlError extends Error {
    constructor(message, name = 'TypeError') {
        super();
        this.message = message;
        this.name = name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = SpotifyDlError;
