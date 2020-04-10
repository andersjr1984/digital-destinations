const { firestoreRef } = require('./admin');
const { randomName } = require('./lists');

const userNameListRef = firestoreRef.collection('Community').doc('UserNames');

exports.setUserName = async (userId, requestedUserName) => {
  const userNameData = await userNameListRef.get();
  const userNameObj = userNameData.exists ? userNameData.data() : {};
  const currentUsers = Object.keys(userNameObj);

  const publicProfileRef = firestoreRef.collection('PublicProfile').doc(userId);

  const checkName = async (inputName) => {
    for (let i = 0; i < currentUsers.length; i += 1) {
      const tempUID = currentUsers[i];
      if (userNameObj[tempUID].toLowerCase() === inputName.toLowerCase()) {
        if (requestedUserName) {
          return false;
        }
        const nextName = randomName();
        return checkName(nextName);
      }
    }
    await Promise.all([
      userNameListRef.set({ [userId]: inputName }, { merge: true }),
      publicProfileRef.set({ userName: inputName }, { merge: true }),
    ]);
    return inputName;
  };

  if (requestedUserName) {
    return checkName(requestedUserName);
  }
  const nextName = randomName();
  return checkName(nextName);
};
