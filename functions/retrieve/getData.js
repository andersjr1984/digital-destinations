/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
const { firestoreRef, fsOtherRef } = require('../utils/admin');

const userNameListRef = firestoreRef.collection('Community').doc('UserNames');
const adjustNotifications = (newNotifications, oldNotifications) => {
  // if there are no old notifications, don't need to change array
  if (!oldNotifications) return [];

  // want to calculate number of notifications so we have 100 total
  const numNotifcationsReq = newNotifications ? 100 - newNotifications.length : 100;

  // if there are more than 100 new notifications, the number is negative
  // we can return an empty array
  if (numNotifcationsReq < 0) return [];

  console.log(oldNotifications);
  if (oldNotifications.length < numNotifcationsReq) return oldNotifications;

  // return either the full oldNotification array
  // or return an appended oldNotification array
  return oldNotifications.slice(0, numNotifcationsReq - 1);
};

const getNotifications = async (userId) => {
  const notRef = firestoreRef.collection('Notifications').doc(userId);
  return notRef.get();
};

const getSubscriptions = async (userId) => {
  const subRef = firestoreRef.collection('Subscriptions').doc(userId);
  return subRef.get();
};

const getPosts = async (searchKey, searchValue) => {
  const postRef = firestoreRef.collection('Posts').where(searchKey, '==', searchValue);
  return postRef.get();
};

const getImages = async (searchKey, searchValue) => {
  const imageRef = firestoreRef.collection('Images').where(searchKey, '==', searchValue);
  return imageRef.get();
};

const getProfile = async (userId) => {
  const userRef = firestoreRef.collection('PublicProfile').doc(userId);
  return userRef.get();
};

const getArea = async (areaId) => {
  const areaRef = firestoreRef.collection('Places').doc(areaId);
  return areaRef.get();
};

const updatePageViews = async (searchKey, searchValue, userId) => {
  if (searchKey === 'areaId') {
    const areaRef = firestoreRef.collection('Places').doc(searchValue);
    return areaRef.update({ pageViews: fsOtherRef.FieldValue.increment(1) });
  }
  if (userId && userId === searchValue) return null;
  const profileRef = firestoreRef.collection('PublicProfile').doc(searchValue);
  return profileRef.update({ pageViews: fsOtherRef.FieldValue.increment(1) });
};

exports.getDataFun = async (data, userId) => {
  // todo: get usernames and add them.  don't add username to image.
  console.log(data);
  // determine if you are searching for users or areas
  const { searchKey } = data;
  // the id of what you are looking for
  const { searchValue } = data;
  const images = getImages(searchKey, searchValue);

  userId ? updatePageViews(searchKey, searchValue, userId) : updatePageViews(searchKey, searchValue);

  const userNameList = userNameListRef.get();

  const posts = getPosts(searchKey, searchValue);

  const profile = data.needProfile
    ? getProfile(searchValue)
    : searchKey === 'areaId' ? getArea(searchValue) : null;

  // only need subscriptions if the user is searching for thier own profile
  const subscriptions = (searchKey === 'userId' && userId === searchValue)
    ? getSubscriptions(userId) : null;

  // only need subscriptions if the user is searching for thier own profile
  const notifications = (searchKey === 'userId' && userId === searchValue)
    ? getNotifications(userId) : null;

  const allData = await Promise.all([
    images,
    posts,
    profile,
    subscriptions,
    notifications,
    userNameList,
  ]);
  const userNameItem = allData.length - 1;
  const userNames = allData[userNameItem].data();

  const returnData = allData.slice(0, userNameItem);

  return returnData.map((areaItems) => {
    if (!areaItems) return null;
    if (!areaItems.docs) {
      const area = areaItems.data();
      if (!area) return null;
      area.userId && (area.author = userNames[area.userId]);
      area.oldNotifications && (area.oldNotifications = adjustNotifications(area.newNotifications, [...area.oldNotifications]));
      return area;
    }
    return areaItems.docs.map((doc) => {
      const returnObj = doc.data();
      returnObj.id = doc.id;
      returnObj.userId && (returnObj.author = userNames[returnObj.userId]);
      return returnObj;
    });
  });
};
