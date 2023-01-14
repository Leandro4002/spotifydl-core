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
exports.getBufferFromUrl = exports.downloadYTAndSave = exports.downloadYT = void 0;
const os_1 = __importDefault(require("os"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const Error_1 = __importDefault(require("./Error"));
const fs_extra_1 = require("fs-extra");
const axios_1 = __importDefault(require("axios"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
/**
 * Function to download the give `YTURL`
 * @param {string} url The youtube URL to download
 * @returns `Buffer`
 * @throws Error if the URL is invalid
 */
const downloadYT = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ytdl_core_1.default.validateURL(url))
        throw new Error_1.default('Invalid YT URL', 'SpotifyDlError');
    const filename = `${os_1.default.tmpdir()}/${Math.random().toString(36).slice(-5)}.mp3`;
    const stream = (0, ytdl_core_1.default)(url, {
        quality: 'highestaudio',
        filter: 'audioonly'
    });
    return yield new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(stream)
            .audioBitrate(128)
            .save(filename)
            .on('error', (err) => reject(err))
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            const buffer = yield (0, fs_extra_1.readFile)(filename);
            (0, fs_extra_1.unlink)(filename);
            resolve(buffer);
        }));
    });
});
exports.downloadYT = downloadYT;
/**
 * Function to download and save audio from youtube
 * @param url URL to download
 * @param filename the file to save to
 * @returns filename
 */
const downloadYTAndSave = (url, filename = './spotifydl-core.mp3') => __awaiter(void 0, void 0, void 0, function* () {
    const audio = yield (0, exports.downloadYT)(url);
    try {
        yield (0, fs_extra_1.writeFile)(filename, audio);
        return filename;
    }
    catch (err) {
        throw new Error_1.default(`Error While writing to File: ${filename}`);
    }
});
exports.downloadYTAndSave = downloadYTAndSave;
/**
 * Function to get buffer of files with their URLs
 * @param url URL to get Buffer of
 * @returns Buffer
 */
const getBufferFromUrl = (url) => __awaiter(void 0, void 0, void 0, function* () { return (yield axios_1.default.get(url, { responseType: 'arraybuffer' })).data; });
exports.getBufferFromUrl = getBufferFromUrl;
