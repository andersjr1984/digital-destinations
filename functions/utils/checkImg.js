const path = require('path');
const { fsOtherRef, firestoreRef, storage } = require('./admin');

exports.checkImgFun = async (object) => {
  const filePath = object.name; // File path in the bucket.
  const deleteImage = () => {
    const fileBucket = object.bucket;
    const file = storage.bucket(fileBucket).file(filePath);
    return file.delete();
  };

  const { userId } = object.metadata;
  const { name } = object.metadata;
  const { areaId } = object.metadata;
  const filename = path.basename(filePath);

  if (filePath.startsWith('Admin/')) return null;

  if (!userId) return deleteImage();

  if (!areaId) return null;

  const prefix = 'https://firebasestorage.googleapis.com/v0/b/digital-destination-94720.appspot.com/o/';
  const pathAdj = filePath.replace(/\//g, '%2F');
  const message = 'alt=media';
  const token = `token=${object.metadata.firebaseStorageDownloadTokens}`;
  const url = `${prefix + pathAdj}?${message}&${token}`;

  const imageInfo = {
    userId,
    name,
    areaId,
    filename,
    url,
    likedBy: [userId],
  };

  const imageRef = firestoreRef.collection('Images');

  const userRef = firestoreRef.collection('PublicProfile').doc(userId);

  return Promise.all([
    userRef.update({ images: fsOtherRef.FieldValue.arrayUnion(filename) }),
    imageRef.add(imageInfo),
  ]);
};
