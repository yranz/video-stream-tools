import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import streamArrayToObject from "../../src/hlsMerge/streamArrayToObject";
import streamObjectToArray from "../../src/hlsMerge/streamObjectToArray";
import streamObjectVideoSortByFileName from "../../src/hlsMerge/streamObjectVideoSortByFileName";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

test(t => {
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
