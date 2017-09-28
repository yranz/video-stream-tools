import { Parser, Builder } from "xml2js";
import { toMilliseconds, msToString } from "iso8601-duration-conversion";

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
  let pojoOut;
  const durations = [];
  const getTotalDuration = () => durations.reduce((a, b) => a + b, 0);
  data.forEach(obj => {
    parser.parseString(obj.body, function(err, pojo) {
      if (!pojoOut) {
        pojo.MPD.Period.forEach(Period =>
          replacePathToSelf(Period, obj.replacePathToSelfRoot)
        );
        pojoOut = pojo;
      } else {
        let startOffset = getTotalDuration();
        pojo.MPD.Period.forEach(Period => {
          const start = toMilliseconds(Period.$.start);
          Period.$.start = msToString(start + startOffset);
          replacePathToSelf(Period, obj.replacePathToSelfRoot);
        });
        pojoOut.MPD.Period = pojoOut.MPD.Period.concat(pojo.MPD.Period);
      }
      durations.push(toMilliseconds(pojo.MPD.$.mediaPresentationDuration));
    });
  });

  pojoOut.MPD.$.mediaPresentationDuration = msToString(getTotalDuration());

  return builder.buildObject(pojoOut);
}
