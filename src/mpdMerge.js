import { Parser, Builder } from "xml2js";
import {
  isoDurationToMilliseconds,
  millisecondsToIso8601Duration
} from "./timeConversion";

const parser = new Parser();
const builder = new Builder();

const replacePathToSelf = (Period, { to, from }) => {
  if (from && to) {
    Period.AdaptationSet.forEach(AdaptationSet => {
      AdaptationSet.Representation.forEach(Representation => {
        Representation.SegmentTemplate.forEach(SegmentTemplate => {
          ["media", "initialization"].forEach(attr => {
            SegmentTemplate.$[attr] = SegmentTemplate.$[attr].replace(from, to);
          });
        });
      });
    });
  }
};

export default function mpdMerge(data) {
  let mpdPOJO;
  const durations = [];
  const getTotalDuration = () => durations.reduce((a, b) => a + b, 0);
  data.forEach(obj => {
    parser.parseString(obj.body, function(err, pojo) {
      if (!mpdPOJO) {
        pojo.MPD.Period.forEach(Period =>
          replacePathToSelf(Period, obj.replacePathToSelfRoot)
        );
        mpdPOJO = pojo;
      } else {
        let startOffset = getTotalDuration();
        pojo.MPD.Period.forEach(Period => {
          const start = isoDurationToMilliseconds(Period.$.start);
          Period.$.start = millisecondsToIso8601Duration(start + startOffset);
          replacePathToSelf(Period, obj.replacePathToSelfRoot);
        });
        mpdPOJO.MPD.Period = mpdPOJO.MPD.Period.concat(pojo.MPD.Period);
      }
      durations.push(
        isoDurationToMilliseconds(pojo.MPD.$.mediaPresentationDuration)
      );
    });
  });

  mpdPOJO.MPD.$.mediaPresentationDuration = millisecondsToIso8601Duration(
    getTotalDuration()
  );

  return builder.buildObject(mpdPOJO);
}
