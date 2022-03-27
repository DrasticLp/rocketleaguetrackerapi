"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const canvas_1 = require("canvas");
const fs = __importStar(require("fs"));
const request = __importStar(require("request"));
const webp = __importStar(require("webp-converter"));
const fetchmaster_1 = require("fetchmaster");
(0, canvas_1.registerFont)("./node_modules/rocketleaguetrackerapi/font.ttf", { family: "Cooper Heiwitt" });
if (!fs.existsSync("./node_modules/rocketleaguetrackerapi/src/temp")) {
    fs.mkdirSync("./node_modules/rocketleaguetrackerapi/src/temp");
}
/**
 * Utility class, not meant to be used
 */
class Platform {
    constructor(nameIn) {
        this.name = nameIn;
    }
}
class RankData {
    constructor(rankname, elo, icon) {
        this.elo = elo;
        this.rankname = rankname;
        this.icon = icon;
    }
}
/**
 * User class, contains info of the given player
 */
class RLUser {
    /**
     *
     * @param {Platform} platform - User's platform (see below)
     * @param {string} username - User's name
     */
    constructor(platform, username) {
        this.username = username;
        this.platformname = platform.name;
        this.link = `https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform.name}/${username}`;
        this.refreshData();
    }
    /**
     * Refreshes the User's data, called when creating the RLUser object
     */
    refreshData() {
        return __awaiter(this, void 0, void 0, function* () {
            let str = (yield (0, fetchmaster_1.get)(this.link)).replace("undefined:1", "").replace("</pre>", "").replace("<pre>", "");
            this.data = JSON.parse(str).data;
        });
    }
    /**
     * Returns the User's raw data
     * @returns {Map}
     */
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data == undefined || this.data == null) {
                return JSON.parse((yield (0, fetchmaster_1.get)(this.link)).replace("undefined:1", "").replace("</pre>", "").replace("<pre>", "")).data;
            }
            else
                return this.data;
        });
    }
    /**
     * Returns a given ranking's infos (Rank name, elo, iconUrl)
     * @param {number} id - Rank's ID on the array (must be an integer)
     * @returns {RankData}
     */
    getRankData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.getData();
                let rankName = data["segments"][id]["stats"]["tier"]["metadata"]["name"];
                let heloValue = data["segments"][id]["stats"]["rating"]["value"];
                let imgUrl = data["segments"][id]["stats"]["tier"]["metadata"]["iconUrl"];
                resolve(new RankData(rankName, heloValue, imgUrl));
            }));
        });
    }
    /**
     * Returns the One versus One ranking's infos (Rank name, elo, iconUrl)
     * @returns {RankData}
     */
    getOneVersusOne() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getRankData(2);
        });
    }
    /**
     * Returns the Two versus Two ranking's infos (Rank name, elo, iconUrl)
     * @returns {RankData}
     */
    getTwoVersusTwo() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getRankData(3);
        });
    }
    /**
     * Returns the Three versus Three ranking's infos (Rank name, elo, iconUrl)
     * @returns {RankData}
     */
    getThreeVersusThree() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getRankData(4);
        });
    }
    /**
     * Returns a processed image as buffer
     * @param {string} logoUrl - The user's avatar url
     */
    getImage(logoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const canvas = (0, canvas_1.createCanvas)(600, 240);
                const ctx = canvas.getContext('2d');
                let bg = yield (0, canvas_1.loadImage)("./node_modules/rocketleaguetrackerapi/src/canvas.png");
                ctx.drawImage(bg, 0, 0, 600, 240);
                if (logoUrl.endsWith("webp")) {
                    let filename = "./node_modules/rocketleaguetrackerapi/src/temp/" + uuidv4();
                    yield download(logoUrl, filename + ".webp");
                    yield webp.dwebp(filename + ".webp", filename + "-1.png", "-o");
                    let logo = yield (0, canvas_1.loadImage)(filename + "-1.png");
                    yield ctx.drawImage(logo, 16, 13, 126, 126);
                    yield fs.unlinkSync(filename + ".webp");
                    yield fs.unlinkSync(filename + "-1.png");
                }
                else {
                    let logo = yield (0, canvas_1.loadImage)(logoUrl);
                    ctx.drawImage(logo, 16, 13, 126, 126);
                }
                ctx.fillStyle = "#fff";
                ctx.font = 'bold 20px "Cooper Heiwitt"';
                const oneVone = yield this.getOneVersusOne();
                const twoVtwo = yield this.getTwoVersusTwo();
                const threeVthree = yield this.getThreeVersusThree();
                let p1 = yield (0, canvas_1.loadImage)(oneVone.icon);
                yield ctx.drawImage(p1, 168, 27, 50, 50);
                ctx.fillText(oneVone["elo"].toString(), 448, 51);
                let p2 = yield (0, canvas_1.loadImage)(twoVtwo.icon);
                yield ctx.drawImage(p2, 168, 97, 50, 50);
                ctx.fillText(twoVtwo["elo"].toString(), 492, 122);
                let p3 = yield (0, canvas_1.loadImage)(threeVthree.icon);
                yield ctx.drawImage(p3, 168, 169, 50, 50);
                ctx.fillText(twoVtwo["elo"].toString(), 492, 122);
                let bg2 = yield (0, canvas_1.loadImage)("./node_modules/rocketleaguetrackerapi/src/canvas2.png");
                yield ctx.drawImage(bg2, 0, 0, 236, 240);
                ctx.fillText(threeVthree["elo"].toString(), 504, 198);
                const buffer = yield canvas.toBuffer("image/jpeg");
                resolve(buffer);
            }));
        });
    }
}
/**
 * Utilitary function to download files
 * @param {string} uri
 * @param {string} filename
 * @returns {Boolean}
 */
var download = function (uri, filename) {
    return new Promise((resolve, rej) => {
        request.head(uri, function (err, res, body) {
            request.default(uri).pipe(fs.createWriteStream(filename)).on('close', () => {
                resolve(true);
            });
        });
    });
};
/**
 * Returns a randomly generated UUIDv4 string
 * @returns {string}
 */
function uuidv4() {
    var dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
module.exports = {
    RLUser,
    Platform,
    PlaystationNetwork: new Platform("psn"),
    XboxLive: new Platform("xbl"),
    Epic: new Platform("epic"),
    Steam: new Platform("steam")
};
