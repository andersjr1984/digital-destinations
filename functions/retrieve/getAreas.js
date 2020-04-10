const { firestoreRef } = require('../utils/admin');

exports.getAreasFun = async () => {
  const ppRef = firestoreRef.collection('Popular').doc('PopularPlaces');

  const ppData = await ppRef.get();
  return ppData.data();
};
