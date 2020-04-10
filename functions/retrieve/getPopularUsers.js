const { firestoreRef } = require('../utils/admin');

exports.getPopUserFun = async () => {
  const puRef = firestoreRef.collection('Popular').doc('PopularUsers');
  const puRetrieve = puRef.get();

  const userNameListRef = firestoreRef.collection('Community').doc('UserNames');
  const userNameRetrieve = userNameListRef.get();

  const userPromise = await Promise.all([
    puRetrieve,
    userNameRetrieve,
  ]);

  const puData = userPromise[0];
  const popUser = puData.data();

  const userNameData = userPromise[1];
  const userNames = userNameData.data();

  return popUser.userArr.map((user) => {
    const tempUser = user;
    tempUser.userName = userNames[user.id];
    return tempUser;
  });
};
