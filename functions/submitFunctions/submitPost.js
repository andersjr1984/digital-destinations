/* eslint-disable no-unused-expressions */
const { firestoreRef, fsOtherRef } = require('../utils/admin');
const { createPostArray } = require('../utils/createPostArr');
const { updateNotifications } = require('../utils/updateNotifications');
const { subscribeFun } = require('../userActions/subscribe');
const { createPopPostList } = require('../utils/createPopPostList');

const postArrRef = firestoreRef.collection('PostArrs');

const calculateOverview = (ratings) => {
  if (ratings.length === 0) { return 'N/A'; }
  const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  return arrayAverage(ratings);
};

const updateAreaScore = async (areaId, overviewRating) => {
  const areaRef = firestoreRef.collection('Places').doc(areaId);
  const areaInfoData = await areaRef.get();
  const areaInfo = areaInfoData.data();
  const votes = areaInfo.votes + 1;
  const cumPrevScore = areaInfo.votes * areaInfo.score;
  const cummAreaScore = cumPrevScore + overviewRating;
  const score = cummAreaScore / (votes);
  const posts = areaInfo.posts ? areaInfo.posts + 1 : 1;
  return areaRef.set({
    votes,
    score,
    posts,
  }, { merge: true });
};

exports.submitPostFun = async (data, userId) => {
  const postData = data.post;
  const dataKeys = Object.keys(postData);
  const ratings = [];
  const postArrObj = {};
  const hotOrNot = {};

  dataKeys.forEach((key) => {
    const indPost = postData[key];
    const { text } = indPost;
    const postArrCreate = createPostArray(text);
    const postArr = JSON.parse(JSON.stringify(postArrCreate));
    postArrObj[key] = postArr;

    if (key !== 'overview') {
      hotOrNot[key] = {
        rating: indPost.rating,
        images: indPost.images,
      };
      // eslint-disable-next-line no-restricted-globals
      !isNaN(postData[key].rating) && ratings.push(postData[key].rating);
    } else {
      hotOrNot[key] = {
        images: indPost.coverImage,
      };
    }
  });

  const overviewText = postData.overview.text;

  const shortDesc = postData.overview.text.length > 50
    ? overviewText.substring(0, 45).concat('. . .')
    : overviewText;

  const overviewRating = calculateOverview(ratings);
  hotOrNot.overview.rating = overviewRating;

  const { areaId, areaName } = data.info;
  const { tempPins } = data;

  // todo: continue here!
  if (data.postId) {
    // todo: put in an update function
    return null;
  }
  // upload the post arr to it's own doc
  const postArrReturn = await postArrRef.add({ postArrObj, hotOrNot });

  // call function to update area's score
  const uas = overviewRating !== 'N/A' ? updateAreaScore(areaId, overviewRating) : null;

  // get the location for the postArr
  const postArrLoc = postArrReturn.id;

  const created = fsOtherRef.Timestamp.now().toDate();

  // create the post object, the light-weight item
  const postObj = {
    shortDesc,
    likedBy: [userId],
    overviewRating,
    created,
    userId,
    areaId,
    areaName,
  };

  const bodyObj = { ...data };
  bodyObj.created = created;
  delete bodyObj.info;

  const postRef = firestoreRef.collection('Posts').doc(postArrLoc);
  const updateRef = firestoreRef.collection('UpdatePost').doc(postArrLoc);

  const addPostToUser = firestoreRef.collection('PublicProfile').doc(userId).update(
    { posts: fsOtherRef.FieldValue.increment(1), pins: tempPins },
  );

  const incrementPostCount = firestoreRef.collection('Places').doc(areaId).update(
    { posts: fsOtherRef.FieldValue.increment(1) },
  );

  const subData = {
    subscribeTo: postArrLoc,
    subscribed: false,
    type: 'postSubscriptions',
  };
  const selfSub = subscribeFun(subData, userId);

  const notificationObj = {
    type: 'newPost',
    id: areaId,
    authorId: userId,
    areaName,
    created,
    postId: postArrLoc,
  };
  updateNotifications(notificationObj);

  await Promise.all([postRef.set(postObj), updateRef.set(bodyObj), uas,
    addPostToUser, incrementPostCount, selfSub]);
  createPopPostList();
  return postArrLoc;
};
