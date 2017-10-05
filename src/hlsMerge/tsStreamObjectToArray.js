export default function tsStreamObjectToArray(streamObject) {
  const obj = JSON.parse(JSON.stringify(streamObject));
  const arr = obj.other.slice();
  const items = [];
  const insertPoint = Object.keys(obj.groupInsertPoints).find(
    key => obj.groupInsertPoints[key] === "ts"
  );

  obj.ts.forEach(item => {
    const filePath = item.__FILEPATH__;
    delete item.__FILEPATH__;
    items.push(item);
    items.push(filePath);
  });

  arr.splice(insertPoint, 0, ...items);

  return arr;
}
