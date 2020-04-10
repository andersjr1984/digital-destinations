import React, { Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { NavBar } from '../Navigation/NavBar';
import Home from '../Home/Home';
import { Area, PageDoesNotExist } from '../Area/Area';
import Contact from '../Contact/Contact';
import { LoadingPage } from '../../utils/LoadingPage';

const Admin = React.lazy(() => import('../Admin/Admin'));
const LogIn = React.lazy(() => import('../LogIn/LogIn'));
const ProfileRouter = React.lazy(() => import('../Profile/ProfileRouter'));
const PostRouter = React.lazy(() => import('../Post/PostRouter'));
const Notification = React.lazy(() => import('../Notifications/Notification'));
const AnnouncementRouter = React.lazy(() => import('../Announcements/AnnouncmentRouter'));

const Content = () => (
  <div className="content">
    <Switch>
      <Route
        exact
        path="/LogIn"
        render={() => (
          <Suspense fallback={<LoadingPage contained message="Loading LogIn Page" />}>
            <LogIn />
          </Suspense>
        )}
      />
      <Route
        path="/Profile"
        render={() => (
          <Suspense fallback={<LoadingPage contained message="Loading Profile Page" />}>
            <ProfileRouter />
          </Suspense>
        )}
      />
      <Route
        path="/Posts"
        render={() => (
          <Suspense fallback={<LoadingPage contained message="Loading Post Page" />}>
            <PostRouter />
          </Suspense>
        )}
      />
      <Route
        path="/Notifications"
        render={() => (
          <Suspense fallback={<LoadingPage contained message="Loading Notification Page" />}>
            <Notification />
          </Suspense>
        )}
      />
      <Route
        path="/Announcements"
        render={() => (
          <Suspense fallback={<LoadingPage contained message="Loading Announcement Page" />}>
            <AnnouncementRouter />
          </Suspense>
        )}
      />
      <Route
        path="/:areaId"
        component={Area}
      />
      <Route
        component={PageDoesNotExist}
      />
    </Switch>
  </div>
);

const PageDisplay = () => (
  <Router>
    <Route component={NavBar} />
    <Switch>
      <Route
        exact
        path="/"
        component={Home}
      />
      <Route
        path="/Admin"
        render={() => (
          <div className="admin">
            <Suspense fallback={<LoadingPage contained message="Loading Page" />}>
              <Admin />
            </Suspense>
          </div>
        )}
      />
      <Route
        component={Content}
      />
    </Switch>
    <Route component={Contact} />
  </Router>
);

export default PageDisplay;
