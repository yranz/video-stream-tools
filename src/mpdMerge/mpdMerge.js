import {Parser, Builder} from 'xml2js';
import {toMilliseconds, msToString} from 'iso8601-duration-conversion';

const parser = new Parser();
const builder = new Builder();

export default function mpdMerge(mpdStrings = []) {
  let pojoOut;
  const durations = [];
  const getTotalDuration = () => durations.reduce((a, b) => a + b, 0);
  mpdStrings.forEach(str => {
    parser.parseString(str, function (err, pojo) {
      if (!pojoOut) {
        pojoOut = pojo;
      } else {
        let startOffset = getTotalDuration();
        pojo.MPD.Period.forEach(Period => {
          const start = toMilliseconds(Period.$.start);
          Period.$.start = msToString(start + startOffset);
        });
        pojoOut.MPD.Period = pojoOut.MPD.Period.concat(pojo.MPD.Period);
      }
      durations.push(toMilliseconds(pojo.MPD.$.mediaPresentationDuration));
    });
  });

  pojoOut.MPD.$.mediaPresentationDuration = msToString(getTotalDuration());

  return builder.buildObject(pojoOut);
}
