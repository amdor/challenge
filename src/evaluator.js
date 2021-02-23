const NUMBER_OF_ROUNDS = 43;
const NUMBER_OF_TABLES = 4;
const TEAMS = { 0: "Loki", 1: "Berserkers", 2: "Sindri", 3: "Thor", 4: "Freya", 5: "Yggdrasil" };
const TEAM_LOGO = {
    "Loki": "assets/loki.png",
    "Berserkers": "assets/berserkers.png",
    "Sindri": "assets/sindri.png",
    "Thor": "assets/thor.png",
    "Freya": "assets/freya.png",
    "Yggdrasil": "assets/yggdrasil.png"
};

let evaluatorFreeSeatCount = NUMBER_OF_TABLES * 10;
let evaluatorLastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
let evaluatorKaikakuUsed = false;
let evaluatorSeats = new Array(NUMBER_OF_TABLES);

function initializeEvaluator() {
    // [
    //     [ // table 0
    //         [ // row 0
    //             {member: {teamName: string, imgSrc: string, isManager: boolean, seatPreference: (seat) => number}, setupForTeam: string} //seat 0
    //         ],
    //         [] // row 1
    //     ]
    // ]
    for (let i = 0; i < evaluatorSeats.length; i++) {
        evaluatorSeats[i] = [];
        for (let j = 0; j < 2; j++) {
            const row = [];
            for (let i = 0; i < 5; i++) {
                row.push({ member: undefined, setupForTeam: getRandomTeam() })
            }
            evaluatorSeats[i].push(row);
        }
    }
    evaluatorKaikakuUsed = false;
    evaluatorLastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
}

function resetEvaluator() {
    evaluatorSeats = evaluatorSeats.map(table => table.map(row => row.map(seat => ({ ...seat, member: undefined }))))
    evaluatorKaikakuUsed = false;
    evaluatorFreeSeatCount = NUMBER_OF_TABLES * 10;
    evaluatorLastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
}

function getRandomTeam() {
    const randomTeam = Math.floor(Math.random() * 4);
    return TEAMS[randomTeam];
}

function getRandomSeatPreference() {
    return getRandomPreferenceFunction();
}

function createTeamMember() {
    const isManager = Math.floor(Math.random() * 20) === 1;
    const teamName = getRandomTeam();
    const newMember = {
        teamName,
        imgSrc: TEAM_LOGO[teamName],
        isManager,
        seatPreference: getRandomSeatPreference()
    };
    return newMember;
};

function seatMember(newSeat, member) {
    const { tableId, rowId, seatId } = newSeat;
    if (!evaluatorFreeSeatCount) {
        return;
    }
    const row = evaluatorSeats[tableId]?.[rowId];
    if (!row || seatId > 4 || row[seatId].member) {
        throw new Error("invalid position");
    }

    row[seatId].member = member;
    evaluatorLastSeatUsed = newSeat;
    evaluatorFreeSeatCount--;
    return;
}

function unseatMember() {
    evaluatorKaikakuUsed = true;
    const { tableId, rowId, seatId } = evaluatorLastSeatUsed;
    evaluatorSeats[tableId][rowId][seatId].member = undefined;
    return evaluatorLastSeatUsed;
}


function evaluate() {
    let result = 0;
    evaluatorSeats.forEach((table, tableId) => {
        table.forEach((row, rowId) => {
            let sameCount = 1;
            let hasSame = false;
            let rowValue = 0;

            row.forEach((seat, seatId) => {
                const { member, setupForTeam } = seat;
                if (!member) {
                    rowValue -= 1;
                    return;
                }
                rowValue += member.seatPreference({ tableId, rowId, seatId });
                if (member.teamName === setupForTeam) {
                    rowValue += 1;
                }
                seat.setupForTeam = member.teamName;
                if (member.teamName === (row[seatId + 1]?.teamName)) {
                    sameCount++;
                    hasSame = true;
                    return;
                }
                switch (sameCount) {
                    case 2:
                    case 3:
                        rowValue += 1;
                        break;
                    case 4:
                    case 5:
                        rowValue += 2;
                        break;
                }
                sameCount = 1;
            });
            if (!hasSame) {
                rowValue += 2;
            }
            if (row[4].member?.isManager && rowValue > 0) {
                return;
            }
            result += rowValue;
        });
    });
    return result;
}

function simulateWithoutUI() {
    let sum = 0;
    initializeEvaluator();
    for (let i = 0; i < 100; i++) {
        initializeSolver();
        resetEvaluator();
        let isInvalid = false;
        let currentMember = createTeamMember();
        let roundCount = 0;
        evaluatorFreeSeatCount = NUMBER_OF_TABLES * 10
        while (roundCount < NUMBER_OF_ROUNDS && evaluatorFreeSeatCount && !isInvalid) {
            roundCount++;
            const { seat: newSeat, kaikaku } = getNextSeat({ ...currentMember }, [...evaluatorSeats]) ?? {};
            if (!evaluatorKaikakuUsed && kaikaku) {
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