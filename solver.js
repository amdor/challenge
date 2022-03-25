/** example global var, feel free to delete it */
let kaikakued;

/**
 * This function will be called before every run, giving an opportunity to define 
 * your default values.
 */
function initializeSolver() {
    kaikakued = false;
}

/**
 * This function will be called for every member to be seated
 * @param {*} nextMember member has a `teamName` that indicates their team, and isManager flag, indicating whether they are managers or not
 * @param {*} seats all available and taken seats
 * @returns undefined to send member home, or an object with the model:
 * {
 *  seat : { tableId: number, rowId: number, seatId: number },
 *  kaikaku?: boolean 
 * }
 * where seat defines `nextMember`'s seat should be
 * and kaikaku is a one off revert for the last seated member, the function can only return kaikaku = true once
 */
function getNextSeat(nextMember, seats) {
    // example solver, to be replaced with your solution
    for (let tableId = 0; tableId < seats.length; tableId++) {
        for (let rowId = 0; rowId < seats[tableId].length; rowId++) {
            const membersInRow = seats[tableId][rowId].map(elem => elem.member).filter(Boolean);
            if (membersInRow.length < 5) {
                kaikakued = membersInRow.length === 1 && !kaikakued;
                // if (nextMember.teamName === seats[tableId][rowId][membersInRow.length].setupForTeam) {
                return { seat: { tableId, rowId, seatId: kaikakued && tableId === 0 && rowId === 0 ? 0 : membersInRow.length }, kaikaku: kaikakued };
                // }
            }
        }
    }
    return undefined
}
