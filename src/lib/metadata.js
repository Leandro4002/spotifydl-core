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
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = require("fs");
exports.default = (data, file) => __awaiter(void 0, void 0, void 0, function* () {
    const outputOptions = ['-map', '0:0', '-codec', 'copy'];
    const metadata = {
        title: data.name,
        album: data.album_name,
        artist: data.artists,
        date: data.release_date
        //attachments: []
    };
    Object.keys(metadata).forEach((key) => {
        outputOptions.push('-metadata', `${String(key)}=${metadata[key]}`);
    });
    const out = `${file.split('.')[0]}_temp.mp3`;
    yield new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)()
            .input(file)
            .on('error', (err) => {
            reject(err);
        })
            .on('end', () => resolve(file))
            .addOutputOptions(...outputOptions)
            .saveToFile(out);
    });
    (0, fs_1.unlinkSync)(file);
    (0, fs_1.renameSync)(out, file);
    return file;
});
