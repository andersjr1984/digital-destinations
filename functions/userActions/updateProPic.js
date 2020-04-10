/* eslint-disable no-console */
const { firestoreRef, fsOtherRef } = require('../utils/admin');

const deleteProPicItems = (delObjArr, userRef) => {
  const delObj = {};
  const numDelItems = delObjArr.length;
  for (let i = 0; i < numDelItems; i += 1) {
    const delItem = delObjArr[i];
    delObj[delItem.item] = fsOtherRef.FieldValue.delete();
  }

  return userRef.update(delObj);
};

exports.updateProPicFun = async (data, userId) => {
  const userRef = firestoreRef.collection('PublicProfile').doc(userId);
  console.log(data);
  const { updateObjArr } = data;
  const updateObj = {};
  const numUpdateItems = updateObjArr.length;
  for (let i = 0; i < numUpdateItems; i += 1) {
    const updateItem = updateObjArr[i];
    if (updateItem.input === null) return deleteProPicItems(updateObjArr, userRef);
    updateObj[updateItem.item] = updateItem.input;
  }

  return userRef.update(updateObj);
};
