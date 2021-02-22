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
    return 0;
}


const PREFERENCE_FUNCTIONS = [frontPreference];