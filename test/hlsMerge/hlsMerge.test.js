import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

import hlsMerge from "../../src/hlsMerge/hlsMerge";

test("hlsMerge", async t => {
  const mockData = [
    {
      body: getFileContent("video1", "stream"),
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/video1/`
      },
      replacePathToAudioStreamsRoot: {
        from: "../",
        to: "/api/hls-audio/video1/" /*audio0.m3u8*/
      },
      replacePathToVideoStreamsRoot: {
        from: "../",
        to: "/api/hls-video/video1/" /*video-0-7000000.m3u8*/
      }
    },
    {
      body: getFileContent("video2", "stream"),
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/video2/`
      },
      replacePathToAudioStreamsRoot: {
        from: "../",
        to: "/api/hls-audio/video2/" /*audio0.m3u8*/
      },
      replacePathToVideoStreamsRoot: {
        from: "../",
        to: "/api/hls-video/video2/" /*video-0-7000000.m3u8*/
      }
    }
  ];
  await hlsMerge(mockData)
    .catch(reason => t.fail(reason))
    .then(response => {
      t.is(typeof response, "object");
      t.is(typeof response.stream, "string");
    });
});
