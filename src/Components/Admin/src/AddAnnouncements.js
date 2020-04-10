import React from 'react';
import firebase from '../../../utils/firebase';
import AdminDisplayItems from '../utils/AdminDisplayItems';

const AddAnnouncements = () => {
  const fbRef = firebase.firestore().collection('displayData').doc('announcements');
  const title = 'Announcement';

  return (
    <AdminDisplayItems
      fbRef={fbRef}
      title={title}
    />
  );
};

export default AddAnnouncements;
