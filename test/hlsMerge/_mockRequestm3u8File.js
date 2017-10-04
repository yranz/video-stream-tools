import fs from "fs";
import path from "path";
import nock from "nock";

export const mockUrl = "http://mock";
const m3u8PathRegExp = /\/bucket\/encoded\/([0-9a-z]+)\/hls\/([0-9a-z-]+)\.m3u8/;
const m3u8ApiPathRegExp = /\/api\/hls\/([0-9a-z]+)\/([audio|video]+)\/([0-9a-z-]+)\.m3u8/;
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

nock(mockUrl)
  .get(m3u8ApiPathRegExp)
  .reply(200, (uri, requestBody) => {
    const matches = m3u8ApiPathRegExp.exec(uri);
    const id = matches[1];
    const type = matches[2];
    const fileName = matches[3];
    return getFileContent(id, fileName);
  });
