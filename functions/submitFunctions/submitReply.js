const { firestoreRef, fsOtherRef } = require('../utils/admin');
const { createPostArray } = require('../utils/createPostArr');
const { updateNotifications } = require('../utils/updateNotifications');
const { subscribeFun } = require('../userActions/subscribe');

exports.submitReplyFun = async (data, userId) => {
  const { postId } = data;
  const text = data.replyText;
  const postArrCreate = createPostArray(text);
  const postArr = JSON.parse(JSON.stringify(postArrCreate));
  const created = fsOtherRef.Timestamp.now().toDate();
  const { areaName } = data;

  const replyObj = {
    userId,
    likedBy: [userId],
    postArr,
    created,
    postId,
  };

  // initial upload of reply
  const replyRef = firestoreRef.collection('Replies');
  const replyReturn = await replyRef.add(replyObj);
  const replyLoc = replyReturn.id;

  // add reference to reply in user's profile
  const userRef = firestoreRef.collection('PublicProfile').doc(userId);
  const updateUserReplies = userRef.update({ replies: fsOtherRef.FieldValue.arrayUnion(replyLoc) });
  userRef.update({ replyCount: fsOtherRef.FieldValue.increment(1) });

  // create an object to update and post to "UpdateReply" collection
  const updateObj = { ...replyObj };
  updateObj.text = text;
  delete updateObj.likedBy;
  delete updateObj.postArr;
  const updateReplyRef = firestoreRef.collection('UpdateReply');
  const updateReplyCheck = updateReplyRef.add(updateObj);
  const subData = {
    subscribeTo: postId,
    subscribed: false,
    type: 'postSubscriptions',
  };
  const selfSub = subscribeFun(subData, userId);

  const notificationObj = {
    type: 'newReply',
    id: postId,
    authorId: userId,
    areaName,
    created,
    postId,
  };
  updateNotifications(notificationObj);

  return Promise.all([updateUserReplies, updateReplyCheck, selfSub]);
};
