let animationSpeed = 300; // px/s

$(() => {
    initializeEvaluator();

    initializeTables(NUMBER_OF_TABLES);

    const newMember = createTeamMember();
    addNewTeamMember(newMember);

    $("#simulateButton").on("click", () => {
        startSimulation(newMember);
    });

    $("#speedUpButton").on("click", () => {
        animationSpeed += 2000;
    });
});


async function startSimulation(firstMember) {
    let isInvalid = false;

    let roundCount = 0;
    let currentMember = firstMember;
    while (roundCount < NUMBER_OF_ROUNDS && freeSeatCount && !isInvalid) {
        const $currentMember = $("#members .team-member");
        const newSeat = getNextSeat(currentMember);
        try {
            seatMember(newSeat, currentMember);
        } catch (err) {
            alert(err.message);
            isInvalid = true;
        }

        currentMember = createTeamMember();
        addNewTeamMember(currentMember);

        await startAnimation(newSeat, $currentMember);
        roundCount++;
    }
    console.log(evaluate());
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

async function startAnimation({ tableId, rowId, seatId }, $teamMember) {
    const animateToPosition = tableId * 10 + rowId * 5 + seatId;
    const $newParent = $(`#position${animateToPosition}`);
    const $interMediateParent = $(`#row${tableId}AnimationStep${rowId}`);

    await animateToNewParent($teamMember, $interMediateParent);
    return animateToNewParent($teamMember, $newParent);
}

async function animateToNewParent(element, newParent) {
    var oldOffset = element.offset();
    element.appendTo(newParent);
    var newOffset = element.offset();

    var $temp = element.clone().appendTo('body');
    $temp.css({
        'position': 'absolute',
        'left': oldOffset.left,
        'top': oldOffset.top,
        'z-index': 1000
    });
    element.hide();

    // 200 px/s speed
    const speed = Math.abs(Math.abs(newOffset.top - oldOffset.top) / animationSpeed - Math.abs(newOffset.left - oldOffset.left) / animationSpeed) * 1000;
    return new Promise((resolve) => {
        $temp.animate({ "top": newOffset.top, "left": newOffset.left }, speed, "linear", () => {
            element.show();
            $temp.remove();
            resolve();
        });
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

