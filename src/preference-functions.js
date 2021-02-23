function frontPreference(seat) {
    const tableId = seat.tableId
    if (tableId < NUMBER_OF_TABLES / 4) {
        return 1;
    }
    if (tableId < NUMBER_OF_TABLES / 2) {
        return 0;
    }
    if (tableId < NUMBER_OF_TABLES * 0.75) {
        return -1;
    }
    return -2;
}

function backPreference(seat) {
    return -frontPreference(seat) - 1;
}

function windowPreference(seat) {
    const seatId = seat.seatId
    if (seatId === 0) {
        return 1;
    }
    if (seatId < 4) {
        return 0;
    }
    return -1;
}


const PREFERENCE_FUNCTIONS = [{ fn: frontPreference, odds: 0.4 }, { fn: backPreference, odds: 0.4 }, { fn: windowPreference, odds: 0.2 }];


function getRandomPreferenceFunction(oddsMultiplier = 1) {
    const functionsShallow = [...PREFERENCE_FUNCTIONS];
    for (let i = 0; i < PREFERENCE_FUNCTIONS.length; i++) {
        const randomFuncIndex = Math.floor(Math.random() * functionsShallow.length);
        const randomFuncObject = functionsShallow.splice(randomFuncIndex, 1)[0];
        const chance = Math.random();
        if (chance < randomFuncObject.odds * oddsMultiplier) {
            return randomFuncObject.fn;
        }
    }
    return getRandomPreferenceFunction(oddsMultiplier * 2);
}