import { test } from "ava";
import request from "request-promise-native";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

test('helper works', t => {
  const fileBuffer = getFileContent("video1", "stream");
  t.is(typeof fileBuffer, "object");
});
