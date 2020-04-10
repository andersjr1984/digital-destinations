import React, { useEffect, useState, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { LoadingIcon } from '../../utils/LoadingPage';
import firebase from '../../utils/firebase';
import { ProfileData } from '../../App';

const SubButton = (props) => {
  const [subscribed, setSubscribed] = useState(false);
  const [adjSubStatus, setASS] = useState(false);
  const {
    allowSub, subId, type, userId,
  } = props;

  const profileObj = useContext(ProfileData);

  const subscribe = async () => {
    setASS(true);
    const subscribeToUserFun = firebase.functions().httpsCallable('subscribe');
    const data = {
      subscribeTo: subId,
      subscribed,
      type,
    };
    await subscribeToUserFun(data);

    setSubscribed(!subscribed);
    setASS(false);
  };

  useEffect(() => {
    const checkSub = () => {
      if (profileObj.subscriptions[type]) {
        if (profileObj.subscriptions[type].includes(subId)) {
          setSubscribed(true);
        }
      }
    };
    (profileObj) && (profileObj.subscriptions) && checkSub();
    // eslint-disable-next-line
  }, [profileObj]);

  if (adjSubStatus) { return <LoadingIcon />; }

  return subscribed
    ? <Button disabled={!allowSub || !userId} onClick={subscribe} size="sm">Unsubscribe</Button>
    : <Button disabled={!allowSub || !userId} onClick={subscribe} size="sm">Subscribe</Button>;
};

export default SubButton;
