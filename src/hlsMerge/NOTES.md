The tag: `#EXT-X-INDEPENDENT-SEGMENTS` when parsed by the `m3u8-reader` results in `{INDEPENDENT-SEGMENTS: undefined}` and then when written back to string results in it being omitted.

I tried manually setting it to true (in `streamArrayToObject`):

```
if (
  item.hasOwnProperty("INDEPENDENT-SEGMENTS") &&
  item["INDEPENDENT-SEGMENTS"] == undefined
) {
  item["INDEPENDENT-SEGMENTS"] = true;
}
```

but that results in `#EXT-X-INDEPENDENT-SEGMENTS:` (the added colon)

According to https://tools.ietf.org/html/draft-pantos-http-live-streaming-13 this tag is optional anyway:

> 3.4.16.  EXT-X-INDEPENDENT-SEGMENTS
>
>    The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples
>    in a segment can be decoded without information from other segments.
>    It applies to every segment in the Playlist.
>
>    Its format is:
>
>    #EXT-X-INDEPENDENT-SEGMENTS
>
>    This tag is OPTIONAL. It MUST NOT occur more than once.
>
>    If the EXT-X-INDEPENDENT-SEGMENTS tag appears in a Master Playlist,

~~So I think its ok that it is excluded in end result.~~

UPDATE: was able to fix by manually inserting as string
