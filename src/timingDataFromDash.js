import { Parser, Builder } from "xml2js";
import { isoDurationToMilliseconds } from "./timeConversion";

const parser = new Parser();

export default function timingDataFromDash(xml) {
  const timingData = {};
  parser.parseString(xml, (err, pojo) => {
    const nPeriods = pojo.MPD.Period.length;
    timingData.duration = isoDurationToMilliseconds(
      pojo.MPD.$.mediaPresentationDuration
    );
    timingData.periods = pojo.MPD.Period.map((Period, i) => {
      const start = isoDurationToMilliseconds(Period.$.start);
      const next = i + 1;
      const nextStart =
        next === nPeriods
          ? timingData.duration
          : isoDurationToMilliseconds(pojo.MPD.Period[next].$.start);
      return {
        start,
        duration: nextStart - start
      };
    });
  });
  return timingData;
}
