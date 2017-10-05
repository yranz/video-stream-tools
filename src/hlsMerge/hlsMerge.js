import m3u8Reader from "m3u8-reader";
import m3u8Writer from "m3u8-write";
import request from "request-promise-native";
import streamArrayToObject from "./streamArrayToObject";
import streamObjectToArray from "./streamObjectToArray";
import streamObjectVideoSortByFileName from "./streamObjectVideoSortByFileName";
import tsStreamArrayToObject from "./tsStreamArrayToObject";
import tsStreamObjectToArray from "./tsStreamObjectToArray";

export default function hlsMerge(data) {
  let streamObjectMaster;
  const tsStreamMasters = { audio: [], video: [] };

  const streamValidShape = streamObject => {
    return (
      streamObjectMaster.header.length === streamObject.header.length &&
      streamObjectMaster.audio.length === streamObject.audio.length &&
      streamObjectMaster.video.length === streamObject.video.length &&
      Object.keys(streamObjectMaster.groupInsertPoints).every(key => {
        return (
          streamObject.groupInsertPoints[key] &&
          streamObject.groupInsertPoints[key] ===
            streamObjectMaster.groupInsertPoints[key]
        );
      })
    );
  };

  let hasBeenRejected = false;
  const createRejection = detail => {
    hasBeenRejected = true;
    return { error: "hlsMerge failed", detail };
  };

  return new Promise((resolve, reject) => {
    const audioStreams = [];
    const videoStreams = [];
    const promises = [];
    // This first loop reads each supplied data
    // the `.body` of which is the content of
    // a `stream.m3u8` file.
    // It sets up some requests and adds them to
    // `promises` as well as initialises the
    // `audioStreams` and `videoStreams` arrays
    // to be used once file data loaded.
    // On success each promise will create a
    // (audio/video)streamObject and place it in the
    // appropriate arrays mentioned.
    // Also if option supplied each `stream.m3u8`
    // streamObject will have its (audio/video)
    // file paths prepended with a prefix
    // (useful for serving the parts via db entries
    // served thru api enpoints)
    data.forEach((dataItem, dataItemIndex) => {
      if (hasBeenRejected) return;
      audioStreams.push([]);
      videoStreams.push([]);

      // Each dataItem.body
      // is assumed to be content of a `stream.m3u8`
      let streamArray;
      try {
        streamArray = m3u8Reader(dataItem.body);
      } catch (err) {
        reject(
          createRejection({
            err,
            msg: "Failed to read m3u8 data"
          })
        );
        return;
      }
      // Create custom parsed object for our purposes
      const streamObj = streamArrayToObject(streamArray);
      if (dataItemIndex === 0) {
        streamObjectMaster = streamObj;
      } else {
        const valid = streamValidShape(streamObj);
        if (!valid) {
          reject(
            createRejection({
              msg: "stream.m3u8's must be same format"
            })
          );
          return;
        }
      }
      streamObj.audio.forEach((audioData, audioIndex) => {
        audioStreams[dataItemIndex].push(null);
        const req = request(
          dataItem.containerUrl + audioData.MEDIA.URI
        ).then(response => {
          let audioStream;
          try {
            audioStream = m3u8Reader(response);
          } catch (err) {
            return Promise.reject(
              createRejection({
                err,
                msg: "failed to read audio m3u8 data"
              })
            );
          }
          audioStreams[dataItemIndex][audioIndex] = tsStreamArrayToObject(
            audioStream
          );
          return true;
        });
        promises.push(req);
        // optionally change the URI
        if (dataItem.audioStreamPrefix) {
          audioData.MEDIA.URI =
            dataItem.audioStreamPrefix + audioData.MEDIA.URI;
        }
      });
      streamObj.video
        .sort(streamObjectVideoSortByFileName)
        .forEach((videoData, videoIndex) => {
          videoStreams[dataItemIndex].push(null);
          const req = request(
            dataItem.containerUrl + videoData.__FILENAME__
          ).then(response => {
            let videoStream;
            try {
              videoStream = m3u8Reader(response);
            } catch (err) {
              return Promise.reject(
                createRejection({
                  err,
                  msg: "failed to read video m3u8 data"
                })
              );
            }
            videoStreams[dataItemIndex][videoIndex] = tsStreamArrayToObject(
              videoStream
            );
            return true;
          });
          promises.push(req);
          // optionally change the URI
          if (dataItem.videoStreamPrefix) {
            videoData.__FILENAME__ =
              dataItem.videoStreamPrefix + videoData.__FILENAME__;
          }
        });
    });
    // don't bother with rest if rejected
    if (hasBeenRejected) return;
    // ==========================
    // Now load all the file data

    Promise.all(promises)
      .catch(reason =>
        reject(
          createRejection({
            reason,
            msg: "loading all the file data failed"
          })
        )
      )
      .then(results => {
        // OK now we should have all the audio / video stream data we need
        data.forEach((dataItem, dataItemIndex) => {
          const tsStreamObjects = {
            audio: audioStreams[dataItemIndex],
            video: videoStreams[dataItemIndex]
          };

          Object.keys(tsStreamObjects).forEach(key => {
            tsStreamObjects[key].forEach((tsStreamObject, i) => {
              if (dataItem.replacePathToTsRoot) {
                // file path replacements
                tsStreamObject.ts.forEach(item => {
                  item.__FILEPATH__ = item.__FILEPATH__.replace(
                    dataItem.replacePathToTsRoot.from,
                    dataItem.replacePathToTsRoot.to
                  );
                });
              }
              if (dataItemIndex === 0) {
                tsStreamMasters[key].push(tsStreamObject);
              } else {
                // do merging
              }
            });
          });

          // const audioStreamObjects = audioStreams[dataItemIndex];
          // const videoStreamObjects = videoStreams[dataItemIndex];
          // audioStreamObjects.forEach((audioStreamObject, i) => {
          //   if (dataItemIndex === 0) {
          //     masterAudioStreamObjects.push(audioStreamObject);
          //   } else {
          //     // do merging
          //   }
          // });
          // videoStreamObjects.forEach((videoStreamObject, i) => {
          //   if (dataItemIndex === 0) {
          //     masterVideoStreamObjects.push(videoStreamObject);
          //   } else {
          //     // do merging
          //   }
          // });

          // FINALLY
          // =======
          // resolve file contents (to be saved in db or as files)
          // 1 * stream (because all should be the same, they point to save generic names)
          // x * audio streams (typically one)
          // x * video streams (for different bitrates)
          // NOTE: we have sorted the order of the video streams
          //       the originals will be in mixed order.
          //       I could not see any pattern to it.
          //       I think they are just written by which
          //       ever gets processed first.
          //       According to spec only the first "matters"
          //       and by thet it means the first will be used
          //       until the others are loaded and the browser
          //       decides which bitrate stream is more appropriate.
          //       By sorting it enables us to make sure we are
          //       mergeing the correct stream data.

          resolve({
            stream: {
              filename: "stream.m3u8",
              content: m3u8Writer(streamObjectToArray(streamObjectMaster))
            },
            audios: tsStreamMasters.audio.map(obj => {
              return {
                filename: obj.__FILENAME__,
                content: m3u8Writer(tsStreamObjectToArray(obj))
              };
            }),
            videos: tsStreamMasters.video.map(obj => {
              return {
                filename: obj.__FILENAME__,
                content: m3u8Writer(tsStreamObjectToArray(obj))
              };
            })
          });
        });
      });
  });
}
