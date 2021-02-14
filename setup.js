const NUMBER_OF_TEAMS = 4;
const teamMembers = [];


const createTeamMember = (function() {
    const teams = {0: "Loki", 1: "Berserkers", 2: "Sindry", 3:"Core"};
    return function() {
        const randomTeam = Math.floor(Math.random()*4);
        const newMember = {name: teams[randomTeam]};
        teamMembers.push(newMember)
        return newMember;
    };
})();