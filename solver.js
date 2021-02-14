
let rowId = 0;
let tableId = 0;
let seatId = -1;

function getNextSeat(nextMember) {
    if (seatId === 4) {
        rowId ^= 1;
        seatId = 0;

        if (rowId === 0) {
            tableId++;
        }
    } else {
        seatId++;
    }
    return { tableId, rowId, seatId };
}