const { firestoreRef } = require('../utils/admin');

exports.getIndAnnounFun = async (data) => {
  const anounRef = firestoreRef.collection('displayData').doc('announcements');

  const anounData = await anounRef.get();
  return anounData.data()[data];
};
