import { test } from "ava";
import m3u8Reader from "m3u8-reader";
import m3u8Writer from "m3u8-write";
import streamArrayToObject from "../../src/hlsMerge/streamArrayToObject";
import streamObjectToArray from "../../src/hlsMerge/streamObjectToArray";
import streamObjectVideoSortByFileName from "../../src/hlsMerge/streamObjectVideoSortByFileName";
import tsStreamArrayToObject from "../../src/hlsMerge/tsStreamArrayToObject";
import tsStreamObjectToArray from "../../src/hlsMerge/tsStreamObjectToArray";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

test("streamArrayToObject / streamObjectToArray", t => {
  const fileContent = getFileContent("video1", "stream");
  const fileStreamArray = m3u8Reader(fileContent);
  t.true(Array.isArray(fileStreamArray));
  const fileStreamOut = m3u8Writer(fileStreamArray);

  const streamObject = streamArrayToObject(fileStreamArray);
  t.is(typeof streamObject, "object");

  const backToArray = streamObjectToArray(streamObject);
  t.true(Array.isArray(backToArray));

  const m3u8Out = m3u8Writer(backToArray);
  t.is(typeof m3u8Out, "string");

  t.is(fileStreamOut, m3u8Out);

  streamObject.video.sort(streamObjectVideoSortByFileName);
  const sortedBackToArray = streamObjectToArray(streamObject);
  const sortedOut = m3u8Writer(sortedBackToArray);
  t.not(fileStreamOut, sortedOut);
});

test("tsStreamArrayToObject / tsStreamObjectToArray", t => {
  const fileContent = getFileContent("video1", "audio0");
  const fileStreamArray = m3u8Reader(fileContent);
  const fileStreamOut = m3u8Writer(fileStreamArray);
  t.true(Array.isArray(fileStreamArray));
  const streamObject = tsStreamArrayToObject(fileStreamArray);
  t.is(typeof streamObject, "object");
  const backToArray = tsStreamObjectToArray(streamObject);
  t.true(Array.isArray(backToArray));

  t.is(typeof fileStreamOut, "string");
  const backToArrayOut = m3u8Writer(backToArray);
  t.is(typeof backToArrayOut, "string");
  t.is(fileStreamOut, backToArrayOut);

  streamObject.ts.push({
    EXTINF: "4.010666666666666",
    __FILEPATH__: "../ts/audio/128000/another.ts"
  });
  const anotherAdded = tsStreamObjectToArray(streamObject);
  const anotherAddedOut = m3u8Writer(anotherAdded);
  t.not(fileStreamOut, anotherAddedOut);
});
