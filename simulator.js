let animationSpeed = 500; // px/s
let numberOfMembersSeated = 0;

$(() => {
    initializeEvaluator();
    initializeSolver();

    initializeTables(NUMBER_OF_TABLES);

    const newMember = createTeamMember();
    addNewTeamMember(newMember);

    $("#simulateButton").on("click", () => {
        startSimulation(newMember);
    });

    $("#speedUpButton").on("click", () => {
        animationSpeed *= 1.5;
    });
    $("#slowDownButton").on("click", () => {
        animationSpeed /= 1.5;
    });
});


async function startSimulation(firstMember) {
    let isInvalid = false;

    let roundCount = 0;
    let currentMember = firstMember;
    while (roundCount < NUMBER_OF_ROUNDS && evaluatorFreeSeatCount && !isInvalid) {
        roundCount++;
        const $currentMember = $("#members .team-member");
        const { seat: newSeat, kaikaku } = getNextSeat({ ...currentMember }, [...evaluatorSeatedMembers]);
        if (!evaluatorKaikakuUsed && kaikaku) {
            const positionId = newSeat.tableId * 10 + newSeat.rowId * 5 + newSeat.seatId;
            const $lastMember = $(`#position${positionId} .team-member`);
            unseatMember();
            if ($lastMember.length) {
                await startAnimationFromSeat(evaluatorLastSeatUsed, $lastMember);
                numberOfMembersSeated--;
                $("#counter").text(numberOfMembersSeated);
            }

        }
        if (!newSeat) {
            await sendHome($currentMember);
            $currentMember.remove();
            currentMember = createTeamMember();
            addNewTeamMember(currentMember);
            continue;
        }

        try {
            seatMember(newSeat, currentMember);
        } catch (err) {
            alert(err.message);
            isInvalid = true;
        }

        currentMember = createTeamMember();
        addNewTeamMember(currentMember);

        await startAnimationToSeat(newSeat, $currentMember);
        numberOfMembersSeated++;
        $("#counter").text(numberOfMembersSeated);
    }
    if (!isInvalid) {
        $("#score").text(evaluate());
    } else {
        $("#score").text(0);
    }
};


//////////////////////////
//// UI FUNTIONS /////////
//////////////////////////
function initializeTables(tableCount) {
    for (let j = 0; j < tableCount; j++) {
        const rowId = `row${j}`;
        $("body").append(`<div id="${rowId}" class="row">
    <img class="table" src="assets/table.png" />
  </div>`);
        const $row = $(`#${rowId}`);
        for (let i = 0; i < 10; i++) {
            const positionId = j * 10 + i;
            $row.append(`<div id="position${positionId}" class="seat"></div>`);
            $(`#position${positionId}`).css({
                top: getTopForMember(i) + "px",
                left: getLeftForMember(i) + "px",
            });
            if (i % 5 === 0) {
                const animationStepId = `${rowId}AnimationStep${i / 5}`;
                const rowPosition = $row.offset();
                $("body").append(`<div id="${animationStepId}" class="seat"></div>`);
                const $animationStep = $(`#${animationStepId}`);
                $animationStep.css({
                    top: rowPosition.top + getTopForMember(i) + "px",
                    left: rowPosition.left + $row.outerWidth() - $animationStep.outerWidth()
                });
            }
        }
    }
}

function addNewTeamMember(newMember) {
    const $teamMember = $(`<img class="team-member" src="${newMember.imgSrc}" />`);
    newMember.isManager && $teamMember.addClass("manager");
    $("#members").append($teamMember);
    return $teamMember;
}

async function startAnimationToSeat({ tableId, rowId, seatId }, $teamMember) {
    const animateToPosition = tableId * 10 + rowId * 5 + seatId;
    const $newParent = $(`#position${animateToPosition}`);
    const $interMediateParent = $(`#row${tableId}AnimationStep${rowId}`);

    await animateToNewParent($teamMember, $interMediateParent);
    return animateToNewParent($teamMember, $newParent);
}

async function startAnimationFromSeat({ tableId, rowId }, $teamMember) {
    const $interMediateParent = $(`#row${tableId}AnimationStep${rowId}`);

    await animateToNewParent($teamMember, $interMediateParent);
    return sendHome($teamMember);
}

async function animateToNewParent($element, $newParent) {
    var oldOffset = $element.offset();
    $element.appendTo($newParent);
    var newOffset = $element.offset();

    var $temp = $element.clone().appendTo('body');
    $temp.css({
        'position': 'absolute',
        'left': oldOffset.left,
        'top': oldOffset.top,
        'z-index': 1000
    });
    $element.hide();

    const speed = Math.abs(Math.abs(newOffset.top - oldOffset.top) / animationSpeed - Math.abs(newOffset.left - oldOffset.left) / animationSpeed) * 1000;
    return new Promise((resolve) => {
        $temp.animate({ "top": newOffset.top, "left": newOffset.left }, speed, "linear", () => {
            $element.show();
            $temp.remove();
            resolve();
        });
    });
}

async function sendHome($element) {
    return new Promise((resolve) => {
        $element.css({
            'position': 'absolute'
        });
        $element.animate({ "top": "500px" }, (500 / animationSpeed) * 1000, "linear");
        $element.fadeOut(600, resolve);
    });
}

//////////////////////////
//// UTIL FUNTIONS /////////
//////////////////////////
function getTopForMember(i) {
    return Math.floor(i / 5) * 105;
}

function getLeftForMember(i) {
    return 10 + (i % 5) * 57;
}

