import React, { useEffect, useState } from 'react';
import firebase from '../../utils/firebase';
import { LoadingPage } from '../../utils/LoadingPage';
import { PageDoesNotExist } from '../Area/Area';
import CreateRender from './CreateRender';

import './IndAnnouncement.css';

const IndAnnouncement = (props) => {
  const [announ, setAnnoun] = useState(null);
  const [loading, setLoading] = useState(true);
  const { match } = props;
  const { annId } = match.params;

  useEffect(() => {
    const getIndAnnoun = async () => {
      const getIndAnnounFun = firebase.functions().httpsCallable('getIndAnnoun');
      const indAnnounData = await getIndAnnounFun(annId);
      const indAnnoun = indAnnounData.data;
      if (indAnnoun) setAnnoun(indAnnoun);
      setLoading(false);
    };

    annId && getIndAnnoun();
  }, [annId]);

  if (loading) return <LoadingPage message="Loading Announcement" contained />;

  if (!announ) return <PageDoesNotExist />;

  return (
    <div className="ind-announ">
      <h1>{announ.name}</h1>
      <CreateRender displayItem={announ} />
    </div>
  );
};

export default IndAnnouncement;
