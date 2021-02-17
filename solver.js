

let rowId = 0;
let tableId = 0;
let seatId = -1;
let hasKaikaku = true;



function initializeSolver() {
    rowId = 0;
    tableId = 0;
    seatId = -1;
    hasKaikaku = true;
}

function getNextSeat(nextMember, evaluatorSeatedMembers) {
    // if (tableId > 3) {
    //     return undefined;
    // }
    if (seatId === 4) {
        rowId ^= 1;
        seatId = 0;

        if (rowId === 0) {
            tableId++;
        }
    } else {
        seatId++;
    }

    if (tableId === 0 && rowId === 0 && seatId === 1 && hasKaikaku) {
        seatId--;
        hasKaikaku = false;
        return { seat: { tableId, rowId, seatId }, kaikaku: true };
    }
    return { seat: { tableId, rowId, seatId } };
}
