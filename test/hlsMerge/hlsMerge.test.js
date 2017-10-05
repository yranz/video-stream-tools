import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";
// import request from "request-promise-native";

import hlsMerge from "../../src/hlsMerge/hlsMerge";

// test("requests", async t => {
//   await request("http://mock/bucket/encoded/video1/hls/audio0.m3u8")
//     .then(response => {
//       console.log("WORKS", response);
//       t.is(typeof response, "string");
//     })
//     .catch(t.fail);
// });

test("hlsMerge", async t => {
  const mockData = [
    {
      body: getFileContent("video1", "stream"),
      containerUrl: `${mockUrl}/bucket/encoded/video1/hls/`,
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/video1/`
      },
      audioStreamPrefix: "http://whatever/api/hls/video1/audio/",
      videoStreamPrefix: "http://whatever/api/hls/video1/video/"
    },
    {
      body: getFileContent("video2", "stream"),
      containerUrl: `${mockUrl}/bucket/encoded/video1/hls/`,
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/video2/`
      },
      audioStreamPrefix: "/api/hls-audio/video2/",
      videoStreamPrefix: "/api/hls-video/video2/"
    }
  ];
  await hlsMerge(mockData)
    .catch(reason => t.fail(JSON.stringify(reason, null, 2)))
    .then(response => {
      t.is(typeof response, "object");
      t.is(typeof response.stream, "object");
      // console.log(response);
      // t.fail();
    });
});
