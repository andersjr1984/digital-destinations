import React from 'react';
import Map from '../Map/Map';
import AnnouncementBar from './AnnouncementBar';

import './Home.css';

const Home = () => (
  <div className="announcement-holder">
    <AnnouncementBar />
    <div className="home">
      <Map />
    </div>
  </div>
);

export default Home;
