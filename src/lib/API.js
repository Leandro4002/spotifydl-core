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
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const Atrist_1 = __importDefault(require("./details/Atrist"));
const Playlist_1 = __importDefault(require("./details/Playlist"));
const Track_1 = __importDefault(require("./details/Track"));
const MAX_LIMIT_DEFAULT = 50;
const REFRESH_ACCESS_TOKEN_SECONDS = 55 * 60;
class SpotifyApi {
    constructor(auth) {
        this.auth = auth;
        this.verifyCredentials = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.nextTokenRefreshTime || this.nextTokenRefreshTime < new Date()) {
                this.nextTokenRefreshTime = new Date();
                this.nextTokenRefreshTime.setSeconds(this.nextTokenRefreshTime.getSeconds() + REFRESH_ACCESS_TOKEN_SECONDS);
                yield this.checkCredentials();
            }
        });
        this.checkCredentials = () => __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.spotifyAPI.getRefreshToken()))
                return void (yield this.requestTokens());
            yield this.refreshToken();
        });
        this.requestTokens = () => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.spotifyAPI.clientCredentialsGrant()).body;
            this.spotifyAPI.setAccessToken(data['access_token']);
            this.spotifyAPI.setRefreshToken(data['refresh_token']);
        });
        this.refreshToken = () => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.spotifyAPI.refreshAccessToken()).body;
            this.spotifyAPI.setAccessToken(data['access_token']);
        });
        this.extractTrack = (trackId) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.spotifyAPI.getTrack(trackId)).body;
            const details = new Track_1.default();
            details.name = data.name;
            data.artists.forEach((artist) => {
                details.artists.push(artist.name);
            });
            details.album_name = data.album.name;
            details.release_date = data.album.release_date;
            details.cover_url = data.album.images[0].url;
            return details;
        });
        this.extractPlaylist = (playlistId) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.spotifyAPI.getPlaylist(playlistId)).body;
            const details = new Playlist_1.default('', 0, data.tracks.items.map((item) => item.track.id));
            details.name = data.name + ' - ' + data.owner.display_name;
            details.total_tracks = data.tracks.total;
            if (data.tracks.next) {
                let offset = details.tracks.length;
                while (details.tracks.length < details.total_tracks) {
                    const playlistTracksData = (yield this.spotifyAPI.getPlaylistTracks(playlistId, { limit: MAX_LIMIT_DEFAULT, offset: offset })).body;
                    details.tracks = details.tracks.concat(playlistTracksData.items.map((item) => item.track.id));
                    offset += MAX_LIMIT_DEFAULT;
                }
            }
            return details;
        });
        this.extractAlbum = (albumId) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.spotifyAPI.getAlbum(albumId)).body;
            const details = new Playlist_1.default('', 0, data.tracks.items.map((item) => item.id));
            details.name = data.name + ' - ' + data.label;
            details.total_tracks = data.tracks.total;
            if (data.tracks.next) {
                let offset = details.tracks.length;
                while (details.tracks.length < data.tracks.total) {
                    const albumTracks = (yield this.spotifyAPI.getAlbumTracks(albumId, { limit: MAX_LIMIT_DEFAULT, offset: offset })).body;
                    details.tracks = details.tracks.concat(albumTracks.items.map((item) => item.id));
                    offset += MAX_LIMIT_DEFAULT;
                }
            }
            return details;
        });
        this.extractArtist = (artistId) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.spotifyAPI.getArtist(artistId)).body;
            return new Atrist_1.default(data.id, data.name, data.href);
        });
        this.extractArtistAlbums = (artistId) => __awaiter(this, void 0, void 0, function* () {
            const artistAlbums = (yield this.spotifyAPI.getArtistAlbums(artistId, { limit: MAX_LIMIT_DEFAULT })).body;
            let albums = artistAlbums.items;
            if (artistAlbums.next) {
                let offset = albums.length;
                while (albums.length < artistAlbums.total) {
                    const additionalArtistAlbums = (yield this.spotifyAPI.getArtistAlbums(artistId, { limit: MAX_LIMIT_DEFAULT, offset: offset })).body;
                    albums = albums.concat(additionalArtistAlbums.items);
                    offset += MAX_LIMIT_DEFAULT;
                }
            }
            return albums;
        });
        this.getUser = (id) => __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCredentials();
            return yield this.spotifyAPI.getUser(id);
        });
        this.spotifyAPI = new spotify_web_api_node_1.default(this.auth);
    }
}
exports.default = SpotifyApi;
