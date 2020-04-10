const { firestoreRef } = require('./admin');

exports.createPopPostList = async () => {
  const postRef = firestoreRef.collection('Posts').orderBy('created').limit(30);
  const postSnapshot = await postRef.get();
  const pvWeight = 3;
  const likeWeight = 7;
  let maxPostViews = 1;
  let maxLikes = 1;
  const postDocs = postSnapshot.docs;
  const posts = postDocs.map((postData) => {
    const post = postData.data();
    post.postId = postData.id;
    if (post.postViews > maxPostViews) { maxPostViews = post.postViews; }
    if (post.likedBy.length > maxLikes) { maxLikes = post.likedBy.length; }
    return post;
  });
  const calcIndPostScore = (post) => {
    const tempPost = post;
    const { postViews } = tempPost;
    const likes = tempPost.likedBy.length;
    if (postViews === 0 && likes === 0) {
      tempPost.score = 1;
      return tempPost;
    }
    const adjPV = (postViews || 1) / maxPostViews;
    const adjLikes = (likes || 1) / maxLikes;
    const adjScore = adjPV * pvWeight + adjLikes * likeWeight;
    tempPost.score = adjScore;
    return tempPost;
  };
  const popPosts = posts.map((post) => calcIndPostScore(post));
  return firestoreRef.collection('Popular').doc('PopularPosts').set({ popPosts });
};
