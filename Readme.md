# Rocket League Tracker.gg API

## Usage

### Setup

Module installation
```sh
npm i rocketleaguetrackerapi
```

Using the module
```js
const trackerapi = require("rocketleaguetrackerapi");

let userEpic = new RLUser(trackerapi.Epic, "username");
let userSteam = new RLUser(trackerapi.Steam, "username");
let userPsn = new RLUser(trackerapi.PlaystationNetwork, "username");
let userXbl = new RLUser(trackerapi.XboxLive, "username");
```

### Getting the user's raw data
```js
const trackerapi = require("rocketleaguetrackerapi");
let userEpic = new RLUser(trackerapi.Epic, "username"); //Or other userType

let data = await userEpic.getData(); // --> Map
```

### Getting a specific rank's data
```js
const trackerapi = require("rocketleaguetrackerapi");
let userEpic = new RLUser(trackerapi.Epic, "username");

let data = await userEpic.getRankData(<your_rank_id_on_the_map>); // --> Gives the rank's name, the elo and the icon
```

### Prebuild rank's functions
```js
const trackerapi = require("rocketleaguetrackerapi");
let userEpic = new RLUser(trackerapi.Epic, "username");

let one = await userEpic.getOneVersusOne(); // --> one versus one data
let two = await userEpic.getTwoVersusTwo(); // --> two versus two data
let three = await userEpic.getThreeVersusThree(); // --> three versus three data
```

### Prebuilt image processing with canvas
```js
const trackerapi = require("rocketleaguetrackerapi");
let userEpic = new RLUser(trackerapi.Epic, "username");

let imageBuffer = await userEpic.getImage(<users_avatar_URL>); // --> give a buffer that has the image's data
```

### Sending the prebuilt processed image with discord.js v13
```js
const trackerapi = require("rocketleaguetrackerapi");
let userEpic = new RLUser(trackerapi.Epic, "username");

let imageBuffer = await userEpic.getImage(await <your_discordjs_user_object>.avatarURL());

await <your_discordjs_channel>.send({files: [
    {
        attachment: imageBuffer,
        name: "customimagename" // --> the image's name when downloaded from discord
    }
]});
```

## Check the jsdocs to better understanding

### Copyright DrasticLp