/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
const { firestoreRef, fsOtherRef } = require('../utils/admin');
const { getRepliesArr } = require('./getReplies');

const userNameListRef = firestoreRef.collection('Community').doc('UserNames');

exports.getIndividualPostFun = async (data) => {
  console.log(data);
  const { postId } = data;

  const userNameList = userNameListRef.get();

  const postInfoRef = firestoreRef.collection('Posts').doc(postId);
  const postInfo = postInfoRef.get();
  postInfoRef.update({ postViews: fsOtherRef.FieldValue.increment(1) });

  const postArrRef = firestoreRef.collection('PostArrs').doc(postId);
  const postArr = postArrRef.get();

  const replyArr = getRepliesArr(postId);

  const postData = await Promise.all([postArr, postInfo, replyArr, userNameList]);

  const userNames = postData[3].data();

  postData.pop();

  return postData.map((postItemData) => {
    if (!postItemData) return null;
    if (!postItemData.docs) {
      const postItem = postItemData.data();
      postItem.userId && (postItem.author = userNames[postItem.userId]);
      return postItem;
    }
    return postItemData.docs.map((doc) => {
      const returnObj = doc.data();
      returnObj.id = doc.id;
      returnObj.userId && (returnObj.author = userNames[returnObj.userId]);
      return returnObj;
    });
  });
};
