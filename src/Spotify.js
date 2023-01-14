"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const API_1 = __importDefault(require("./lib/API"));
const download_1 = require("./lib/download");
const Error_1 = __importDefault(require("./lib/Error"));
const getYtlink_1 = __importDefault(require("./lib/getYtlink"));
const metadata_1 = __importDefault(require("./lib/metadata"));
class SpotifyFetcher extends API_1.default {
    constructor(auth) {
        super(auth);
        /**
         * Get the track details of the given track URL
         * @param url
         * @returns {SongDetails} Track
         */
        this.getTrack = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            return yield this.extractTrack(this.getID(url));
        });
        /**
         * Gets the info the given album URL
         * @param url
         * @returns {Playlist} Album
         */
        this.getAlbum = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            return yield this.extractAlbum(this.getID(url));
        });
        /**
         * Gets the info of the given Artist URL
         * @param url
         * @returns {Artist} Artist
         */
        this.getArtist = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            return yield this.extractArtist(this.getID(url));
        });
        /**
         * Gets the list of albums from the given Artists URL
         * @param url
         * @returns {Playlist[]} Albums
         */
        this.getArtistAlbums = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            const artistResult = yield this.getArtist(url);
            const albumsResult = yield this.extractArtistAlbums(artistResult.id);
            const albumIds = albumsResult.map((album) => album.id);
            const albumInfos = [];
            for (let x = 0; x < albumIds.length; x++) {
                albumInfos.push(yield this.extractAlbum(albumIds[x]));
            }
            return {
                albums: albumInfos,
                artist: artistResult
            };
        });
        /**
         * Gets the playlist info from URL
         * @param url URL of the playlist
         * @returns
         */
        this.getPlaylist = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            return yield this.extractPlaylist(this.getID(url));
        });
        this.getID = (url) => {
            const splits = url.split('/');
            return splits[splits.length - 1];
        };
        /**
         * Downloads the given spotify track
         * @param url Url to download
         * @param filename file to save to
         * @returns `buffer` if no filename is provided and `string` if it is
         */
        this.downloadTrack = (url, filename) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            const info = yield this.getTrack(url);
            const link = yield (0, getYtlink_1.default)(`${info.name} ${info.artists[0]}`);
            if (!link)
                throw new Error_1.default(`Couldn't get a download URL for the track: ${info.name}`);
            const data = yield (0, download_1.downloadYTAndSave)(link, filename);
            yield (0, metadata_1.default)(info, data);
            if (!filename) {
                const buffer = yield fs_extra_1.promises.readFile(data);
                (0, fs_extra_1.unlink)(data);
                /* eslint-disable @typescript-eslint/no-explicit-any */
                return buffer;
            }
            /* eslint-disable @typescript-eslint/no-explicit-any */
            return data;
        });
        /**
         * Gets the Buffer of track from the info
         * @param info info of the track got from `spotify.getTrack()`
         * @returns
         */
        this.downloadTrackFromInfo = (info) => __awaiter(this, void 0, void 0, function* () {
            const link = yield (0, getYtlink_1.default)(`${info.name} ${info.artists[0]}`);
            if (!link)
                throw new Error_1.default(`Couldn't get a download URL for the track: ${info.name}`);
            return yield (0, download_1.downloadYT)(link);
        });
        this.downloadBatch = (url, type) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            const playlist = yield this[type === 'album' ? 'getAlbum' : 'getPlaylist'](url);
            return Promise.all(playlist.tracks.map((track) => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.downloadTrack(track);
                }
                catch (err) {
                    return '';
                }
            })));
        });
        /**
         * Downloads the tracks of a playlist
         * @param url URL of the playlist
         * @returns `Promise<(string|Buffer)[]>`
         */
        this.downloadPlaylist = (url) => __awaiter(this, void 0, void 0, function* () { return yield this.downloadBatch(url, 'playlist'); });
        /**
         * Downloads the tracks of a Album
         * @param url URL of the Album
         * @returns `Promise<(string|Buffer)[]>`
         */
        this.downloadAlbum = (url) => __awaiter(this, void 0, void 0, function* () { return yield this.downloadBatch(url, 'album'); });
        /**
         * Gets the info of tracks from playlist URL
         * @param url URL of the playlist
         */
        this.getTracksFromPlaylist = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            const playlist = yield this.getPlaylist(url);
            const tracks = yield Promise.all(playlist.tracks.map((track) => this.getTrack(track)));
            return {
                name: playlist.name,
                total_tracks: playlist.total_tracks,
                tracks
            };
        });
        /**
         * Gets the info of tracks from Album URL
         * @param url URL of the playlist
         */
        this.getTracksFromAlbum = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            const playlist = yield this.getAlbum(url);
            const tracks = yield Promise.all(playlist.tracks.map((track) => this.getTrack(track)));
            return {
                name: playlist.name,
                total_tracks: playlist.total_tracks,
                tracks
            };
        });
        this.getSpotifyUser = (id) => __awaiter(this, void 0, void 0, function* () { return yield this.getUser(id); });
    }
}
exports.default = SpotifyFetcher;
