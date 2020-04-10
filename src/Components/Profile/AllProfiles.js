import React, { useEffect, useState, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LoadingPage } from '../../utils/LoadingPage';
import firebase from '../../utils/firebase';
import { UserData, ProfileData } from '../../App';

import './AllProfiles.css';
import SubButton from './SubButton';

const AllProfiles = () => {
  const [proList, setProList] = useState(null);

  const userData = useContext(UserData);
  const { userId } = userData;
  const profileObj = useContext(ProfileData);

  useEffect(() => {
    const getUsers = async () => {
      const getPopularUsersFun = firebase.functions().httpsCallable('getPopularUsers');
      const usersData = await getPopularUsersFun();
      const users = usersData.data;
      setProList(users);
    };

    !proList && getUsers();
  }, [proList]);

  // todo: create a table of users
  if (!proList) {
    return <LoadingPage contained message="Loading Power Users" />;
  }

  return (
    <div className="content user-table">
      <Helmet id="All Profiles">
        <title>A list of Power Users</title>
        <meta name="description" content="Power Users of Digital Destinations" />
        <meta property="og:title" content="Power Users of Digital Destinations" />
      </Helmet>
      <h2>Our Favorite Travelers</h2>
      <Table striped bordered hover variant="dark" size="sm">
        <thead>
          <tr>
            <th>
              Rank
            </th>
            <th>
              User
            </th>
            {userId && <th>Subscribe</th>}
          </tr>
        </thead>
        <tbody>
          {proList.map((user, index) => <UserTableRow user={user} index={index} key={index} userId={userId} profileObj={profileObj} />)}
        </tbody>
      </Table>
    </div>
  );
};

const UserTableRow = (props) => {
  const { user, userId, index } = props;

  const link = `/Profile/${user.id}`;
  const allowSub = userId !== user.id;

  return (
    <tr>
      <td>{index + 1}.</td>
      <td><Link to={link}>{user.userName}</Link></td>
      <td><SubButton allowSub={allowSub} subId={user.id} type="userSubscriptions" userId={userId} /></td>
    </tr>
  );
};

export default AllProfiles;
