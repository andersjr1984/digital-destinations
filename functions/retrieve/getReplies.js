const { firestoreRef } = require('../utils/admin');

exports.getRepliesFun = async (data) => {
  const { postId } = data;
  const replyArr = await this.getRepliesArr(postId);

  if (replyArr.docs) {
    return replyArr.docs.map((replyData) => {
      const reply = replyData.data();
      return reply;
    });
  }

  return [];
};

exports.getRepliesArr = async (postId) => {
  const replyRef = firestoreRef.collection('Replies');
  return replyRef.where('postId', '==', postId).get();
};
