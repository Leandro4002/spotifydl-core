"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Playlist {
    constructor(name = '', total_tracks = 0, tracks = []) {
        this.name = name;
        this.total_tracks = total_tracks;
        this.tracks = tracks;
    }
}
exports.default = Playlist;
