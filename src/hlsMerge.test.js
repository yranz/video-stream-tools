import { test } from "ava";
import fs from "fs";
import path from "path";
import nock from "nock";
import reader from "m3u8-reader";
import writer from "m3u8-write";
import request from "request-promise-native";

import hlsMerge from "./hlsMerge";

const mockUrl = "http://whatever/bucket/encoded";
const m3u8PathRegExp = /\/([0-9a-z]+)\/hls\/([0-9a-z-]+)\.m3u8/;
const mockBucketFolderPath = path.resolve(
  __dirname,
  "../fixtures/bucket/encoded"
);

const mockContent = {};
const getFileContent = (id, fileName) => {
  const key = id + fileName;
  let content = mockContent[key];
  if (content) {
    return content;
  }
  content = fs.readFileSync(
    path.join(mockBucketFolderPath, id, "hls", `${fileName}.m3u8`)
  );
  mockContent[key] = content;
  return content;
};

nock(mockUrl)
  .get(m3u8PathRegExp)
  .reply(200, (uri, requestBody) => {
    const matches = m3u8PathRegExp.exec(uri);
    const id = matches[1];
    const fileName = matches[2];
    return getFileContent(id, fileName);
  });

test("nock working", async t => {
  await request(`${mockUrl}/video1/hls/stream.m3u8`)
    .catch(reason => t.fail(reason))
    .then(response => {
      t.is(typeof response, "string");
    });
});

test("Assume stream.m3u8's are the same", t => {
  const stream1 = reader(getFileContent("video1", "stream"));
  const stream2 = reader(getFileContent("video2", "stream"));
  t.deepEqual(stream1, stream2);
});

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
