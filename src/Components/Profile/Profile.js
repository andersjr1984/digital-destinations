import React, { useContext, useEffect, useState } from 'react';
import {
  Figure, Image, Form, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import './Profile.css';
import FigureCaption from 'react-bootstrap/FigureCaption';
import { LoadingPage, LoadingIcon } from '../../utils/LoadingPage';
import firebase from '../../utils/firebase';
import { UserData, ProfileData, UpdateProfile } from '../../App';
import UserPosts from './UserPosts';
import requestProfile from '../../utils/requestProfile';
import SubButton from './SubButton';
import MapRender from '../Map/MapRender';

const Profile = (props) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState(null);
  const [userImages, setUserImages] = useState(null);
  const [allowEdit, setAE] = useState(false);

  const { match } = props;
  const profileId = match.params.userId;

  const { userId, checkedCred } = useContext(UserData);
  const reqProfile = useContext(ProfileData);

  useEffect(() => {
    const getProfile = async () => {
      const needProfile = profileId !== userId;

      const allInfo = needProfile ? await requestProfile(profileId) : reqProfile;

      setUserImages(allInfo.images);
      setUserPosts(allInfo.posts);
      setUserProfile(allInfo.profile);
      setAE(!needProfile);
    };

    checkedCred && getProfile();
  }, [userId, reqProfile, profileId, checkedCred]);

  if (!userProfile) return <LoadingPage message="Loading Profile" contained />;

  return (
    <div className="ind-profile">
      <Helmet id={`User - ${match.params.userId}`}>
        <title>Profile of {userProfile.userName}</title>
        <meta name="description" content={`Profile of ${userProfile.userName}`} />
        <meta property="og:title" content={`Profile of ${userProfile.userName}`} />
      </Helmet>
      <div className="user-name"><UserName userName={userProfile.userName} allowEdit={allowEdit} /></div>
      {!allowEdit && <SubButton allowSub subId={profileId} type="userSubscriptions" userId={userId} />}
      <div className="profile-content">
        {userProfile && <ProfilePic profile={userProfile} allowEdit={allowEdit} />}
        <UserInfo pins={userProfile.pins} userName={userProfile.userName} />
      </div>
      <div className="posts">
        {userPosts && <UserPosts posts={userPosts} images={userImages} />}
      </div>
    </div>
  );
};

const UserName = (props) => {
  const [update, setUpdate] = useState(false);
  const [requestedUserName, setRequestedUserName] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState(false);
  const updateProfile = useContext(UpdateProfile);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRequesting(true);
    const newUserNameFun = firebase.functions().httpsCallable('newUserName');
    const newUserName = await newUserNameFun({ requestedUserName });
    if (!newUserName.data) setMessage('UserName Taken.');
    else updateProfile([{ item: 'userName', input: newUserName.data }]);
    setUpdate(false);
    setRequesting(false);
  };

  if (requesting) return <LoadingIcon />;

  if (message) {
    return (
      <>
        <h3>{message}</h3>
        {props.allowEdit && <Button size="sm" variant="warning" onClick={() => { setRequestedUserName(''); setMessage(null); setUpdate(true); }}>Update User Name</Button>}
      </>
    );
  }

  if (update) {
    return (
      <Form onSubmit={handleSubmit}>
        <Form.Control
          size="sm"
          required
          name="requestedUserName"
          type="text"
          value={requestedUserName}
          onChange={(event) => setRequestedUserName(event.target.value)}
        />
        <Button type="submit" size="sm">Request Username</Button>
      </Form>
    );
  }

  const { userName, allowEdit } = props;

  return (
    <>
      <h3>{`${userName}'s page`}</h3>{allowEdit && <Button size="sm" onClick={() => setUpdate(true)}>Update User Name</Button>}
    </>
  );
};

const ProfilePic = ({ profile, allowEdit }) => (
  <div className="profile-pic">
    <Figure className="user-pic">
      {profile.proPicUrl
        ? <Image src={profile.proPicUrl} thumbnail />
        : <FontAwesomeIcon icon={faUser} style={{ maxHeight: '200px', width: '150px', minHeight: '180px' }} />}
      {allowEdit && <Link to="/Profile/EditProPic"><FigureCaption>Edit Picture</FigureCaption></Link>}
    </Figure>
  </div>
);

const UserInfo = ({ userName, pins }) => (
  <div className="user-info">
    <h4>{`${userName}'s Map:`}</h4>
    <MapRender proPoints={pins} />
  </div>
);

export default Profile;
