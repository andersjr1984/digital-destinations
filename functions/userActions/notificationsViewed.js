/* eslint-disable no-console */
/* eslint-disable max-len */
const { firestoreRef, fsOtherRef } = require('../utils/admin');

exports.notificationsViewedFun = async (data, userId) => {
  const notificationRef = firestoreRef.collection('Notifications').doc(userId);
  const newNotificationsInput = data.newNotifications;
  console.log(data);

  if (newNotificationsInput.length === 0) return null;

  return notificationRef.update({ newNotifications: [], oldNotifications: fsOtherRef.FieldValue.arrayUnion(...newNotificationsInput) });
};
