/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
const { firestoreRef, fsOtherRef } = require('../utils/admin');
const { subscribeFun } = require('../userActions/subscribe');

const appendPopArray = (location, areaId) => {
  const tempLocation = { ...location };
  tempLocation.id = areaId;

  const ppRef = firestoreRef.collection('Popular').doc('PopularPlaces');

  return location.type === 'city'
    ? ppRef.update({ cityArr: fsOtherRef.FieldValue.arrayUnion(tempLocation) })
    : location.type === 'region'
      ? ppRef.update({ regionArr: fsOtherRef.FieldValue.arrayUnion(tempLocation) })
      : location.type === 'country'
        ? ppRef.update({ countryArr: fsOtherRef.FieldValue.arrayUnion(tempLocation) })
        : ppRef.update({ otherArr: fsOtherRef.FieldValue.arrayUnion(tempLocation) });
};

exports.submitAreaFun = async (data, userId) => {
  const location = { ...data.location };
  console.log(location);
  const { name } = location;

  const placesRef = firestoreRef.collection('Places');
  const places = await placesRef.where('name', '==', name).get();

  if (!places.empty) {
    for (let i = 0; i < places.length; i += 1) {
      const doc = places.docs[i];
      const docData = doc.data();
      if (docData.type === location.type) {
        return doc.id;
      }
    }
  }

  location.createdBy = userId || 'Anonymous';
  location.pageViews = 0;
  location.votes = 0;
  location.score = 5;

  // todo: update PopularPlaces if less than 100 places are in list;
  const placesRefAdd = await placesRef.add(location);
  const areaId = placesRefAdd.id;

  if (places.docs.length < 100) {
    appendPopArray(location, areaId);
  }
  const subData = {
    subscribeTo: areaId,
    subscribed: false,
    type: 'areaSubscriptions',
  };

  // eslint-disable-next-line no-unused-expressions
  userId && subscribeFun(subData, userId);

  return areaId;
};
