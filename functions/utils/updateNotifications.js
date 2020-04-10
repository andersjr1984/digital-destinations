const { firestoreRef, fsOtherRef } = require('../utils/admin');

exports.updateNotifications = async (notificationObj) => {
  const {
    type, id, authorId, areaName, created, postId,
  } = notificationObj;

  // this is a link to the post to pass down
  const postLink = `/Posts/${postId}`;

  const userLink = `/Profile/${authorId}`;

  const userNameListRef = firestoreRef.collection('Community').doc('UserNames');
  const userNameListProm = userNameListRef.get();

  const subRef = firestoreRef.collection('Subscriptions');

  // everyone subscribed to a user will get updates
  const userSubRef = subRef.where('userSubscriptions', 'array-contains', authorId);
  const userSubListProm = userSubRef.get();

  // people subscribed to an area will get updates on new posts
  // people subscribed to a post will get updates on new replies
  const subscriberRef = type === 'newPost'
    ? subRef.where('areaSubscriptions', 'array-contains', id)
    : subRef.where('postSubscriptions', 'array-contains', id);
  const subscriberListProm = subscriberRef.get();

  const allData = await Promise.all([
    userNameListProm,
    userSubListProm,
    subscriberListProm,
  ]);

  const authorName = allData[0].data()[authorId];

  // const userMessage = `${authorName} made a new post about ${areaName}.`;
  // const otherMessage = type === 'newReply' ?
  //   `${authorName} responded to a post you are subscribed to about ${areaName}.` :
  //   userMessage;

  const allSubs = [];
  const notificationRef = firestoreRef.collection('Notifications');

  const userSubsData = allData[1];
  const notification = {
    created,
    type,
    authorName,
    userLink,
    areaName,
    postLink,
  };
  const userSubs = userSubsData.docs.map((doc) => {
    if (doc.id === authorId) return null;
    allSubs.push(doc.id);
    return notificationRef.doc(doc.id).update(
      { newNotifications: fsOtherRef.FieldValue.arrayUnion(notification) },
    );
  });

  const otherSubData = allData[2];
  const otherSubs = otherSubData.docs.map((doc) => {
    if (allSubs.includes(doc.id) || doc.id === authorId) return null;
    allSubs.push(doc.id);
    return notificationRef.doc(doc.id).update(
      { newNotifications: fsOtherRef.FieldValue.arrayUnion(notification) },
    );
  });

  return userSubs.concat(otherSubs);
};
