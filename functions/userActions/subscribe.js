const { firestoreRef, fsOtherRef } = require('../utils/admin');

exports.subscribeFun = async (data, userId) => {
  const { subscribeTo } = data;
  const { subscribed } = data;
  const { type } = data;

  const subscriptionRef = firestoreRef.collection('Subscriptions').doc(userId);
  return subscribed
    ? subscriptionRef.update({ [type]: fsOtherRef.FieldValue.arrayRemove(subscribeTo) })
    : subscriptionRef.update({ [type]: fsOtherRef.FieldValue.arrayUnion(subscribeTo) });
};
