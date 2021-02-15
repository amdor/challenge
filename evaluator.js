const NUMBER_OF_ROUNDS = 100;
const NUMBER_OF_TABLES = 7;
const TEAMS = { 0: "Loki", 1: "Berserkers", 2: "Sindri", 3: "Core" };
const TEAM_PICTURE = {
    "Loki": "assets/loki.png",
    "Berserkers": "assets/berserkers.png",
    "Sindri": "assets/sindri.png",
    "Core": "assets/core.png"
};

let freeSeatCount = NUMBER_OF_TABLES * 10;
const seatedMembers = new Array(NUMBER_OF_TABLES);

function initializeEvaluator() {
    // [
    //     [ // table 0
    //         [ // row 0
    //             memberAtSeat0 //seat 0
    //         ],
    //         [] // row 1
    //     ]
    // ]
    for (let i = 0; i < seatedMembers.length; i++) {
        seatedMembers[i] = [[], []];
    }
}

function createTeamMember() {
    const randomTeam = Math.floor(Math.random() * 4);
    const isManager = Math.floor(Math.random() * 20) === 1;
    const teamName = TEAMS[randomTeam];
    const newMember = {
        name: teamName,
        imgSrc: TEAM_PICTURE[teamName],
        isManager
    };
    return newMember;
};

function seatMember({ tableId, rowId, seatId }, member) {
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


function evaluate() {
    let result = 0;
    seatedMembers.forEach((table, tableId) => {
        table.forEach((row, rowId) => {
            let sameCount = 1;
            let hasSame = false;
            row.forEach((member, seat) => {
                if (member.name === row[seat + 1]?.name) {
                    sameCount++;
                    hasSame = true;
                    return;
                }
                switch (sameCount) {
                    case 2:
                        result += 1;
                        break;
                    case 3:
                    case 4:
                        result += 2;
                        break;
                    case 5:
                        result += 3;
                        break;
                }
                sameCount = 1;
            });
            if (!hasSame) {
                result += 3;
            }
        });
    });
    return result;
}