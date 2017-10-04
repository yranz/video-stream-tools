import { test } from "ava";
import request from "request-promise-native";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

// NOTE: by importing the _mockRequestm3u8File test helper
//       a nock handler will be setup for `mockUrl`
//       just confirming that works
test("nock's working", async t => {
  await request(`${mockUrl}/bucket/encoded/video1/hls/stream.m3u8`)
    .catch(reason => t.fail(reason))
    .then(response => {
      t.is(typeof response, "string");
    });

  await request(`${mockUrl}/api/hls/video1/audio/audio0.m3u8`)
    .catch(reason => t.fail(reason))
    .then(response => {
      t.is(typeof response, "string");
    });
});
