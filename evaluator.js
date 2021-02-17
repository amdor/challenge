const NUMBER_OF_ROUNDS = 75;
const NUMBER_OF_TABLES = 7;
const TEAMS = { 0: "Loki", 1: "Berserkers", 2: "Sindri", 3: "Core" };
const TEAM_LOGO = {
    "Loki": "assets/loki.png",
    "Berserkers": "assets/berserkers.png",
    "Sindri": "assets/sindri.png",
    "Core": "assets/core.png"
};

let evaluatorFreeSeatCount = NUMBER_OF_TABLES * 10;
let evaluatorLastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
let evaluatorKaikakuUsed = false;
const evaluatorSeatedMembers = new Array(NUMBER_OF_TABLES);

function initializeEvaluator() {
    // [
    //     [ // table 0
    //         [ // row 0
    //             memberAtSeat0 //seat 0
    //         ],
    //         [] // row 1
    //     ]
    // ]
    for (let i = 0; i < evaluatorSeatedMembers.length; i++) {
        evaluatorSeatedMembers[i] = [[], []];
    }
    evaluatorKaikakuUsed = false;
    evaluatorLastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
}

function createTeamMember() {
    const randomTeam = Math.floor(Math.random() * 4);
    const isManager = Math.floor(Math.random() * 20) === 1;
    const teamName = TEAMS[randomTeam];
    const newMember = {
        name: teamName,
        imgSrc: TEAM_LOGO[teamName],
        isManager
    };
    return newMember;
};

function seatMember(newSeat, member) {
    const { tableId, rowId, seatId } = newSeat;
    if (!evaluatorFreeSeatCount) {
        return;
    }
    const row = evaluatorSeatedMembers[tableId] && evaluatorSeatedMembers[tableId][rowId];
    if (!row || seatId > 4 || row[seatId] || (seatId > 0 && row[seatId - 1] === undefined)) {
        throw new Error("invalid position");
    }

    row[seatId] = member;
    evaluatorLastSeatUsed = newSeat;
    evaluatorFreeSeatCount--;
    return;
}

function unseatMember() {
    evaluatorKaikakuUsed = true;
    evaluatorSeatedMembers[evaluatorLastSeatUsed.tableId][evaluatorLastSeatUsed.rowId][evaluatorLastSeatUsed.seatId] = undefined;
}


function evaluate() {
    let result = 0;
    evaluatorSeatedMembers.forEach((table, tableId) => {
        table.forEach((row, rowId) => {
            let sameCount = 1;
            let hasSame = false;

            if (!row.length) {
                result -= 10;
                return;
            }

            if (row.length < 5) {
                result -= (5 - row.length);
            }

            if (row[4] && row[4].isManager) {
                return;
            }
            row.forEach((member, seat) => {
                if (member.name === (row[seat + 1] && row[seat + 1].name)) {
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

function simulateWithoutUI() {
    let sum = 0;
    for (let i = 0; i < 100; i++) {
        initializeEvaluator();
        initializeSolver();
        let isInvalid = false;
        let currentMember = createTeamMember();
        let roundCount = 0;
        evaluatorFreeSeatCount = NUMBER_OF_TABLES * 10
        while (roundCount < NUMBER_OF_ROUNDS && evaluatorFreeSeatCount && !isInvalid) {
            roundCount++;
            const { seat: newSeat, kaikaku } = getNextSeat({...currentMember}, [...evaluatorSeatedMembers]);
            if (!evaluatorKaikakuUsed && evaluatorKaikakuUsed) {
                unseatMember();
            }

            if (!newSeat) {
                currentMember = createTeamMember();
                continue;
            }

            try {
                seatMember(newSeat, currentMember);
            } catch (err) {
                isInvalid = true;
            }

            currentMember = createTeamMember();
        }
        if (!isInvalid) {
            const score = evaluate();
            sum += score;
            console.log(score);
        } else {
            console.log(0);
        }
    }
    console.log("Avrg " + sum / 100);
}