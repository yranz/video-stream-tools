import reader from "m3u8-reader";
import writer from "m3u8-write";
import streamArrayToObject from "./streamArrayToObject";
import streamObjectToArray from "./streamObjectToArray";
import streamObjectVideoSortByFileName from "./streamObjectVideoSortByFileName";

export default function hlsMerge(data) {
  return new Promise((resolve, reject) => {
    let mainStreamObject;
    const audioStreams = [];
    const videoStreams = [];

    data.forEach((obj, i) => {
      const streamObj = streamArrayToObject(reader(obj.body));

      if (!mainStreamObject) {
        mainStreamObject = streamObj;
        console.log(streamObj.audio[0].MEDIA);
      }
    });

    resolve({
      stream: writer(streamObjectToArray(mainStreamObject))
    });
  });
}
