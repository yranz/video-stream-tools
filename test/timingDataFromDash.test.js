import { test } from "ava";
import timingDataFromDash from "../src/timingDataFromDash";
import {
  isoDurationToMilliseconds,
  millisecondsToIso8601Duration
} from "../src/timeConversion";

const expected = {
  periods: [
    {
      start: 0,
      duration: 5000
    },
    {
      start: 5000,
      duration: 30689
    },
    {
      start: 35689,
      duration: 678909
    }
  ]
};

expected.duration = expected.periods.reduce(
  (a, b) => {
    return { duration: a.duration + b.duration };
  },
  { duration: 0 }
).duration;

const mockDash = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<MPD mediaPresentationDuration="${millisecondsToIso8601Duration(
  expected.duration
)}">
  ${expected.periods
    .map(
      ({ start }) =>
        `<Period start="${millisecondsToIso8601Duration(start)}" />`
    )
    .join("")}
</MPD>
`;

test(t => {
  const result = timingDataFromDash(mockDash);
  t.deepEqual(result, expected);
});
