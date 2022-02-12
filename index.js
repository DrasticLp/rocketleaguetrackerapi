// Imports
const axios = require('axios');
const http = require('https');
const { registerFont, createCanvas, loadImage } = require('canvas');
const fs = require("fs");
const request = require("request");
const webp = require('webp-converter');
registerFont("./node_modules/rocketleaguetrackerapi/font.ttf", {family: "Cooper Heiwitt"})

if (!fs.existsSync("./node_modules/rocketleaguetrackerapi/src/temp")){
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

/**
 * User class, contains info of the given player
 */
class RLUser {

    /**
     * 
     * @param {Platform} platform - User's platform (see below)
     * @param {String} username - User's name
     */
    constructor(platform, username) {
        this.link = `https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform.name}/${username}`;
        this.refreshData();
    }

    /**
     * Refreshes the User's data, called when creating the RLUser object
     */
    async refreshData() {
        this.data = (await axios.get(this.link)).data.data;
    }

    /**
     * Returns the User's raw data
     * @returns {Map}
     */
    async getData() {
        if (this.data == undefined || this.data == null) {
            return (await axios.get(this.link)).data.data;
        } else return this.data;
    }

    /**
     * Returns a given ranking's infos (Rank name, elo, iconUrl)
     * @param {Number} id - Rank's ID on the array (must be an integer)
     * @returns {Map}
     */
    async getRankData(id) {
        return new Promise(async (resolve, reject) => {
            const data = await this.getData();

            let rankName = data["segments"][id]["stats"]["tier"]["metadata"]["name"];
            let heloValue = data["segments"][id]["stats"]["rating"]["value"];
            let imgUrl = data["segments"][id]["stats"]["tier"]["metadata"]["iconUrl"];

            resolve({
                rank: rankName,
                elo: heloValue,
                icon: imgUrl
            });
        });
    }

    /**
     * Returns the One versus One ranking's infos (Rank name, elo, iconUrl)
     * @returns {Map}
     */
    async getOneVersusOne() {
        return await this.getRankData(2);
    }

    /**
     * Returns the Two versus Two ranking's infos (Rank name, elo, iconUrl)
     * @returns {Map}
     */
    async getTwoVersusTwo() {
        return await this.getRankData(3);
    }

    /**
     * Returns the Three versus Three ranking's infos (Rank name, elo, iconUrl)
     * @returns {Map}
     */
    async getThreeVersusThree() {
        return await this.getRankData(4);
    }

    /**
     * Returns a processed image as buffer
     * @param {String} logoUrl - The user's avatar url
     */
    async getImage(logoUrl) {

        return new Promise(async (resolve, reject) => {
            const canvas = createCanvas(600, 240);
            const ctx = canvas.getContext('2d');
    
            let bg = await loadImage("./node_modules/rocketleaguetrackerapi/src/canvas.png");
            ctx.drawImage(bg, 0, 0, 600, 240);
    
            if (logoUrl.endsWith("webp")) {
    
                let filename = "./node_modules/rocketleaguetrackerapi/src/temp/" + uuidv4();
    
                await download(logoUrl, filename + ".webp", () => { });
    
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
            ctx.fillText(oneVone["elo"], 448, 51);
    
            let p2 = await loadImage(twoVtwo.icon);
            await ctx.drawImage(p2, 168, 97, 50, 50); 
            ctx.fillText(twoVtwo["elo"], 492, 122);
    
            let p3 = await loadImage(threeVthree.icon);
            await ctx.drawImage(p3, 168, 169, 50, 50);
            ctx.fillText(twoVtwo["elo"], 492, 122);
    
            let bg2 = await loadImage("./node_modules/rocketleaguetrackerapi/src/canvas2.png");
            await ctx.drawImage(bg2, 0, 0, 236, 240);
            ctx.fillText(threeVthree["elo"], 504, 198);
    
            const buffer = await canvas.toBuffer("image/jpeg");

            resolve(buffer);
        });
    }
}

/**
 * Utilitary function to download files
 * @param {String} uri 
 * @param {String} filename 
 * @returns {Boolean}
 */
var download = function (uri, filename) {
    return new Promise((resolve, rej) => {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {
                resolve(true);
            });
        });
    })
};

/**
 * Returns a randomly generated UUIDv4 string
 * @returns {String}
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