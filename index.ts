// Imports
import { registerFont, createCanvas, loadImage } from 'canvas';
import * as fs from "fs";
import * as request from "request";
import * as webp from 'webp-converter';
import {get} from 'fetchmaster';

registerFont("./node_modules/rocketleaguetrackerapi/font.ttf", { family: "Cooper Heiwitt" })

if (!fs.existsSync("./node_modules/rocketleaguetrackerapi/src/temp")) {
    fs.mkdirSync("./node_modules/rocketleaguetrackerapi/src/temp");
}

/**
 * Utility class, not meant to be used
 */
class Platform {
    name: string;
    constructor(nameIn) {
        this.name = nameIn;
    }
}

class RankData {

    rankname: string;
    elo: number;
    icon: string;

    constructor(rankname: string, elo: number, icon: string) {
        this.elo = elo;
        this.rankname = rankname;
        this.icon = icon;
    }
}

/**
 * User class, contains info of the given player
 */
class RLUser {

    link: string;
    username: string;
    platformname: string;
    data: JSON;

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
    async refreshData() {
        let str = (await get(this.link)).replace("undefined:1", "").replace("</pre>", "").replace("<pre>", "");
        
        this.data = JSON.parse(str).data;
    }

    /**
     * Returns the User's raw data
     * @returns {Map}
     */
    async getData() {
        if (this.data == undefined || this.data == null) {
            return JSON.parse((await get(this.link)).replace("undefined:1", "").replace("</pre>", "").replace("<pre>", "")).data;
        } else return this.data;
    }

    /**
     * Returns a given ranking's infos (Rank name, elo, iconUrl)
     * @param {number} id - Rank's ID on the array (must be an integer)
     * @returns {RankData}
     */
    async getRankData(id) {
        return new Promise<RankData>(async (resolve, reject) => {
            const data = await this.getData();            

            try {
                let rankName = data["segments"][id]["stats"]["tier"]["metadata"]["name"];
                let heloValue = data["segments"][id]["stats"]["rating"]["value"];
                let imgUrl = data["segments"][id]["stats"]["tier"]["metadata"]["iconUrl"];
    
                resolve(new RankData(
                    rankName,
                    heloValue,
                    imgUrl
                ));
            } catch {

                resolve(new RankData(
                    "Unranked",
                    0,
                    "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-0.png"
                ));
            }
        });
    }

    /**
     * Returns the One versus One ranking's infos (Rank name, elo, iconUrl)
     * @returns {RankData}
     */
    async getOneVersusOne() {
        return await this.getRankData(2);
    }

    /**
     * Returns the Two versus Two ranking's infos (Rank name, elo, iconUrl)
     * @returns {RankData}
     */
    async getTwoVersusTwo() {
        return await this.getRankData(3);
    }

    /**
     * Returns the Three versus Three ranking's infos (Rank name, elo, iconUrl)
     * @returns {RankData}
     */
    async getThreeVersusThree() {
        return await this.getRankData(4);
    }

    /**
     * Returns a processed image as buffer
     * @param {string} logoUrl - The user's avatar url
     */
    async getImage(logoUrl) {

        return new Promise(async (resolve, reject) => {
            const canvas = createCanvas(600, 240);
            const ctx = canvas.getContext('2d');

            let bg = await loadImage("./node_modules/rocketleaguetrackerapi/src/canvas.png");
            ctx.drawImage(bg, 0, 0, 600, 240);

            if (logoUrl.endsWith("webp")) {

                let filename = "./node_modules/rocketleaguetrackerapi/src/temp/" + uuidv4();

                await download(logoUrl, filename + ".webp");

                await webp.dwebp(filename + ".webp", filename + "-1.png", "-o");

                let logo = await loadImage(filename + "-1.png");
                await ctx.drawImage(logo, 16, 13, 126, 126);

                await fs.unlinkSync(filename + ".webp");
                await fs.unlinkSync(filename + "-1.png");
            } else {
                let logo = await loadImage(logoUrl);
                ctx.drawImage(logo, 16, 13, 126, 126);
            }

            ctx.fillStyle = "#fff";
            ctx.font = 'bold 20px "Cooper Heiwitt"';

            const oneVone = await this.getOneVersusOne();
            const twoVtwo = await this.getTwoVersusTwo();
            const threeVthree = await this.getThreeVersusThree();

            let p1 = await loadImage(oneVone.icon);
            await ctx.drawImage(p1, 168, 27, 50, 50);
            ctx.fillText(oneVone["elo"].toString(), 448, 51);

            let p2 = await loadImage(twoVtwo.icon);
            await ctx.drawImage(p2, 168, 97, 50, 50);
            ctx.fillText(twoVtwo["elo"].toString(), 492, 122);

            let p3 = await loadImage(threeVthree.icon);
            await ctx.drawImage(p3, 168, 169, 50, 50);
            ctx.fillText(twoVtwo["elo"].toString(), 492, 122);

            let bg2 = await loadImage("./node_modules/rocketleaguetrackerapi/src/canvas2.png");
            await ctx.drawImage(bg2, 0, 0, 236, 240);
            ctx.fillText(threeVthree["elo"].toString(), 504, 198);

            const buffer = await canvas.toBuffer("image/jpeg");

            resolve(buffer);
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
    })
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
}