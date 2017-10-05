import { test } from "ava";
import m3u8Reader from "m3u8-reader";
import { mockUrl, getFileContent } from "./_mockRequestm3u8File";
import tsStreamArrayToObject from '../../src/hlsMerge/tsStreamArrayToObject';

import hlsMerge from "../../src/hlsMerge/hlsMerge";

const mockApiUrl = "http://whatever/api/hls/";

test('works as expected (against fixtures)', async t => {
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
  let merged;
  await hlsMerge(mockData)
    .catch(reason => t.fail(JSON.stringify(reason, null, 2)))
    .then(response => {
      t.is(typeof response, "object");
      t.is(typeof response.stream, "object");
      t.is(typeof response.stream.filename, 'string');
      t.is(typeof response.stream.content, 'string');
      t.true(Array.isArray(response.audios));
      t.is(typeof response.audios[0].filename, 'string');
      t.is(typeof response.audios[0].content, 'string');
      t.true(Array.isArray(response.videos));
      t.is(typeof response.videos[0].filename, 'string');
      t.is(typeof response.videos[0].content, 'string');
      merged = response;
    });

  // Finally check that a merge actually happened
  // to do that create a merge for each mockData item
  // and get the expected count from sample ts data
  await Promise.all([
      hlsMerge([mockData[0]]),
      hlsMerge([mockData[1]])
    ])
    .catch(reason => t.fail(JSON.stringify(reason, null, 2)))
    .then(responses => {
      const mergesSampleObject = tsStreamArrayToObject(m3u8Reader(merged.audios[0].content));
      t.is(typeof mergesSampleObject, 'object');
      const sampleObject0 = tsStreamArrayToObject(m3u8Reader(responses[0].audios[0].content));
      const sampleObject1 = tsStreamArrayToObject(m3u8Reader(responses[1].audios[0].content));
      t.is(typeof sampleObject0, 'object');
      const expected = sampleObject0.ts.length + sampleObject1.ts.length;
      t.is(typeof expected, 'number');
      const actual = mergesSampleObject.ts.length;
      t.is(expected, actual);
    });
});
