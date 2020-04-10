import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Announcements from './Announcements';
import IndAnnouncement from './IndAnnouncement';

const AnnouncementRouter = () => (
  <Switch>
    <Route
      exact
      path="/Announcements/:annId"
      component={IndAnnouncement}
    />
    <Route
      exact
      path="/Announcements"
      component={Announcements}
    />
  </Switch>
);

export default AnnouncementRouter;
