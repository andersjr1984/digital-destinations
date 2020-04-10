import firebase from './firebase';

const convertCreated = (timestamp) => {
  // eslint-disable-next-line no-underscore-dangle
  const nanoseconds = timestamp._nanoseconds;
  // eslint-disable-next-line no-underscore-dangle
  const seconds = timestamp._seconds;
  return new firebase.firestore.Timestamp(seconds, nanoseconds);
};

export default convertCreated;
