const animateToPosition = 13;

$(() => {
    const teamMember = $("#img1");
    const teamMemberOffset = teamMember.offset();
    teamMember.on("click", () => {
        const targetRowId = Math.floor(animateToPosition / 10);
        const animationStepId = animateToPosition - targetRowId * 10 < 5 ? 0 : 1;
        newParent = $(`#position${animateToPosition}`);
        interMediateParent = $(`#row${targetRowId}AnimationStep${animationStepId}`);

        animateToNewParent(teamMember, interMediateParent, () => {
            animateToNewParent(teamMember, newParent);
        });
    });

    // adding seats
    for (let j = 0; j < 10; j++) {
        const rowId = `row${j}`;
        $("body").append(`<div id="${rowId}" class="row">
        <img class="table" src="assets/table.png" />
      </div>`);
        const row = $(`#${rowId}`);
        for (let i = 0; i < 10; i++) {
            const positionId = j * 10 + i;
            row.append(`<div id="position${positionId}" class="seat"></div>`);
            $(`#position${positionId}`).css({
                top: getTopForMember(i) + "px",
                left: getLeftForMember(i) + "px",
            });
            if (i % 5 === 0) {
                const animationStepId = `${rowId}AnimationStep${i / 5}`;
                const rowPosition = row.position();
                $("body").append(`<div id="${animationStepId}" class="seat"></div>`);
                $(`#${animationStepId}`).css({
                    top: rowPosition.top + getTopForMember(i) + "px",
                    left: teamMemberOffset.left,
                });
            }
        }
    }
});


function getTopForMember(i) {
    return Math.floor(i / 5) * 105;
}

function getLeftForMember(i) {
    return 10 + (i % 5) * 57;
}

function animateToNewParent(element, newParent, complete) {
    var oldOffset = element.offset();
    element.appendTo(newParent);
    var newOffset = element.offset();

    var temp = element.clone().appendTo('body');
    temp.css({
        'position': 'absolute',
        'left': oldOffset.left,
        'top': oldOffset.top,
        'z-index': 1000
    });
    element.hide();

    // 200 px/s speed
    const speed = Math.abs(Math.abs(newOffset.top - oldOffset.top) / 200 - Math.abs(newOffset.left - oldOffset.left) / 200) * 1000;
    temp.animate({ "top": newOffset.top, "left": newOffset.left }, speed, "linear", () => {
        element.show();
        temp.remove();
        complete?.();
    });
}