import React, { useEffect, useState } from 'react';
import { Alert, ButtonGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { LoadingPage } from '../../utils/LoadingPage';

import './AllPosts.css';

import firebase from '../../utils/firebase';
import convertCreated from '../../utils/convertCreated';

const DisplayPosts = (props) => props.postsToDisplay.map((post) => {
  const {
    userName, userId, areaName, areaId, shortDesc, created, likedBy, postId,
  } = post;
  const createdConv = convertCreated(created);
  const likes = likedBy.length;
  const userLink = `/Profile/${userId}`;
  const areaLink = `/Area/${areaId}`;
  const postLink = `/Posts/${postId}`;

  return (
    <Alert key={postId} variant="success">
      <Link to={userLink}>{userName}</Link>
      {' posted about '}
      <Link to={areaLink}>{areaName}</Link>
      {` on ${createdConv.toDate().toLocaleString()}. `}
      {likes} Likes<br />
      <Link to={postLink}>{shortDesc}</Link>
    </Alert>
  );
});

const AllPosts = () => {
  const [postsToDisplay, setPTD] = useState(null);
  const [currLoc, setCL] = useState(0);
  const increment = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      const getPostsFun = firebase.functions().httpsCallable('getPopPosts');
      const postData = await getPostsFun();
      const posts = postData.data;
      posts.sort((a, b) => b.score - a.score);
      setPTD(posts);
      setLoading(false);
    };

    !postsToDisplay && getPosts();
    // eslint-disable-next-line
  }, []);

  if (loading) return <LoadingPage contained message="Loading new posts." />;

  if (postsToDisplay.length === 0) return <h1>No posts to display!</h1>;

  return (
    <div className="all-posts">
      <Helmet id="All-Posts">
        <title>{`Last ${postsToDisplay.length} Posts`}</title>
        <meta name="description" content={`Last ${postsToDisplay.length} Posts`} />
        <meta property="og:title" content={`Last ${postsToDisplay.length} Posts - Digital Destinations`} />
      </Helmet>
      <h1>Last {postsToDisplay.length} Posts</h1>
      {postsToDisplay && <NextPrevBtn available={postsToDisplay.length} currLoc={currLoc} updateCL={setCL} increment={increment} />}
      {postsToDisplay ? <DisplayPosts postsToDisplay={postsToDisplay.slice(currLoc, currLoc + 10)} />
        : <LoadingPage contained message="Loading Posts" />
      }
      {postsToDisplay && <NextPrevBtn available={postsToDisplay.length} currLoc={currLoc} updateCL={setCL} increment={increment} />}
    </div>
  );
};

const NextPrevBtn = (props) => {
  const {
    available, currLoc, updateCL, increment,
  } = props;

  if (increment > available) return null;

  const disableNext = (currLoc + increment) >= available;
  const disablePrev = currLoc === 0;

  return (
    <ButtonGroup size="sm">
      <Button disabled={disablePrev} onClick={() => updateCL(currLoc - increment)}>
        Previous
      </Button>
      <Button disabled={disableNext} onClick={() => updateCL(currLoc + increment)}>
        Next
      </Button>
    </ButtonGroup>
  );
};

export default AllPosts;
