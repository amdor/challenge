const NUMBER_OF_EMPLOYEES = 43;
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

const Evaluator = (() => {
    let freeSeatCount = NUMBER_OF_TABLES * 10;
    let lastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
    let kaikakuUsed = false;
    let seats = new Array(NUMBER_OF_TABLES);

    const initializeEvaluator = () => {
        // [
        //     [ // table 0
        //         [ // row 0
        //             {member: {teamName: string, imgSrc: string, isManager: boolean, seatPreference: (seat) => number}, setupForTeam: string} //seat 0
        //         ],
        //         [] // row 1
        //     ]
        // ]
        for (let i = 0; i < Evaluator.seats.length; i++) {
            Evaluator.seats[i] = [];
            for (let j = 0; j < 2; j++) {
                const row = [];
                for (let i = 0; i < 5; i++) {
                    row.push({ member: undefined, setupForTeam: getRandomTeam() })
                }
                Evaluator.seats[i].push(row);
            }
        }
        Evaluator.kaikakuUsed = false;
        Evaluator.lastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
    }

    const resetEvaluator = () => {
        Evaluator.seats = Evaluator.seats.map(table => table.map(row => row.map(seat => ({ ...seat, member: undefined }))))
        Evaluator.kaikakuUsed = false;
        Evaluator.freeSeatCount = NUMBER_OF_TABLES * 10;
        Evaluator.lastSeatUsed = { tableId: 0, rowId: 0, seatId: 0 };
    }

    const getRandomTeam = () => {
        const randomTeam = Math.floor(Math.random() * 6);
        return TEAMS[randomTeam];
    }

    const createTeamMember = () => {
        const isManager = Math.floor(Math.random() * 20) === 1;
        const teamName = getRandomTeam();
        const newMember = {
            teamName,
            imgSrc: TEAM_LOGO[teamName],
            isManager,
            seatPreference: Preference.getRandomPreferenceFunction()
        };
        return newMember;
    };

    const seatMember = (newSeat, member) => {
        const { tableId, rowId, seatId } = newSeat;
        if (!Evaluator.freeSeatCount) {
            return;
        }
        const targetSeat = Evaluator.seats[tableId]?.[rowId]?.[seatId];
        if (!targetSeat || targetSeat.member) {
            throw new Error("invalid position");
        }

        targetSeat.member = member;
        Evaluator.lastSeatUsed = { tableId, rowId, seatId };
        Evaluator.freeSeatCount--;
        return;
    }

    const unseatMember = () => {
        Evaluator.kaikakuUsed = true;
        const { tableId, rowId, seatId } = Evaluator.lastSeatUsed;
        const seat = Evaluator.seats[tableId][rowId][seatId];
        seat.setupForTeam = seat.member.teamName
        seat.member = undefined;
        Evaluator.freeSeatCount++;
        return Evaluator.lastSeatUsed;
    }


    const evaluate = () => {
        let result = 0;
        Evaluator.seats.forEach((table, tableId) => {
            table.forEach((row, rowId) => {
                let sameCount = 1;
                let hasSame = false;
                let rowValue = 0;

                row.forEach((seat, seatId) => {
                    const { member, setupForTeam } = seat;
                    if (!member) {
                        rowValue -= 1;
                        if (sameCount > 1) {
                            switch (sameCount) {
                                case 2:
                                case 3:
                                    rowValue += sameCount - 1;
                                    break;
                                case 4:
                                case 5:
                                    rowValue += sameCount + 1;
                                    break;
                            }
                            sameCount = 1;
                        }
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
                            rowValue += sameCount - 1;
                            break;
                        case 4:
                        case 5:
                            rowValue += sameCount + 1;
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

    const simulateWithoutUI = () => {
        let sum = 0;
        initializeEvaluator();
        for (let i = 0; i < 10000; i++) {
            initializeSolver();
            resetEvaluator();
            let isInvalid = false;
            let currentMember = createTeamMember();
            let roundCount = 0;
            Evaluator.freeSeatCount = NUMBER_OF_TABLES * 10
            while (roundCount < NUMBER_OF_EMPLOYEES && Evaluator.freeSeatCount && !isInvalid) {
                roundCount++;
                const { seat: newSeat, kaikaku } = getNextSeat(cloneDeep(currentMember), cloneDeep(Evaluator.seats)) ?? {};
                if (!Evaluator.kaikakuUsed && kaikaku) {
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
        console.log("Avrg " + sum / 10000);
    }

    const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));

    return {
        freeSeatCount,
        lastSeatUsed,
        kaikakuUsed,
        seats,
        initializeEvaluator,
        resetEvaluator,
        createTeamMember,
        seatMember,
        unseatMember,
        evaluate,
        simulateWithoutUI,
        cloneDeep
    };
})();