/* eslint-disable no-unused-expressions */
/* eslint-disable max-len */
const { firestoreRef } = require('../utils/admin');
const { adjustTheseCoords } = require('../utils/adjustTheseCoords');
const { createPopPostList } = require('../utils/createPopPostList');

const calcIndUserScore = (user, topScores) => {
  const pvWeight = 0.3;
  const pnWeight = 0.2;
  const rnWeight = 0.2;
  const likesWeight = 0.3;

  const { topPageViews } = topScores;
  const { topPostNum } = topScores;
  const { topReplyNum } = topScores;
  const { topLikes } = topScores;

  const userPageViews = user.pageViews ? user.pageViews : 1;
  const userPostNum = user.postNum ? user.postNum : 1;
  const userReplyNum = user.replyCount ? user.replyCount : 1;
  const userLikes = user.likes ? user.likes : 1;

  const pvScore = userPageViews / topPageViews;
  const pnScore = userPostNum / topPostNum;
  const rnScore = userReplyNum / topReplyNum;
  const likesScore = userLikes / topLikes;

  const score = pvScore * pvWeight + pnScore * pnWeight + rnScore * rnWeight + likesScore * likesWeight;
  return score.toFixed(3);
};

const createPopUserList = async () => {
  const userRef = firestoreRef.collection('PublicProfile');

  const allTopVals = await Promise.all([
    userRef.orderBy('pageViews').limit(1).get(),
    userRef.orderBy('posts').limit(1).get(),
    userRef.orderBy('replyCount').limit(1).get(),
    userRef.orderBy('likes').limit(1).get(),
    userRef.get(),
  ]);

  const oftenViewedUser = allTopVals[0];
  const topViewedUser = oftenViewedUser.docs[0] ? oftenViewedUser.docs[0].data() : null;
  const topPageViews = topViewedUser ? topViewedUser.pageViews : 1;

  const topPostUser = allTopVals[1];
  const topPoster = topPostUser.docs[0] ? topPostUser.docs[0].data() : null;
  const topPostNum = topPoster ? topPoster.posts : 1;

  const topResponders = allTopVals[2];
  const topResponder = topResponders.docs[0] ? topResponders.docs[0].data() : null;
  const topReplyNum = topResponder ? topResponder.replyCount : 1;

  const mostLikedUsers = allTopVals[3];
  const mostLiked = mostLikedUsers.docs[0] ? mostLikedUsers.docs[0].data() : null;
  const topLikes = mostLiked ? mostLiked.likes : 1;

  const userArrRet = allTopVals[4];

  const topScores = {
    topPageViews,
    topPostNum,
    topReplyNum,
    topLikes,
  };

  const userArr = [];
  userArrRet.docs.forEach((userData) => {
    const user = userData.data();
    const score = calcIndUserScore(user, topScores);
    const { id } = userData;
    userArr.push({ score, id });
  });

  userArr.sort((a, b) => (b.score - a.score));

  userArr.forEach((user, index) => {
    const rank = index + 1;
    userRef.doc(user.id).set({ rank }, { merge: true });
  });

  return firestoreRef.collection('Popular').doc('PopularUsers').set({ userArr: userArr.slice(0, 99) });
};

const createPopAreaList = async () => {
  const placesRef = firestoreRef.collection('Places');
  const placesSnapshot = await placesRef.orderBy('score', 'desc').limit(100).get();
  const placesDocs = placesSnapshot.docs;
  const cityArr = [];
  const regionArr = [];
  const countryArr = [];
  const otherArr = [];
  const width = 960;
  const height = 600;

  let maxPageViews = 1;
  let maxVotes = 1;

  const places = placesDocs.map((doc) => {
    const place = doc.data();
    place.id = doc.id;
    !place.adjustedCoords && (place.adjustedCoords = adjustTheseCoords(width, height, place.coordinates));
    place.pageViews > maxPageViews && (maxPageViews = place.pageViews);
    place.votes > maxVotes && (maxVotes = place.votes);
    return place;
  });

  const calcPlaceScore = (place) => {
    const { score } = place;
    const { pageViews } = place;
    const { votes } = place;
    const adjScore = score / 9;
    const adjPV = pageViews / maxPageViews;
    const adjVotes = votes / maxVotes;

    const scoreWeight = 5;
    const pageViewWeight = 3;
    const voteWeight = 2;

    return (adjScore * scoreWeight + adjPV * pageViewWeight + adjVotes * voteWeight);
  };

  places.forEach((place) => {
    const tempPlace = place;
    tempPlace.adjustedScore = calcPlaceScore(tempPlace);
    if (tempPlace.type === 'city') {
      cityArr.push(tempPlace);
    } else if (tempPlace.type === 'region') {
      regionArr.push(tempPlace);
    } else if (tempPlace.type === 'country') {
      countryArr.push(tempPlace);
    } else { otherArr.push(tempPlace); }
  });

  const placeObj = {
    cityArr,
    regionArr,
    countryArr,
    otherArr,
  };

  return firestoreRef.collection('Popular').doc('PopularPlaces').set(placeObj);
};

exports.createPopListFun = async () => {
  const popAreas = createPopAreaList();
  const popUsers = createPopUserList();
  const popPosts = createPopPostList();

  return Promise.all([popAreas, popUsers, popPosts]);
};

exports.createPopUserList = createPopUserList;
