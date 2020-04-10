import React, { useContext, useState } from 'react';
import './NavBar.css';

import { Link } from 'react-router-dom';
import {
  Navbar, Nav, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMap, faAddressCard, faSignInAlt, faSignOutAlt, faUsers, faEnvelope, faEnvelopeOpenText, faStickyNote, faBars, faBullhorn,
} from '@fortawesome/free-solid-svg-icons';
import { UserData, NotificationData } from '../../App';
import { auth } from '../../utils/firebase';
import logo from './logo.png';


export const NavBar = () => {
  const { userId } = useContext(UserData);
  const userLink = `/Profile/${userId}`;
  const [mobile, setMobile] = useState(false);

  const notifications = useContext(NotificationData);
  const newNotifications = (notifications) && notifications.newNotifications ? notifications.newNotifications.length > 0 : false;

  const linkObjArr = [
    {
      key: 'home',
      link: '/',
      narr: 'Home',
      icon: faMap,
      className: 'icon',
      trigger: true,
    },
    {
      key: 'profiles',
      link: '/Profile',
      narr: 'Users',
      icon: faUsers,
      className: 'icon',
      trigger: true,
    },
    {
      key: 'posts',
      link: '/Posts',
      narr: 'Posts',
      icon: faStickyNote,
      className: 'icon',
      trigger: true,
    },
    {
      key: 'my-profile',
      link: userLink,
      narr: 'My Profile',
      icon: faAddressCard,
      className: 'icon',
      trigger: !!userId,
    },
    {
      key: 'notifications',
      link: '/Notifications',
      narr: 'Notifications',
      icon: newNotifications ? faEnvelopeOpenText : faEnvelope,
      className: `icon ${newNotifications && 'newNotifications'}`,
      trigger: !!userId,
    },
    {
      key: 'announcements',
      link: '/Announcements',
      narr: 'Announcements',
      icon: faBullhorn,
      className: 'icon',
      trigger: true,
    },
  ];

  const mobileNav = mobile ? 'ml-auto mobile-nav mobile-nav-show' : 'ml-auto mobile-nav mobile-nav-hide';

  return (
    <Navbar fixed="top" bg="dark" variant="dark">
      <Link to="/"><Navbar.Brand><img src={logo} alt="logo" /> digital destinations</Navbar.Brand></Link>
      <Nav className="ml-auto pc-nav">
        <PCNav linkObjArr={linkObjArr} />
        { userId ? <LogOutIcon /> : <LogInIcon />}
      </Nav>
      <Nav className={mobileNav}>
        <FontAwesomeIcon icon={faBars} onClick={() => setMobile(!mobile)} />
        <div className="mobile-dropdown">
          <MobileNav linkObjArr={linkObjArr} setMobile={setMobile} />
          { userId ? <MobLogOut setMobile={setMobile} /> : <MobLogIn setMobile={setMobile} />}
        </div>
      </Nav>
    </Navbar>
  );
};

const MobileNav = ({ linkObjArr, setMobile }) => linkObjArr.map((navObj) => {
  const {
    key, link, narr, icon, trigger, className,
  } = navObj;

  if (!trigger) return null;

  return (
    <Link to={link} key={key} onClick={() => setMobile(false)}>
      <FontAwesomeIcon icon={icon} className={className} /> - {narr}
    </Link>
  );
});

const MobLogIn = (props) => (
  <Link to="/LogIn" style={{ border: 'none' }} onClick={() => props.setMobile(false)}>
    <FontAwesomeIcon icon={faSignInAlt} className="icon" /> - Log In
  </Link>
);

const MobLogOut = (props) => (
  <Link to="/" style={{ border: 'none' }} onClick={() => { auth.signOut(); props.setMobile(false); }}>
    <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> - Log Out
  </Link>
);

const PCNav = ({ linkObjArr }) => linkObjArr.map((navObj) => {
  const {
    key, link, narr, icon, trigger, className,
  } = navObj;

  if (!trigger) return null;

  return (
    <Link to={link} key={key}>
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip>
            {narr}
          </Tooltip>
        )}
      >
        <FontAwesomeIcon icon={icon} className={className} />
      </OverlayTrigger>
    </Link>
  );
});

const LogInIcon = () => (
  <Link to="/LogIn">
    <OverlayTrigger
      placement="left"
      overlay={(
        <Tooltip>
          Log In
        </Tooltip>
      )}
    >
      <FontAwesomeIcon icon={faSignInAlt} />
    </OverlayTrigger>
  </Link>
);

const LogOutIcon = () => (
  <Link to="/" onClick={() => auth.signOut()}>
    <OverlayTrigger
      placement="left"
      overlay={(
        <Tooltip>
          Log Out
        </Tooltip>
      )}
    >
      <FontAwesomeIcon icon={faSignOutAlt} />
    </OverlayTrigger>
  </Link>
);

export default NavBar;
