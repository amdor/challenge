# Open office challenge

In this challenge the goal is to create an algorithm that finds the ideal flexi-desk seating for an open office

## Story and setup

We have 4 tables, each table with 2 rows, each row consisting of 5-5 seats.
We have infinite employees of which every day 43 comes to the office, each working in one of our 6 teams, arriving at the office one-by-one. We need to tell each of them where to sit. We can also decide to send them home, but the office is costly, so every vacant seat will yield a penalty.

All seats have a setup from the previous day, each team sets up their desks ever so differently. Team members are happy to sit where they don't need to start the day with setting everything up. If they do sit at such positions, they create their team's setup there, hence the next day that is going to wait for anybody sitting there.

All people are different, and all employees have their seat preferences. There are places in the office they like to sit, and places they don't fancy. Watch out for the weird guy, he likes only a few seats in the office.

Team members also like to sit together, but the company also believes in diversity, thus both members sitting together and having mixed rows yield various awards.

Team Leads don't like to sit at the right end of the rows, they get too much distractions there, which spoils their mood, and by association their mood spreads to the whole row.

Since it is a very lean company, if the seating situation is dire the office manager can shout out KAIKAKU, which sends home the last seated member, who is happy to adapt to changes. This cannot occur more than once a day, that would lower the moral regardless of how lean this company is.

## Manual

You need to extend solver.js. There is `initializeSolver` which is called each "day" to let you reinitialize global variables used. The other function is `getNextSeat` this is called with the employee arriving at the office and with the current seating situation of the office and needs to return the seat to sit the employee, and optionally kaikaku, once per day (once between 2 `initializeSolver` calls), or it can return undefined to send home the employee, or even it can return undefined for the seat and kaikaku true, to send home both the employee that arrive and the one last seated.
Members have a seat preference function, this tells you how happy they are with a given seat.
`setupForTeam` value tells what setup the seat currently has, it is first random, but then saved between days, so after `initializeSolver` is called again, it will have the same setup as `teamName` of the employee sat there the last day, or the previous value if nobody sat there.

### **An example solver is provided, you can run your solution by opening simulator.html**

Table, and team member data structure:

```typescript
[
  // table 0
  [
    // row 0
    [
      // seat 0
      {
        member: {
          teamName: string,
          isManager: boolean,
          seatPreference: (seat) => number, // seat is in the form of { tableId: number, rowId: number, seatId: number }
        },
        setupForTeam: string, // one of the teamName s
      },
    ],
    [], // row 1
  ],
];
```

Expected return type for `getNextSeat`

```typescript
{
  seat? : { tableId: number, rowId: number, seatId: number },
  kaikaku?: boolean
} | undefined
```

The chance for an arriving employee to be from a given team is equally 1/6 for each teams.
The chance of the arriving employee to be a Team Lead is 1/20.

## Scoring

- Every empty seat: -1
- Every employee sitting at a desk set up for her team: +1
- For every employee their preference number at their chosen seat (be it positive or negative), this ranges from -2 to 3
- 2 members of the same team sitting next to each other: +1
- 4+ members of the same team sitting next to each other: +2
- no 2 employees sitting next to each other in the row are in the same team: +2 / row
- for every if the employee sitting at the end of the row (rowN[4]) is a manager and that row would yield positive score, it is nulled. negative summ score of the row still counts
