import React, { useEffect, useState, createContext } from 'react';
import './App.css';
import * as d3 from 'd3';

import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/all.css';

import firebase, { auth } from './utils/firebase';

import PageDisplay from './Components/Routing/PageDisplay';
import { LoadingPage } from './utils/LoadingPage';
import requestProfile from './utils/requestProfile';

export const PopularItems = createContext();
export const UserData = createContext();
export const ProfileData = createContext();
export const NotificationData = createContext();
export const UpdateProfile = createContext();
export const AnnouncementsData = createContext();

const width = 960;
const height = 500;
const projection = d3.geoNaturalEarth1()
  .scale(153)
  .translate([width / 2, height / 2]);
export const displayInfo = {
  projection,
  width,
  height,
};

function App() {
  const [popularCities, setPopCity] = useState(null);
  const [popularRegions, setPopReg] = useState(null);
  const [popularCountries, setPopCountries] = useState(null);
  const [popularOther, setPopOther] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState(null);
  const [profileObj, setProfile] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [checkedCred, setCC] = useState(false);

  // todo: get rid of this when going to profile listener
  const updateProfile = (updateObjArr) => {
    const tempPro = { ...profileObj };
    updateObjArr.forEach((updateObj) => {
      const { item } = updateObj;
      const { input } = updateObj;
      tempPro.profile[item] = input;
    });
    // todo: update profile in firebase function
    setProfile(tempPro);
  };

  // todo: need to have this be a profile listener
  useEffect(() => {
    const getProfile = async () => {
      const userObjRet = await requestProfile(userId);
      const tempPro = {};
      const userObjKeys = Object.keys(userObjRet);
      userObjKeys.forEach((key) => {
        if (key === 'notifications') setNotifications(userObjRet[key]);
        else tempPro[key] = userObjRet[key];
      });
      setProfile(tempPro);
    };

    (userId && !profileObj) && getProfile();
    (!userId && profileObj) && setProfile(null);
    // eslint-disable-next-line
  }, [userId])

  useEffect(() => {
    const getPopularCities = async () => {
      try {
        const ppFun = firebase.functions().httpsCallable('getInitData');
        const ppData = await ppFun({ width, height });
        const pp = ppData.data;
        setPopCity(pp[0].cityArr);
        setPopReg(pp[0].regionArr);
        setPopCountries(pp[0].countryArr);
        setPopOther(pp[0].otherArr);
        setAnnouncements(pp[1]);
        setLoading(false);
      } catch (error) {
        setPopCity([]);
        setPopReg([]);
        setPopCountries([]);
        setPopOther([]);
        setLoading(false);
      }
    };

    // todo: get post list and send to postList
    !popularCities && getPopularCities();
  }, [popularCities]);

  useEffect(() => {
    const authListener = auth.onIdTokenChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setCC(true);
    });

    return () => {
      authListener && authListener();
    };
  }, []);

  if (!checkedCred) {
    return (
      <div className="content">
        <LoadingPage message="checking credentials" contained />
      </div>
    );
  }

  return (
    <PopularItems.Provider value={{
      popularCities, popularRegions, popularCountries, popularOther, loading,
    }}
    >
      <UserData.Provider value={{ userId, checkedCred }}>
        <ProfileData.Provider value={profileObj}>
          <NotificationData.Provider value={notifications}>
            <UpdateProfile.Provider value={updateProfile}>
              <AnnouncementsData.Provider value={announcements}>
                <div className="App">
                  <PageDisplay />
                  <small>&copy;Digital Destinations is a copyright of Green Owl Compliance, LLC.</small>
                </div>
              </AnnouncementsData.Provider>
            </UpdateProfile.Provider>
          </NotificationData.Provider>
        </ProfileData.Provider>
      </UserData.Provider>
    </PopularItems.Provider>
  );
}

export default App;
