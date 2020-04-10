/* eslint-disable global-require */
const functions = require('firebase-functions');

exports.functions = functions;

const { testAuth } = require('./utils/testAuth');

// retreive location from google maps
exports.getData = functions.https.onCall(async (data, context) => {
  const { getDataFun } = require('./retrieve/getData');

  const userId = testAuth(context);
  return getDataFun(data, userId);
});

exports.getIndAnnoun = functions.https.onCall(async (data) => {
  const { getIndAnnounFun } = require('./retrieve/getIndAnnoun');

  return getIndAnnounFun(data);
});

exports.getIndividualPost = functions.https.onCall(async (data) => {
  const { getIndividualPostFun } = require('./retrieve/getIndividualPost');

  return getIndividualPostFun(data);
});

exports.getLocationData = functions.https.onCall(async (data) => {
  const { getLocationFunction } = require('./retrieve/getLocationData');

  return getLocationFunction(data);
});

exports.getInitData = functions.https.onCall(async (data) => {
  const { getAreasFun } = require('./retrieve/getAreas');
  const { getAnnouncementsFun } = require('./retrieve/getAnnouncements');

  const initialData = await Promise.all([getAreasFun(data), getAnnouncementsFun()]);
  return initialData;
});

exports.getPopularUsers = functions.https.onCall(async () => {
  const { getPopUserFun } = require('./retrieve/getPopularUsers');

  return getPopUserFun();
});

exports.getPopPosts = functions.https.onCall(async () => {
  const { getPopPostsFun } = require('./retrieve/getPopPosts');

  return getPopPostsFun();
});

exports.getReplies = functions.https.onCall(async (data) => {
  const { getRepliesFun } = require('./retrieve/getReplies');

  return getRepliesFun(data);
});

// submit functions
exports.submitArea = functions.https.onCall(async (data) => {
  const { submitAreaFun } = require('./submitFunctions/submitArea');

  return submitAreaFun(data);
});

exports.submitPost = functions.https.onCall(async (data, context) => {
  const { submitPostFun } = require('./submitFunctions/submitPost');

  const userId = testAuth(context);
  return userId ? submitPostFun(data, userId) : null;
});

exports.submitReply = functions.https.onCall(async (data, context) => {
  const { submitReplyFun } = require('./submitFunctions/submitReply');

  const userId = testAuth(context);
  return userId ? submitReplyFun(data, userId) : null;
});

// userActions
exports.notificationsViewed = functions.https.onCall(async (data, context) => {
  const { notificationsViewedFun } = require('./userActions/notificationsViewed');

  const userId = testAuth(context);
  return userId ? notificationsViewedFun(data, userId) : null;
});

exports.sendMessage = functions.https.onCall(async (data) => {
  const { sendMessageFun } = require('./userActions/sendMessage');

  return sendMessageFun(data);
});

exports.subscribe = functions.https.onCall(async (data, context) => {
  const { subscribeFun } = require('./userActions/subscribe');

  const userId = testAuth(context);
  return userId ? subscribeFun(data, userId) : null;
});

exports.updateProPic = functions.https.onCall(async (data, context) => {
  const { updateProPicFun } = require('./userActions/updateProPic');

  const userId = testAuth(context);
  return userId ? updateProPicFun(data, userId) : null;
});

exports.welcomeEmail = functions.auth.user().onCreate(async (user) => {
  const { welcomeEmailFun } = require('./userActions/welcomeEmail');
  const { createPopUserList } = require('./sched/createPopList');
  createPopUserList();
  return welcomeEmailFun(user);
});

// utils
exports.checkImg = functions.storage.object().onFinalize(async (object) => {
  const { checkImgFun } = require('./utils/checkImg');
  return checkImgFun(object);
});

exports.deleteImg = functions.storage.object().onDelete(async (object) => {
  const { deleteImgFun } = require('./utils/deleteImg');
  return deleteImgFun(object);
});

exports.likeItem = functions.https.onCall(async (data, context) => {
  const { likeItemFun } = require('./utils/likeItem');

  const userId = testAuth(context);
  return userId ? likeItemFun(data, userId) : null;
});

exports.newUserName = functions.https.onCall(async (data, context) => {
  const userId = testAuth(context);
  if (!userId) return null;
  const { setUserName } = require('./utils/setUserName');
  const { requestedUserName } = data;
  return requestedUserName ? setUserName(userId, requestedUserName) : setUserName(userId);
});

// scheduled functions
exports.createPopList = functions.pubsub.schedule('every 60 minutes').onRun(() => {
  const { createPopListFun } = require('./sched/createPopList');
  return createPopListFun();
});

// admin functions
exports.submitAnnouncement = functions.https.onCall(async (data, context) => {
  const { submitAnnouncementFun } = require('./admin/submitAnnouncement');
  const userId = testAuth(context);
  if (!userId) return null;
  return context.auth.token.moderator ? submitAnnouncementFun(data) : null;
});
