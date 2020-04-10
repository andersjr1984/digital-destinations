import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Accordion, Card, Carousel } from 'react-bootstrap';
import { UserData } from '../../App';

import './Area.css';
import { LoadingPage } from '../../utils/LoadingPage';
import AddPost from './AddPost';
import firebase from '../../utils/firebase';
import SubButton from '../Profile/SubButton';
import convertCreated from '../../utils/convertCreated';

export const Area = (props) => {
  const [areaInfo, setAI] = useState(null);
  const [areaImages, setAreaImages] = useState(null);
  const [posts, setAreaPosts] = useState(null);
  const [noArea, setNA] = useState(false);
  const { match } = props;

  // eslint-disable-next-line prefer-destructuring
  const areaId = match.params.areaId;

  const user = useContext(UserData);
  const { userId } = user;

  const allowSub = !!userId;

  useEffect(() => {
    const getAreaData = async () => {
      const getAreaDataFun = firebase.functions().httpsCallable('getData');
      const areaGetObj = {
        searchKey: 'areaId',
        searchValue: areaId,
        needProfile: false,
      };
      const area = await getAreaDataFun(areaGetObj);

      if (area.data[2] === null) return setNA(true);

      const newPosts = area.data[1].map((post) => {
        const tempPost = post;
        tempPost.created = convertCreated(post.created);
        return tempPost;
      });

      setAreaImages(area.data[0]);
      setAreaPosts(newPosts);
      setAI(area.data[2]);
    };

    if (!posts && !areaImages) {
      try {
        getAreaData();
      } catch (error) {
        setNA(true);
      }
    }
    // eslint-disable-next-line
  }, [areaId]);

  if (noArea) return <PageDoesNotExist />;

  if (!areaInfo) return <LoadingPage message="Loading Area" contained />;

  return (
    <div className="area-page">
      <Helmet id={`Area - ${areaId}`}>
        <title>Welcome to {areaInfo.name}</title>
        <meta name="description" content={`Read about the awesome things ${areaInfo.name} has to offer!`} />
        <meta property="og:title" content={`${areaInfo.name}'s Page - Digital Destinations`} />
      </Helmet>
      <h1>{`${areaInfo.name}'s Page`}</h1>
      <SubButton
        allowSub={allowSub}
        subId={areaId}
        type="areaSubscriptions"
        userId={userId}
      />
      <div className="area-data">
        <h5>{`Score: ${areaInfo.score.toFixed(2)}`}</h5>
        <h5>{`Votes: ${areaInfo.votes}`}</h5>
        <h5>{`Posts: ${areaInfo.posts ? areaInfo.posts : 0}`}</h5>
      </div>
      <div className="posts">
        <Posts posts={posts} areaId={areaId} areaName={areaInfo.name} areaCoords={areaInfo.adjustedCoords} />
      </div>
      <AreaImages areaImages={areaImages} userId={userId} />
    </div>
  );
};

const Posts = (props) => {
  const [newPosts, setNP] = useState(null);
  const [popularPosts, setPP] = useState(null);
  const {
    posts, areaId, areaName, areaCoords,
  } = props;

  useEffect(() => {
    const sortAndSetPosts = () => {
      const sortedNew = [...posts];
      sortedNew.sort((a, b) => b.created.seconds - a.created.seconds);
      setNP(sortedNew);

      const sortedPopular = [...posts];
      sortedPopular.sort((a, b) => b.likedBy.length - a.likedBy.length);
      setPP(sortedPopular);
    };

    (!newPosts, !popularPosts, posts.length > 0) && sortAndSetPosts();
    // eslint-disable-next-line
  }, [posts]);

  return (
    <Accordion>
      <Card bg="secondary" text="white">
        <Card.Header>
          <Accordion.Toggle as="span" className="text-toggle" eventKey="0">
            View New Posts
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            {newPosts
              ? <ListPosts posts={newPosts} />
              : 'No New Posts.'
            }
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card bg="secondary" text="white">
        <Card.Header>
          <Accordion.Toggle as="span" className="text-toggle" eventKey="1">
            View Popular Posts
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="1">
          <Card.Body>
            {popularPosts
              ? <ListPosts posts={popularPosts} />
              : 'No New Posts.'
            }
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card bg="secondary" text="white">
        <Card.Header>
          <Accordion.Toggle as="span" className="text-toggle" eventKey="2">
            Add Post
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="2">
          <Card.Body>
            <AddPost areaId={areaId} areaName={areaName} areaCoords={areaCoords} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export const ListPosts = (props) => {
  const { posts } = props;
  return (
    <ol>
      {posts
          && posts.map((post, index) => {
            const link = `/Posts/${post.id}`;
            return (
              <li key={`Post-${index}`} style={{ textAlign: 'left' }}>
                <Link to={link}>{`${post.author} at ${post.created.toDate().toLocaleString()}`}:</Link>
                <br />
                {post.shortDesc}
              </li>
            );
          })
        }
    </ol>
  );
};

export const AreaImages = (props) => {
  const { areaImages } = props;

  if (!areaImages) return <div className="images"><LoadingPage contained message="Loading Images" /></div>;

  return (
    <div className="images">
      <Carousel interval={null} indicators={false}>
        {areaImages.map((image, index) => {
          const profileLink = `/Profile/${image.userId}`;
          return (
            <Carousel.Item key={index}>
              <img
                className="d-block"
                src={image.url}
                alt="First slide"
              />
              <Carousel.Caption>
                {image.author && (
                <Link to={profileLink}><h5>{`${image.author}'s Image`}</h5></Link>)}
              </Carousel.Caption>
            </Carousel.Item>
          );
        })}
      </Carousel>
    </div>
  );
};

export const PageDoesNotExist = () => (
  <>
    <h2>404: Page does not exist</h2>
    <h4><Link to="/">Return home</Link></h4>
  </>
);
