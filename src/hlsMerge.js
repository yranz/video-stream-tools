import reader from "m3u8-reader";
import writer from "m3u8-write";

export default function hlsMerge(data) {
  return new Promise((resolve, reject) => {
    let hlsStreamArray;
    const audioArrays = {};
    data.forEach((obj, i) => {
      const streamArray = reader(obj.body);
      if (!hlsStreamArray) {
        hlsStreamArray = streamArray;
      }
    });

    resolve(writer(hlsStreamArray));
  });
}
