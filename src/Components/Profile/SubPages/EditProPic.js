import React, { useContext, useState, useEffect } from 'react';
import {
  Form, Container, Row, Col, Image, Button,
} from 'react-bootstrap';
import { UserData, ProfileData, UpdateProfile } from '../../../App';
import ImageSelector from '../../../utils/ImageSelector';
import firebase from '../../../utils/firebase';
import { randomString } from '../../../utils/charList';
import './EditProPic.css';
import deleteImageFun from '../../../utils/deleteImageFun';
import { LoadingPage } from '../../../utils/LoadingPage';

const EditProPic = () => {
  const [message, setMessage] = useState(null);

  const userInfo = useContext(UserData);
  const { userId } = userInfo;
  const metadata = { userId };

  const [filename, setFilename] = useState(null);
  const locationRef = `${userId}/ProfilePics/${filename}`;

  const profileObj = useContext(ProfileData);
  const profile = profileObj ? profileObj.profile : null;

  const updateProfile = useContext(UpdateProfile);

  const [working, setWorking] = useState(false);

  const updateDatabaseProfile = async (updateObjArr) => {
    const updateProPicFun = firebase.functions().httpsCallable('updateProPic');
    return updateProPicFun(updateObjArr);
  };

  const newImage = async (tempIndImgData) => {
    const indImgData = tempIndImgData;
    setWorking(true);
    indImgData.filename = filename;
    const profilePicList = profile.prevProPics ? [...profile.prevProPics, indImgData] : [indImgData];
    const updateObjArr = [{ item: 'prevProPics', input: profilePicList }, { item: 'proPicUrl', input: indImgData.url }];
    try {
      await updateDatabaseProfile({ updateObjArr });
      updateProfile(updateObjArr);
    } catch (error) {
      setMessage(<h3>Failed at updating profile picture.</h3>);
    }
    setWorking(false);
  };

  const prevImage = async (event) => {
    const url = event.target.src;
    const updateObjArr = [{ item: 'proPicUrl', input: url }];
    try {
      await updateDatabaseProfile({ updateObjArr });
      updateProfile(updateObjArr);
    } catch (error) {
      setMessage(<h3>Failed at updating profile picture.</h3>);
    }
  };

  const deleteImage = async (image, index) => {
    const { ref } = image;
    const profilePicList = [...profile.prevProPics];
    const proPicUrl = profile.prevProPics.length > 1
      ? profile.proPicUrl === image.url ? profilePicList[0].url : profile.proPicUrl
      : null;
    profilePicList.splice(index, 1);
    const updateObjArr = [{ item: 'prevProPics', input: proPicUrl ? profilePicList : null }, { item: 'proPicUrl', input: proPicUrl }];
    const deleteImageProm = deleteImageFun(ref);
    const updateDBProm = updateDatabaseProfile({ updateObjArr });
    updateProfile(updateObjArr);
    await Promise.all([deleteImageProm, updateDBProm]);
  };

  useEffect(() => {
    const getFilename = () => {
      const randFilename = randomString(8);
      const profilePicList = profile.prevProPics;
      if (profilePicList) {
        for (let i = 0; i < profilePicList.length; i += 1) {
          if (profilePicList.filename === randFilename) return getFilename();
        }
      }
      return setFilename(randFilename);
    };

    profile && getFilename();
  }, [profile]);

  if (!filename) return null;

  return (
    <div className="content update-pro-pic">
      {message}
      <Form>
        {profile && profile.proPicUrl
        && (
          <>
            <h3>Current Profile Pic:</h3>
            <img src={profile.proPicUrl} alt="Current profile." />
          </>
        )}
        <br />
        {profile.prevProPics
        && (
        <>
          <h3>Choose image:</h3>
          <Container>
            <Row className="prev-pic-row">
              {profile.prevProPics.map((prevProPic, index) => {
                const current = profile.proPicUrl === prevProPic.url ? 'current' : 'past';
                return (
                  <Col xs={6} md={4} key={index} className={current}>
                    <Image src={prevProPic.url} rounded alt={`Profile Picture ${index}`} onClick={prevImage} />
                    <Button onClick={() => deleteImage(prevProPic, index)} size="sm" variant="warning">Delete</Button>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </>
        )}
        <h3>Add new image:</h3>
        {working
          ? <LoadingPage contained />
          : (
            <ImageSelector
              locationRef={locationRef}
              newImage={newImage}
              filename={filename}
              metadata={metadata}
              width={400}
              height={400}
            />
          )
        }
        <br />
      </Form>
    </div>
  );
};

export default EditProPic;
