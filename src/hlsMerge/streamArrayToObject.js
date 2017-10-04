export default function streamArrayToObject(streamArray) {
  const arr = streamArray.slice();
  const obj = {
    header: [],
    audio: [],
    video: [],
    groupInsertPoints: {}
  };

  let lastPointer = -1;
  arr.forEach((item, pointer) => {
    const desc = {};
    if (item["STREAM-INF"]) {
      if (!obj.video.length) {
        obj.groupInsertPoints[pointer] = "video";
      }
      obj.video.push(item);
    } else if (typeof item === "string" && arr[lastPointer]["STREAM-INF"]) {
      // NOTE: `__VALUE__` is not a valid m3u8 prop
      //
      // we store the string as `__FILENAME__`
      // so we can optionally sort videos array
      // then `streamObjectToArray` will need to
      // place it back as an item
      arr[lastPointer].__FILENAME__ = item;
    } else if (item.MEDIA && item.MEDIA.TYPE === "AUDIO") {
      if (!obj.audio.length) {
        obj.groupInsertPoints[pointer] = "audio";
      }
      obj.audio.push(item);
    } else {
      if (!obj.header.length) {
        obj.groupInsertPoints[pointer] = "header";
      }
      // NOTE
      // #EXT-X-INDEPENDENT-SEGMENTS ends up being removed
      // so manually set as string
      // see ./NOTES.md
      if (
        item.hasOwnProperty("INDEPENDENT-SEGMENTS") &&
        item["INDEPENDENT-SEGMENTS"] == undefined
      ) {
        obj.header.push("#EXT-X-INDEPENDENT-SEGMENTS");
      } else {
        obj.header.push(item);
      }
    }
    lastPointer = pointer;
  });

  return obj;
}
