/* eslint-disable no-console */
const path = require('path');
const { fsOtherRef, firestoreRef } = require('./admin');

const getId = (imageListDocs, userId) => {
  const imageList = imageListDocs.docs;
  const imageNum = imageList.length;
  for (let i = 0; i < imageNum; i += 1) {
    const doc = imageList[i];
    if (doc.data().userId === userId) return doc.id;
  }
  return null;
};

exports.deleteImgFun = async (object) => {
  const filePath = object.name; // File path in the bucket.

  const { userId } = object.metadata;
  const { areaId } = object.metadata;
  const filename = path.basename(filePath);

  if (!areaId) return null;

  const imageRef = firestoreRef.collection('Images');
  const imageListDocs = await imageRef.where('filename', '==', filename).get();
  const imageDocId = getId(imageListDocs, userId);
  if (!imageDocId) {
    console.log('user does not have authority');
    return null;
  }
  const deletedImageRef = imageRef.doc(imageDocId);

  const userRef = firestoreRef.collection('PublicProfile').doc(userId);

  return Promise.all([
    userRef.update({ images: fsOtherRef.FieldValue.arrayRemove(filename) }),
    deletedImageRef.delete(),
  ]);
};
