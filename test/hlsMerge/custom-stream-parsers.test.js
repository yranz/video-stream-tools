import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import streamArrayToObject from "../../src/hlsMerge/streamArrayToObject";
import streamObjectToArray from "../../src/hlsMerge/streamObjectToArray";
import streamObjectVideoSortByFileName from "../../src/hlsMerge/streamObjectVideoSortByFileName";
import tsStreamArrayToObject from "../../src/hlsMerge/tsStreamArrayToObject";
import tsStreamObjectToArray from "../../src/hlsMerge/tsStreamObjectToArray";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

test(t => {
  const a = [
    {
      VERSION: "5"
    },
    {
      "MEDIA-SEQUENCE": "0"
    },
    {
      TARGETDURATION: "4"
    },
    {
      EXTINF: "4.010666666666666"
    },
    "http://localhost:1337/bucket/encoded/video1/ts/audio/128000/segment_0.ts",
    {
      EXTINF: "0.9893333333333336"
    },
    "http://localhost:1337/bucket/encoded/video1/ts/audio/128000/segment_1.ts",
    {
      EXTINF: "4.010666666666666"
    },
    "http://localhost:1337/bucket/encoded/video2/ts/audio/128000/segment_0.ts",
    {
      EXTINF: "0.9884611913781187"
    },
    "http://localhost:1337/bucket/encoded/video2/ts/audio/128000/segment_1.ts",
    "#EXT-X-ENDLIST"
  ];

  const content = writer(a);
  t.is(typeof content, "string");
  // console.log(content);
});

test("streamArrayToObject / streamObjectToArray", t => {
  const fileContent = getFileContent("video1", "stream");
  const fileStreamArray = reader(fileContent);
  t.true(Array.isArray(fileStreamArray));
  const fileStreamOut = writer(fileStreamArray);

  const streamObject = streamArrayToObject(fileStreamArray);
  t.is(typeof streamObject, "object");

  const backToArray = streamObjectToArray(streamObject);
  t.true(Array.isArray(backToArray));

  const m3u8Out = writer(backToArray);
  t.is(typeof m3u8Out, "string");

  t.is(fileStreamOut, m3u8Out);

  streamObject.video.sort(streamObjectVideoSortByFileName);
  const sortedBackToArray = streamObjectToArray(streamObject);
  const sortedOut = writer(sortedBackToArray);
  t.not(fileStreamOut, sortedOut);
});

test("tsStreamArrayToObject / tsStreamObjectToArray", t => {
  const fileContent = getFileContent("video1", "audio0");
  const fileStreamArray = reader(fileContent);
  const fileStreamOut = writer(fileStreamArray);
  t.true(Array.isArray(fileStreamArray));
  const streamObject = tsStreamArrayToObject(fileStreamArray);
  t.is(typeof streamObject, "object");
  const backToArray = tsStreamObjectToArray(streamObject);
  t.true(Array.isArray(backToArray));

  t.is(typeof fileStreamOut, "string");
  const backToArrayOut = writer(backToArray);
  t.is(typeof backToArrayOut, "string");
  t.is(fileStreamOut, backToArrayOut);

  streamObject.ts.push({
    EXTINF: "4.010666666666666",
    __FILEPATH__: "../ts/audio/128000/another.ts"
  });
  const anotherAdded = tsStreamObjectToArray(streamObject);
  const anotherAddedOut = writer(anotherAdded);
  t.not(fileStreamOut, anotherAddedOut);
});
