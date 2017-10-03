import { test } from "ava";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";

import hlsMerge from "./hlsMerge";

test("hlsMerge", async t => {
  const mockData = [
    {
      body: getFileContent("video1", "stream")
    },
    {
      body: getFileContent("video2", "stream")
    }
  ];
  await hlsMerge(mockData)
    .catch(reason => t.fail(reason))
    .then(response => {
      t.is(typeof response, "string");
    });
});
