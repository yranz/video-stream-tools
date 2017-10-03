import {
  parse as iso8601DurationToObject,
  toSeconds as iso8601DurationObjectToSeconds
} from "iso8601-duration";
import { iso8601duration as millisecondsToIso8601Duration } from "milliseconds-to-iso-8601-duration";

const isoDurationToMilliseconds = strIso8601Duration =>
  iso8601DurationObjectToSeconds(iso8601DurationToObject(strIso8601Duration)) *
  1000;

export {
  isoDurationToMilliseconds,
  millisecondsToIso8601Duration,
  iso8601DurationToObject,
  iso8601DurationObjectToSeconds
};
