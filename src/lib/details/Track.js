"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TrackDetails {
    constructor(name = '', artists = [], album_name = '', release_date = '', cover_url = '') {
        this.name = name;
        this.artists = artists;
        this.album_name = album_name;
        this.release_date = release_date;
        this.cover_url = cover_url;
    }
}
exports.default = TrackDetails;
