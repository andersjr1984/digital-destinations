const { firestoreRef, fsOtherRef } = require('./admin');

const updateUserProfile = (authId, isLiked) => {
  const userRef = firestoreRef.collection('PublicProfile').doc(authId);
  return isLiked
    ? userRef.update({ likes: fsOtherRef.FieldValue.increment(1) })
    : userRef.update({ likes: fsOtherRef.FieldValue.increment(-1) });
};

exports.likeItemFun = (data, userId) => {
  const { postId } = data;
  const isLiked = data.tempLiked;
  const { authId } = data;

  // liking a post will not send a replyId; this is how we tell it's a post
  const { replyId } = data;

  if (authId) updateUserProfile(authId, isLiked);

  const itemRef = !replyId
    ? firestoreRef.collection('Posts').doc(postId)
    : firestoreRef.collection('Replies').doc(replyId);
  return isLiked
    ? itemRef.update({ likedBy: fsOtherRef.FieldValue.arrayUnion(userId) })
    : itemRef.update({ likedBy: fsOtherRef.FieldValue.arrayRemove(userId) });
};
