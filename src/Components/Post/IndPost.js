import React, { useEffect, useState, useContext } from 'react';
import {
  Accordion, Card, Form, Button,
} from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import firebase from '../../utils/firebase';
import { LoadingPage } from '../../utils/LoadingPage';
import { UserData, ProfileData } from '../../App';
import './Post.css';
import { Replies } from './Replies';
import OtherPostItems from './OtherPostItems';
import SubButton from '../Profile/SubButton';
import convertCreated from '../../utils/convertCreated';

const IndPost = (props) => {
  const [postArrs, setPA] = useState(null);
  const [otherData, setOD] = useState(null);
  const [postInfo, setPI] = useState(null);
  const [repliesToDisp, setRTD] = useState(null);

  const [isLiked, setIL] = useState(false);
  const [likes, setLikes] = useState(0);

  const defaultKey = 'PI-0';
  const [forceNew, setFN] = useState(false);

  const { match } = props;
  const { postId } = match.params;

  const user = useContext(UserData);
  const { userId } = user;

  const likePost = () => {
    const tempLiked = !isLiked;
    setIL(tempLiked);
    setLikes(tempLiked ? likes + 1 : likes - 1);
    const likeItemFun = firebase.functions().httpsCallable('likeItem');
    const authId = postInfo.userId;
    const data = {
      postId,
      authId,
      tempLiked,
    };
    return likeItemFun(data);
  };

  useEffect(() => {
    const getPosts = async () => {
      const getPostFun = firebase.functions().httpsCallable('getIndividualPost');
      const data = {
        postId,
      };
      const postData = await getPostFun(data);
      const post = postData.data;
      setPA(post[0].postArrObj);
      setOD(post[0].hotOrNot);
      const returnedPostInfo = post[1];

      const { likedBy } = returnedPostInfo;
      userId && setIL(likedBy.includes(userId));
      setLikes(likedBy.length);
      setRTD(post[2]);
      setPI(post[1]);
    };
    !postInfo && getPosts();
    // eslint-disable-next-line
  }, [props.match.params]);

  if (!postInfo) return <LoadingPage message="Loading Post" contained />;

  const createdTS = convertCreated(postInfo.created);
  const created = createdTS.toDate().toLocaleString();

  const authorId = postInfo.userId;
  const authorLink = `/Profile/${authorId}`;

  const { areaId } = postInfo;
  const areaLink = `/${areaId}`;

  const replyEventKey = 'Replies';
  const postReplyEventKey = 'PostReply';

  const getNewReplies = async () => {
    const getRepliesFun = firebase.functions().httpsCallable('getReplies');
    const data = {
      postId,
    };
    const replyData = await getRepliesFun(data);
    const newReplies = replyData.data;
    setRTD(newReplies);
    setFN(true);
  };

  return (
    <article className="ind-post">
      <Helmet id={`Post - ${postId}`}>
        <title>{postInfo.author} writes about {postInfo.areaName}</title>
        <meta name="description" content={`${postInfo.author} writes about ${postInfo.areaName}`} />
        <meta property="og:title" content={`${postInfo.author} writes about ${postInfo.areaName} - Digital Destinations`} />
      </Helmet>
      {otherData.overview.images && <DisplayCoverImage image={otherData.overview.images} />}
      <h3>
        <Link to={authorLink}>{postInfo.author}</Link><br />
          wrote about<br />
        <Link to={areaLink}>{postInfo.areaName}</Link>
      </h3>
      <SubButton allowSub={userId} subId={postId} type="postSubscriptions" userId={userId} /><br />
      {userId && <FontAwesomeIcon icon={faThumbsUp} className={isLiked ? 'liked' : 'notLiked'} onClick={likePost} />}
      <small>{likes} likes</small><br />
      <small>Created on: {created}</small><br />
      <Accordion defaultActiveKey={defaultKey}>
        <OtherPostItems postArrs={postArrs} otherData={otherData} />
        {repliesToDisp && <Replies eventKey={replyEventKey} repliesToDisp={repliesToDisp} userId={userId} postId={postId} foceNew={forceNew} />}
        {userId && <PostReply eventKey={postReplyEventKey} postId={postId} areaName={postInfo.areaName} getNewReplies={getNewReplies} />}
      </Accordion>
    </article>
  );
};

const DisplayCoverImage = ({ image }) => {
  if (!image.url) return null;

  return (
    <div className="background">
      <div className="dark-opacity" />
      <img src={image.url} alt="background" />
    </div>
  );
};

const PostReply = (props) => {
  const {
    eventKey, postId, areaName, getNewReplies, expand,
  } = props;
  return (
    <Card bg="secondary" text="white">
      <Card.Header>
        <Accordion.Toggle as="span" className="text-toggle" eventKey={eventKey} onClick={expand}>
        Post Reply
        </Accordion.Toggle>
      </Card.Header>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          <PostReplyForm postId={postId} areaName={areaName} getNewReplies={getNewReplies} />
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

const PostReplyForm = (props) => {
  const [replyText, setRT] = useState('');
  const [message, setMessage] = useState(null);
  const [uploading, setUL] = useState(false);

  const profile = useContext(ProfileData);
  const author = profile ? profile.userName : null;
  const handleSubmit = async (event) => {
    event.preventDefault();
    setUL(true);
    const submitReplyFun = firebase.functions().httpsCallable('submitReply');
    const data = {
      postId: props.postId,
      replyText: replyText.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      author,
    };
    try {
      await submitReplyFun(data);
      setRT('');
      await props.getNewReplies();
      setUL(false);
    } catch (error) {
      setMessage('Error submitting message.');
      setUL(false);
    }
  };

  if (uploading) return <LoadingPage contained message="Uploading Reply" />;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        {message && <Form.Row>{message}</Form.Row>}
        <Form.Row>
          <Form.Label>
            Enter Response
          </Form.Label>
        </Form.Row>
        <Form.Control
          as="textarea"
          rows="3"
          value={replyText}
          onChange={(event) => setRT(event.target.value)}
          required
        />
      </Form.Group>
      <Form.Row>
        <Button type="submit" variant="success" size="sm">
          Submit
        </Button>
      </Form.Row>
    </Form>
  );
};

export default IndPost;
