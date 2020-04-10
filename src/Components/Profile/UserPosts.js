import React, { useEffect, useState } from 'react';

import {
  Card, Accordion, Button, ButtonGroup,
} from 'react-bootstrap';
import { ListPosts, AreaImages } from '../Area/Area';

const UserPosts = (props) => {
  const { posts, images } = props;
  return (
    <Accordion className="user-posts">
      <Card bg="secondary" text="white">
        <Card.Header>
          <Accordion.Toggle as="span" className="text-toggle" eventKey="0">
            Posts
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            {posts
              ? <PostChoice posts={posts} />
              : 'No New Posts.'}
          </Card.Body>
        </Accordion.Collapse>
        <Card.Header>
          <Accordion.Toggle as="span" className="text-toggle" eventKey="1">
            Images
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="1">
          <Card.Body>
            {images
              ? <DisplayUserImages images={images} />
              : 'No Images.'}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

const PostChoice = (props) => {
  const [showNew, setNew] = useState(true);
  const [postsToDisplay, setPTD] = useState(null);
  const { posts } = props;

  useEffect(() => {
    const changeOrder = () => {
      const newOrder = showNew;
      const postList = [...posts];
      newOrder
        ? setPTD(postList.sort((a, b) => b.created.seconds - a.created.seconds))
        : setPTD(postList.sort((a, b) => b.likedBy.length - a.likedBy.length));
    };
    posts && changeOrder();
  }, [showNew, posts]);

  return (
    <>
      <ButtonGroup size="sm">
        <Button disabled={showNew} onClick={() => setNew(!showNew)}>New</Button>
        <Button disabled={!showNew} onClick={() => setNew(!showNew)}>Popular</Button>
      </ButtonGroup>
      {postsToDisplay && <ListPosts posts={postsToDisplay} />}
    </>
  );
};

const DisplayUserImages = ({ images }) => (
  <AreaImages areaImages={images.slice(0, 4)} />
);

export default UserPosts;
