const { admin } = require('../utils/admin');
const { submitDI } = require('../utils/submitDI');

exports.submitAnnouncementFun = async (data) => {
  const announcementRef = admin.firestore().collection('displayData').doc('announcements');

  return submitDI(data, announcementRef);
};
