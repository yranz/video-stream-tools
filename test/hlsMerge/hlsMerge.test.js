import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

import hlsMerge from "../../src/hlsMerge/hlsMerge";

test("hlsMerge", async t => {
  const mockData = [
    {
      body: getFileContent("video1", "stream"),
      containerUrl: `${mockUrl}/video1/`,
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/video1/`
      },
      audioStreamPrefix: "http://whatever/api/hls/video1/audio/",
      videoStreamPrefix: "http://whatever/api/hls/video1/video/"
    },
    {
      body: getFileContent("video2", "stream"),
      containerUrl: `${mockUrl}/video1/`,
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/video2/`
      },
      audioStreamPrefix: "/api/hls-audio/video2/",
      videoStreamPrefix: "/api/hls-video/video2/"
    }
  ];
  // await hlsMerge(mockData)
  //   .catch(reason => t.fail(reason))
  //   .then(response => {
  //     t.is(typeof response, "object");
  //     t.is(typeof response.stream, "string");
  //   });
  t.fail('TODO: need to write other parts first');
});
