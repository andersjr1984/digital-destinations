import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Profile from './Profile';
import EditProPic from './SubPages/EditProPic';
import AllProfiles from './AllProfiles';

const ProfileRouter = () => (
  <Switch>
    <Route
      exact
      path="/Profile/EditProPic"
      component={EditProPic}
    />
    <Route
      exact
      path="/Profile/:userId"
      component={Profile}
    />
    <Route
      exact
      path="/Profile/"
      component={AllProfiles}
    />
  </Switch>
);

export default ProfileRouter;
