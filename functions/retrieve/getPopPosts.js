const { firestoreRef } = require('../utils/admin');

exports.getPopPostsFun = async () => {
  const popPostRef = firestoreRef.collection('Popular').doc('PopularPosts');
  const popPostRetrieve = popPostRef.get();

  const userNameListRef = firestoreRef.collection('Community').doc('UserNames');
  const userNameRetrieve = userNameListRef.get();

  const postPromise = await Promise.all([
    popPostRetrieve,
    userNameRetrieve,
  ]);

  const [postData, userNameData] = postPromise;

  const popPosts = postData.data();

  const userNames = userNameData.data();

  return popPosts.popPosts.map((post) => {
    const tempPost = post;
    tempPost.userName = userNames[tempPost.userId];
    return tempPost;
  });
};
