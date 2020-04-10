import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { NotificationData } from '../../App';
import { LoadingPage } from '../../utils/LoadingPage';
import firebase from '../../utils/firebase';
import './Notification.css';
import convertCreated from '../../utils/convertCreated';

const Notification = () => (
  <div className="content notifications">
    <Helmet id="Notifications">
      <title>View What Is New at Digital Destinations</title>
      <meta name="description" content="Digital Destinations Notifications" />
      <meta property="og:title" content="Digital Destinations Notifications" />
    </Helmet>
    <NotificationLoader />
  </div>
);

const NotificationLoader = () => {
  const notifications = useContext(NotificationData);

  if (!notifications) return <LoadingPage contained message="Loading notifications!" />;

  return <NotificationDisplay notifications={notifications} />;
};

const NotificationDisplay = (props) => {
  const { notifications } = props;

  useEffect(() => {
    const notificationsViewed = () => {
      const notificationsViewedFun = firebase.functions().httpsCallable('notificationsViewed');
      notificationsViewedFun({ newNotifications: notifications.newNotifications });
    };

    notifications && notificationsViewed();
  }, [notifications]);

  const numNotifications = notifications.newNotifications.length + notifications.oldNotifications.length;

  if (!notifications.newNotifications || numNotifications === 0) {
    return (
      <h3>No notifications to display!</h3>
    );
  }

  return (
    <>
      <h2>Check out what is new since your last visit!</h2>
      {notifications.newNotifications && notifications.newNotifications.length === 0 && <h3>No new notifications!</h3>}
      {notifications.newNotifications && notifications.newNotifications.map((notification, index) => <Alert variant="primary" key={index}><div className="alertNum">{index + 1}</div><IndNotDisp notification={notification} /></Alert>)}
      {notifications.oldNotifications && notifications.oldNotifications.map((notification, index) => <Alert variant="dark" key={index}><div className="alertNum">{index + 1}</div><IndNotDisp notification={notification} /></Alert>)}
    </>
  );
};

const IndNotDisp = (props) => {
  const [message, setMessage] = useState(null);
  const { notification } = props;

  useEffect(() => {
    const convertMessage = () => {
      const {
        areaName, authorName, postLink, type, userLink,
      } = notification;

      const createdTS = convertCreated(notification.created);
      const created = createdTS.toDate().toLocaleString();

      const content = type === 'newPost'
        ? ' made a new post about '
        : ' responded to a post you are subscribed to about ';

      return (
        <div className="message">
          <Link to={postLink}>{authorName}{content}{areaName}.</Link><br />
          <Link to={userLink}>{`${authorName}'s profile`}</Link><br />
          Posted on {created}
        </div>
      );
    };

    notification && !message && setMessage(convertMessage());
    // eslint-disable-next-line
  }, [notification])

  if (!message) return null;
  return message;
};

export default Notification;
