# Video Stream Tools

## Development Commands

* `npm run test`
* watch `npm run test:watch`
* `npm run build`

_NOTE_ no need to run `test:ava` and `test:serve` (they are run by `test` / `test:watch`)

Build should run on install

## mpdMerge

`import {mpdMerge} from 'video-stream-tools';`

or

`const mpdMerge = require('video-stream-tools').mpdMerge;`

Arguments

* `data` _Array_ of data _Object_ items:
  * `body` _String_ mpd `xml`
  * `replacePathToSelfRoot` _Object_
    Used to str.replace on the attributes `media` and `initialization` of `Period > AdaptionSet > Representation > SegmentTemplate` nodes.
    Typically this would be:
    * `from` _String_ (set this to `"../"`)
    * `to` _String_ target relative path to the video streams container folder (excluding the folder) relative to where the merged stream would be saved.
    **OR** full url to it the streams container folder.
