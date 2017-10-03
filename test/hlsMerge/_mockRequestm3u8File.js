import fs from "fs";
import path from "path";
import nock from "nock";

export const mockUrl = "http://whatever/bucket/encoded";
const m3u8PathRegExp = /\/([0-9a-z]+)\/hls\/([0-9a-z-]+)\.m3u8/;
const mockBucketFolderPath = path.resolve(
  __dirname,
  "../fixtures/bucket/encoded"
);

const mockContent = {};
export const getFileContent = (id, fileName) => {
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
