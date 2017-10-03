import { test } from "ava";
import fs from "fs";
import path from "path";
import { Parser, Builder } from "xml2js";
import {
  isoDurationToMilliseconds,
  millisecondsToIso8601Duration
} from "../../src/timeConversion";

import mpdMerge from "../../src/mpdMerge/mpdMerge";

const mockRefs = ["video1", "video2"];

const mockBucketFolderPath = path.resolve(
  __dirname,
  "../fixtures/bucket/encoded"
);

const mockRelativePathToEncodedFromMerged = "../encoded";

const mpdContents = mpdRef =>
  fs.readFileSync(
    path.join(mockBucketFolderPath, mpdRef, "dash", "stream.mpd"),
    "utf8"
  );

test("preflight", t => {
  t.is(typeof isoDurationToMilliseconds, "function");
  t.is(typeof millisecondsToIso8601Duration, "function");
  t.is(typeof Parser, "function");
  t.is(typeof Builder, "function");
  const parser = new Parser();
  const builder = new Builder();

  const mockStrings = [];
  mockRefs.forEach(ref => {
    const str = mpdContents(ref);
    t.is(typeof str, "string");
    mockStrings.push(str);
  });

  const mockPOJOs = [];
  mockStrings.forEach(str => {
    parser.parseString(str, (err, pojo) => {
      t.is(typeof pojo, "object");
      t.is(typeof pojo.MPD, "object");
      t.is(
        typeof isoDurationToMilliseconds(pojo.MPD.$.mediaPresentationDuration),
        "number"
      );
      t.true(Array.isArray(pojo.MPD.Period));
      mockPOJOs.push(pojo);
    });
  });

  const xml = builder.buildObject(mockPOJOs[0]);
  t.is(typeof xml, "string");
  t.is(xml.replace(/\s/gi, ""), mockStrings[0].replace(/\s/gi, ""));

  t.is(typeof mpdMerge, "function");
});

test("mpdMerge", t => {
  const parser = new Parser();
  const mockLoadedMpds = mockRefs.map(ref => ({
    id: ref,
    body: mpdContents(ref),
    replacePathToSelfRoot: {
      from: "../",
      to: mockRelativePathToEncodedFromMerged + "/" + ref + "/"
    }
  }));
  const combined = mpdMerge(mockLoadedMpds);
  t.is(typeof combined, "string");
  parser.parseString(combined, (err, pojo) => {
    t.is(pojo.MPD.Period.length, mockRefs.length);
    t.is(
      pojo.MPD.Period[0].AdaptationSet[0].Representation[0].SegmentTemplate[0].$.media.indexOf(
        mockLoadedMpds[0].replacePathToSelfRoot.to
      ),
      0
    );
  });
});
