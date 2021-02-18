/**
 * This function will be called before every run, giving an opportunity to defined 
 * your default values.
 */
function initializeSolver() {
}

/**
 * This function will be called for every member to be seated
 * @param {*} nextMember member has a `teamName` that indicates their team, and isManager flag, indicating whether they are managers or not
 * @param {*} seatedMembers all members that has already been seated so far
 * @returns undefined to send member home, or an object with the model:
 * {
 *  seat : { tableId: number, rowId: number, seatId: number },
 *  kaikaku?: boolean 
 * }
 * where seat defines `nextMember`'s seat should be
 * and kaikaku is a one off revert for the last seated member, the function can only return true once
 */
function getNextSeat(nextMember, seatedMembers) {
    // example solver, to be replaced with your solution
    for (let tableId = 0; tableId < seatedMembers.length; tableId++) {
        for (let rowId = 0; rowId < seatedMembers[tableId].length; rowId++) {
            const row = seatedMembers[tableId][rowId];
            if (row.length < 5) {
                return { seat: { tableId, rowId, seatId: row.length } };
            }
        }
    }
    return { seat: { tableId: 6, rowId: 1, seatId: 4 } }
}
