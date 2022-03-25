
const Simulator = (function () {

    let animationSpeed = 500; // px/s
    let numberOfMembersSeated = 0;
    let seriesCounter = 0;
    let simulationStarted = false;
    let paused = false;

    $(() => {
        Evaluator.initializeEvaluator();

        initializeTables();

        const simulateButton = $("#simulateButton");
        simulateButton.on("click", () => {
            if (simulationStarted) {
                paused = !paused;
                simulateButton.text(paused ? "Continue" : "Pause");
                return;
            }
            simulateButton.text("Pause");
            simulationStarted = true;
            startSimulationSeries();
        });

        $("#speedUpButton").on("click", () => {
            animationSpeed *= 1.5;
        });
        $("#slowDownButton").on("click", () => {
            animationSpeed /= 1.5;
        });
    });

    async function startSimulationSeries() {
        seriesCounter++;
        initializeSolver();
        Evaluator.resetEvaluator();
        resetTables();
        await startSimulation();
        setTimeout(() => {
            if (seriesCounter < 5) {
                startSimulationSeries();
            }
        }, 2000)
    }


    async function startSimulation() {
        let isInvalid = false;

        let roundCount = 0;
        while (roundCount < NUMBER_OF_EMPLOYEES && Evaluator.evaluatorFreeSeatCount && !isInvalid) {
            if (paused) {
                await waitForPause();
                continue;
            }
            currentMember = Evaluator.createTeamMember();
            addNewTeamMember(currentMember);
            roundCount++;
            const $currentMember = $("#members .team-member");
            const { seat: newSeat, kaikaku } = getNextSeat(Evaluator.cloneDeep(currentMember), Evaluator.cloneDeep(Evaluator.evaluatorSeats)) ?? {};
            if (!Evaluator.evaluatorKaikakuUsed && kaikaku) {
                const { tableId, rowId, seatId } = Evaluator.unseatMember();
                const positionId = getPositionId(tableId, rowId, seatId);
                const $lastMember = $(`#position${positionId} .team-member`);
                if ($lastMember.length) {
                    await startAnimationFromSeat(Evaluator.evaluatorLastSeatUsed, $lastMember);
                    numberOfMembersSeated--;
                    $("#counter").text(numberOfMembersSeated);
                }

            }
            if (!newSeat) {
                await sendHome($currentMember);
                $currentMember.remove();
                continue;
            }

            try {
                Evaluator.seatMember(newSeat, currentMember);
            } catch (err) {
                alert(err.message);
                isInvalid = true;
                continue;
            }

            await seatMemberWithAnimation(newSeat, $currentMember);
            const positionId = getPositionId(newSeat.tableId, newSeat.rowId, newSeat.seatId);
            const $setupForTeam = $(`#setupForTeam${positionId}`);
            $setupForTeam.empty();
            $setupForTeam.append($(`<img src="${TEAM_LOGO[currentMember.teamName]}" />`));

            numberOfMembersSeated++;
            $("#counter").text(numberOfMembersSeated);
        }
        if (!isInvalid) {
            $("#score").text(Evaluator.evaluate());
        } else {
            $("#score").text(0);
        }
        return;
    };


    //////////////////////////
    //// UI FUNTIONS /////////
    //////////////////////////
    function initializeTables() {
        numberOfMembersSeated = 0
        for (let tableId = 0; tableId < NUMBER_OF_TABLES; tableId++) {
            const tableIdTag = `table${tableId}`;
            $("body").append(`<div id="${tableIdTag}" class="tableContainer">
        <img class="table" src="assets/table.png" />
      </div>`);
            const $table = $(`#${tableIdTag}`);
            for (let i = 0; i < 10; i++) {
                const positionId = tableId * 10 + i;
                $table.append(`<div id="position${positionId}" class="seat"></div>`);
                $table.append(`<div id="setupForTeam${positionId}" class="setupIndicator"></div>`);
                $(`#position${positionId}`).css({
                    top: getTopForMember(i) + "px",
                    left: getLeftForMember(i) + "px",
                });

                const $setupForTeam = $(`#setupForTeam${positionId}`);
                $setupForTeam.css({
                    top: getTopForSetupIndicator(i) + "px",
                    left: getLeftForSetupIndicator(i) + "px",
                });
                const rowId = Math.floor(i / 5);
                $setupForTeam.append($(`<img src="${TEAM_LOGO[Evaluator.evaluatorSeats[tableId][rowId][i - rowId * 5].setupForTeam]}" />`));
                if (i % 5 === 0) {
                    const animationStepId = `${tableIdTag}AnimationStep${i / 5}`;
                    const rowPosition = $table.offset();
                    $("body").append(`<div id="${animationStepId}" class="seat"></div>`);
                    const $animationStep = $(`#${animationStepId}`);
                    $animationStep.css({
                        top: rowPosition.top + getTopForMember(i) + "px",
                        left: rowPosition.left + $table.outerWidth() - $animationStep.outerWidth()
                    });
                }
            }
        }
    }

    function resetTables() {
        numberOfMembersSeated = 0
        for (let tableId = 0; tableId < NUMBER_OF_TABLES; tableId++) {
            for (let rowId = 0; rowId < 2; rowId++) {
                for (let seatId = 0; seatId < 5; seatId++) {
                    const positionToReset = getPositionId(tableId, rowId, seatId);
                    $(`#position${positionToReset} img`).remove();
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

    async function seatMemberWithAnimation({ tableId, rowId, seatId }, $teamMember) {
        const animateToPosition = getPositionId(tableId, rowId, seatId);
        const $newParent = $(`#position${animateToPosition}`);
        const $intermediateParent = $(`#table${tableId}AnimationStep${rowId}`);

        await animateToNewParent($teamMember, $intermediateParent);
        return animateToNewParent($teamMember, $newParent);
    }

    async function startAnimationFromSeat({ tableId, rowId }, $teamMember) {
        const $intermediateParent = $(`#table${tableId}AnimationStep${rowId}`);

        await animateToNewParent($teamMember, $intermediateParent);
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

    function getTopForSetupIndicator(i) {
        return getTopForMember(i) + (Math.floor(i / 5) % 2 === 0 ? 45 : -30);
    }

    function getLeftForMember(i) {
        return 10 + (i % 5) * 57;
    }

    function getLeftForSetupIndicator(i) {
        return getLeftForMember(i) + 5;
    }

    function getPositionId(tableId, rowId, seatId) {
        return tableId * 10 + rowId * 5 + seatId;
    }

    async function waitForPause() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }
})();
