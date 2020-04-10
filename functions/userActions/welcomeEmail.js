/* eslint-disable max-len */
const { firestoreRef } = require('../utils/admin');
const { setUserName } = require('../utils/setUserName');

exports.welcomeEmailFun = async (user) => {
  const userId = user.uid;

  const { email } = user;
  const displayName = user.displayName ? user.displayName : 'Valued User';

  const randomUserName = await setUserName(userId);

  const subscriptionRef = firestoreRef.collection('Subscriptions').doc(userId);
  const subscriptions = {
    userSubscriptions: [userId],
    areaSubscriptions: [],
    postSubscriptions: [],
  };
  subscriptionRef.set(subscriptions);

  const notificationRef = firestoreRef.collection('Notifications').doc(userId);
  const notificationObj = {
    newNotifications: [],
    oldNotifications: [],
  };
  notificationRef.set(notificationObj);

  if (!email) return null;

  const ddImg = 'https://firebasestorage.googleapis.com/v0/b/digital-destination-94720.appspot.com/o/Rhb6nHKNAxhxziAsv4nbApVSy4f2%2FProfilePics%2FEp7YKK8V?alt=media&token=40d08279-2769-47d6-9528-dacae802e20b';

  const html = `<html>${displayName},<br><br>Thanks for taking a minute to check out Digital Destinations, the travel atlas for a new generation.<br><br>We have chosen a name at random for your user name, it is ${randomUserName}.  It can be changed on your profile page!<br><br>Regards,<br><br>The Digital Destinations Team<img src=${ddImg} alt="digital destinations" /></html>`;

  const subject = 'Digital Destinations: The Modern Travel Atlas';

  const message = { html, subject };

  const mailRef = firestoreRef.collection('mail');

  return mailRef.add({ message, to: email });
};
