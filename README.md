# Video Stream Tools

## Development Commands

* `npm run test`
* watch `npm run test:watch`
* `npm run build`

_NOTE_ no need to run `test:ava` and `test:serve` (they are run by `test` / `test:watch`)

Build should run on install

# About

These tools will merge multiple processed VOD streams
produced by bitmovin (and most likely any process using
the same tools they use - bento4 I think).

A single processed video's container would look like so:

* [uniqueId]/
  * dash/
  * fmp4/
  * hls/
  * ts/

and the files in dash/ and hls/ would be exactly the same
format for each processed video.

See the 2 __fixtures__ in `test/fixtures/bucket/encoded/`
(they exclude fmp4/ and ts/ as they are not required for tests)

## How?

TODO: explain / overview

----

# dashMerge

`import {mpdMerge} from 'video-stream-tools';`

or

`const dashMerge = require('video-stream-tools').dashMerge;`

Arguments

* `data` _Array_ of data _Object_ items:
  * `body` _String_ mpd `xml`
  * `replacePathToSelfRoot` _Object_
    Used to str.replace on the attributes `media` and `initialization` of `Period > AdaptionSet > Representation > SegmentTemplate` nodes.
    Typically this would be:
    * `from` _String_ (set this to `"../"`)
    * `to` _String_ target relative path to the video streams container folder (excluding the folder) relative to where the merged stream would be saved.
    **OR** full url to it the streams container folder.

```
dashMerge([
    {
      body: '<xml...', // of a 'stream.mpd'
      replacePathToSelfRoot: {
        from: '../',
        to: 'somepath-to/[uniqueId]/'
      }
    },
    {
      body: '<xml...', // of a 'stream.mpd'
      replacePathToSelfRoot: {
        from: '../',
        to: 'somepath-to/[uniqueId]/'
      }
    }
  ])
  .then(result => {
    console.log(result);
    // {
    //   stream: {
    //     filename: 'stream.mpd',
    //     content: '<xml ...' // the merged xml
    //   }
    // }
  })
```

# hlsMerge

`import {mpdMerge} from 'video-stream-tools';`

or

`const dashMerge = require('video-stream-tools').dashMerge;`

Arguments

* `data` _Array_ of data _Object_ items:
  * `body` _String_ m3u8 of (stream.m3u8)
  * `containerUrl` _String_ url to the `/hls/` folder
  * `tsStreamPrefix` _String_
    (optional)
    added to start of refs to ts streams
    useful if storing the m3u8's in db
    and you want to serve via api
  * `replacePathToTsRoot`
    (optional)
    used to replace paths to ts files
    * `from` _String_ (set this to `"../"`)
    * `to` typically url to the `/ts/` folder

**IMPORTANT**

> Each `stream.m3u8` should be in the same format
> ie. created via the same process and from videos
> with the same specs etc.
> The same goes for the `dashMerge` tho technically
> it wouldn't matter for dash.

```
hlsMerge([
    {
      body: getFileContent("video1", "stream"),
      containerUrl: `somepath-to/[uniqueId]/hls/`,
      replacePathToTsRoot: {
        from: "../",
        to: `somepath-to/[uniqueId]/`
      },
      tsStreamPrefix: `somepath-to-or-api-path-to/[uniqueId]/ts/`
    },
    {
      body: getFileContent("video2", "stream"),
      containerUrl: `somepath-to/[uniqueId]/hls/`,
      replacePathToTsRoot: {
        from: "../",
        to: `somepath-to/[uniqueId]/`
      },
      tsStreamPrefix: `somepath-to-or-api-path-to/[uniqueId]/ts/`
    }
  ])
  .then(result => {
    console.log(result);
    {
      stream: {
        filename: 'stream.m3u8',
        content: '#EXTM3U...' // (root stream)
      },
      audios: [
        {
          filename: 'audio0.m3u8', // (example)
          content: '#EXTM3U...' // (ts stream)
        }
      ],
      videos: [
        {
          filename: 'video-0-7000000.m3u8', // (example)
          content: '#EXTM3U...' // (ts stream)
        }
      ]
    }
  })
```
