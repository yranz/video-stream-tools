export default function streamObjectToArray(streamObject) {
  const obj = JSON.parse(JSON.stringify(streamObject));
  const arr = [];
  Object.keys(obj.groupInsertPoints).forEach(insertPoint => {
    const groupKey = obj.groupInsertPoints[insertPoint];
    const group = obj[groupKey];
    if (groupKey === "video") {
      group.forEach(item => {
        const fileName = item.__FILENAME__;
        delete item.__FILENAME__;
        arr.push(item);
        arr.push(fileName);
      });
    } else {
      group.forEach(item => arr.push(item));
    }
  });
  return arr;
}
