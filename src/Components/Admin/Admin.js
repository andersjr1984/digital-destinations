import React, { useEffect, useState } from 'react';
import {
  Redirect, Switch, Route, Link,
} from 'react-router-dom';
import { ButtonToolbar, Button } from 'react-bootstrap';


import { auth } from '../../utils/firebase';
import './Admin.css';
import { LoadingPage } from '../../utils/LoadingPage';
import AddAnnouncements from './src/AddAnnouncements';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const adminPages = [
    {
      path: '/Admin/AddAnnouncement',
      name: 'Add Announcement',
      component: AddAnnouncements,
    },
  ];

  useEffect(() => {
    const adminListener = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.moderator);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      adminListener && adminListener();
    };
  }, []);

  if (loading) return <LoadingPage contained message="Checking Admin Status" />;

  if (!isAdmin) return <Redirect to="/" />;

  return (
    <>
      <Switch>
        {adminPages.map((page) => (
          <Route
            exact
            key={page.path}
            path={page.path}
            component={page.component}
          />
        ))}
      </Switch>
      <ButtonToolbar className="admin-nav">
        {adminPages.map((page) => (
          <Link to={page.path} key={`button-${page.path}`}>
            <Button>{page.name}</Button>
          </Link>
        ))}
      </ButtonToolbar>
    </>
  );
};

export default Admin;
