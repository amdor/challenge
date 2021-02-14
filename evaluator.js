const NUMBER_OF_ROUNDS = 100;
const NUMBER_OF_TABLES = 7;
const TEAMS = { 0: "Loki", 1: "Berserkers", 2: "Sindry", 3: "Core" };
const TEAM_PICTURE = {
    "Loki": "assets/loki.png",
    "Berserkers": "assets/loki.png",
    "Sindry": "assets/loki.png",
    "Core": "assets/loki.png"
};

let freeSeatCount = NUMBER_OF_TABLES * 10;

function initialize() {
    // [
    //     [ // table 0
    //         [ // row 0
    //             memberAtSeat0 //seat 0
    //         ],
    //         [] // row 1
    //     ]
    // ]
    const seatedMembers = new Array(NUMBER_OF_TABLES);
    for (let i = 0; i < seatedMembers.length; i++) {
        seatedMembers[i] = [[], []];
    }
}

function createTeamMember() {
    const randomTeam = Math.floor(Math.random() * 4);
    const teamName = TEAMS[randomTeam];
    const newMember = {
        name: teamName,
        imgSrc: TEAM_PICTURE[teamName]
    };
    return newMember;
};

function seatMember(tableId, rowId, seatId, member) {
    if (!freeSeatCount) {
        return;
    }
    const row = seatedMembers[tableId]?.[rowId];
    if (!row || seatId > 4 || row[seatId]) {
        throw new Error("invalid position");
    }

    row[seatId] = member;
    freeSeatCount--;
    return;
}