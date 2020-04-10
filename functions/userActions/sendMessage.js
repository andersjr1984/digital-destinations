const { firestoreRef } = require('../utils/admin');

exports.sendMessageFun = (data) => {
  const replyTo = data.email !== '' ? data.email : null;
  const { subject, text } = data;

  const to = 'admin@digital-destinations.com';

  const message = { text, subject };

  const mailRef = firestoreRef.collection('mail');

  return mailRef.add({ message, to, replyTo });
};
