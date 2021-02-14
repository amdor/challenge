const animateToPosition = 13;

$(() => {
    initialize();

    initializeTables(NUMBER_OF_TABLES);

    const newMember = createTeamMember();
    addNewTeamMember(newMember);
});

function addNewTeamMember(newMember) {
    const $teamMember = $(`<img class="team-member" src="${newMember.imgSrc}" />`);
    $("#members").append($teamMember);
    $teamMember.on("click", () => {
        const targetTableId = Math.floor(animateToPosition / 10);
        const animationStepId = animateToPosition - targetTableId * 10 < 5 ? 0 : 1;
        newParent = $(`#position${animateToPosition}`);
        interMediateParent = $(`#row${targetTableId}AnimationStep${animationStepId}`);

        animateToNewParent($teamMember, interMediateParent, () => {
            animateToNewParent($teamMember, newParent, () => addNewTeamMember());
        });
    });
}


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

function animateToNewParent(element, newParent, complete) {
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
    const speed = Math.abs(Math.abs(newOffset.top - oldOffset.top) / 200 - Math.abs(newOffset.left - oldOffset.left) / 200) * 1000;
    $temp.animate({ "top": newOffset.top, "left": newOffset.left }, speed, "linear", () => {
        element.show();
        $temp.remove();
        complete?.();
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

