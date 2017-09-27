import {test} from 'ava';
import fs from 'fs';
import path from 'path';
import {Parser, Builder} from 'xml2js';
import {toMilliseconds, msToString} from 'iso8601-duration-conversion';

import mpdMerge from './mpdMerge';

const mockRefs = ['video1', 'video2'];

const mockBucketFolderPath = path.resolve(__dirname, '../../fixtures/bucket');

const mpdContents = mpdRef => fs.readFileSync(
  path.join(mockBucketFolderPath, mpdRef, 'dash', 'stream.mpd'),
  'utf8'
);

test('preflight', t => {
  t.is(typeof toMilliseconds, 'function');
  t.is(typeof msToString, 'function');
  t.is(typeof Parser, 'function');
  t.is(typeof Builder, 'function');
  const parser = new Parser();
  const builder = new Builder();

  const mockStrings = [];
  mockRefs.forEach(ref => {
    const str = mpdContents(ref);
    t.is(typeof str, 'string');
    mockStrings.push(str);
  });

  const mockPOJOs = [];
  mockStrings.forEach(str => {
    parser.parseString(str, (err, pojo) => {
      t.is(typeof pojo, 'object');
      t.is(typeof pojo.MPD, 'object');
      t.is(typeof toMilliseconds(pojo.MPD.$.mediaPresentationDuration), 'number');
      t.true(Array.isArray(pojo.MPD.Period));
      mockPOJOs.push(pojo);
    });
  });

  const xml = builder.buildObject(mockPOJOs[0]);
  t.is(typeof xml, 'string');
  t.is(xml.replace(/\s/gi,''), mockStrings[0].replace(/\s/gi,''));

  t.is(typeof mpdMerge, 'function');
});

test('mpdMerge', t => {
  const parser = new Parser();
  const mockFileStrings = mockRefs.map(ref => mpdContents(ref));
  const combined = mpdMerge(mockFileStrings);
  t.is(typeof combined, 'string');
  parser.parseString(combined, (err, pojo) => {
    t.is(pojo.MPD.Period.length, mockRefs.length);
  });
});
