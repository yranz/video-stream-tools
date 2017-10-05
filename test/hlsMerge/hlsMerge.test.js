import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

import hlsMerge from "../../src/hlsMerge/hlsMerge";

const mockApiUrl = "http://whatever/api/hls/";

test("hlsMerge", async t => {
  const mockData = [
    {
      body: getFileContent("video1", "stream"),
      containerUrl: `${mockUrl}/bucket/encoded/video1/hls/`,
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/bucket/encoded/video1/`
      },
      tsStreamPrefix: `${mockApiUrl}video1/ts/`
    },
    {
      body: getFileContent("video2", "stream"),
      containerUrl: `${mockUrl}/bucket/encoded/video2/hls/`,
      replacePathToTsRoot: {
        from: "../",
        to: `${mockUrl}/bucket/encoded/video2/`
      },
      tsStreamPrefix: `${mockApiUrl}video2/ts/`
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
