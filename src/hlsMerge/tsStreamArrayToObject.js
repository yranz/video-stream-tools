export default function tsStreamArrayToObject(streamArray) {
  const arr = streamArray.slice();
  const obj = {
    ts: [],
    other: [],
    groupInsertPoints: {}
  };

  let lastPointer = -1;
  arr.forEach((item, pointer) => {
    if (item.EXTINF) {
      if (!obj.ts.length) {
        obj.groupInsertPoints[pointer] = "ts";
      }
      obj.ts.push(item);
    } else if (typeof item === "string" && arr[lastPointer].EXTINF) {
      // NOTE: `__FILEPATH__` is not a valid m3u8 prop
      //
      // we store the string as `__FILEPATH__`
      // so we can optionally sort videos array
      // then `streamObjectToArray` will need to
      // place it back as an item
      arr[lastPointer].__FILEPATH__ = item;
    } else {
      if (!obj.other.length) {
        obj.groupInsertPoints[pointer] = "other";
      }
      if (item.hasOwnProperty("ENDLIST") && item.ENDLIST == undefined) {
        obj.other.push("#EXT-X-ENDLIST");
      } else {
        obj.other.push(item);
      }
    }
    lastPointer = pointer;
  });

  return obj;
}
