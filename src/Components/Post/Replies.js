import React, { useEffect, useState, useContext } from 'react';
import {
  Accordion, Card, ButtonGroup, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import TranslateText from '../../utils/TranslateText';
import { UserData } from '../../App';
import convertCreated from '../../utils/convertCreated';
import firebase from '../../utils/firebase';

export const Replies = (props) => {
  const [sortedReplies, setReplies] = useState([]);
  const [popular, setPop] = useState(true);
  const [currLoc, setCL] = useState(0);

  const {
    repliesToDisp, forceNew, eventKey, postId, userId,
  } = props;

  const updateLikeInfo = (replies) => {
    const tempReplies = replies.map((tempReply) => {
      const reply = tempReply;
      reply.likes = reply.likedBy.length;
      userId && (reply.isLiked = reply.likedBy.includes(userId));
      return reply;
    });
    setReplies(tempReplies);
  };

  const likeReply = async (replyId) => {
    if (!userId || !replyId) return null;
    const tempReplies = [...sortedReplies];
    const isReply = (element) => replyId === element.id;
    const index = tempReplies.findIndex(isReply);
    const likedBy = [...tempReplies[index].likedBy];
    const idIndex = likedBy.indexOf(userId);
    const tempLiked = idIndex !== -1;
    tempLiked ? likedBy.splice(idIndex, 1) : likedBy.push(userId);
    tempReplies[index].likedBy = likedBy;
    const likeItemFun = firebase.functions().httpsCallable('likeItem');
    const authId = tempReplies[index].userId;
    const data = {
      postId,
      authId,
      tempLiked,
      replyId,
    };
    updateLikeInfo(tempReplies);
    return likeItemFun(data);
  };

  const sortReplies = () => {
    const tempReplies = [...repliesToDisp];
    if (popular) {
      tempReplies.sort((a, b) => b.likedBy.length - a.likedBy.length);
    } else {
      // eslint-disable-next-line no-underscore-dangle
      tempReplies.sort((a, b) => b.created._seconds - a.created._seconds);
    }
    updateLikeInfo(tempReplies);
  };

  useEffect(() => {
    // only sort when there are new or different replies
    (repliesToDisp.length !== sortedReplies.length) && sortReplies();

    // eslint-disable-next-line
  }, [repliesToDisp]);

  useEffect(() => {
    sortReplies();

    // eslint-disable-next-line
  }, [popular]);

  useEffect(() => {
    forceNew && setPop(false);
  }, [forceNew]);

  const repliesToDisplay = sortedReplies.slice(currLoc, currLoc + 10);
  const isPrev = currLoc !== 0;
  const isNext = (currLoc + 10) <= sortedReplies.length;

  return (
    <Card bg="secondary" text="white">
      <Card.Header>
        <Accordion.Toggle as="span" className="text-toggle" eventKey={eventKey}>
        Replies
        </Accordion.Toggle>
      </Card.Header>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          <div className="sort-options">
            <ButtonGroup size="sm">
              <Button disabled={!isPrev} onClick={() => setCL(currLoc - 10)}>Previous</Button>
              <Button disabled={!isNext} onClick={() => setCL(currLoc + 10)}>Next</Button>
            </ButtonGroup>
            <ButtonGroup size="sm">
              <Button disabled={!popular} onClick={() => setPop(false)}>New</Button>
              <Button disabled={popular} onClick={() => setPop(true)}>Popular</Button>
            </ButtonGroup>
          </div>
          {repliesToDisplay.length > 0 ? <IterReply repliesToDisplay={repliesToDisplay} postId={postId} likeReply={likeReply} /> : 'No Replies to Display'}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

const IterReply = (props) => (props.repliesToDisplay.map((reply, index) => <IndReply reply={reply} key={index} postId={props.postId} likeReply={props.likeReply} />));

const IndReply = (props) => {
  const user = useContext(UserData);
  const { userId } = user;
  const { reply } = props;
  const {
    id: replyId, likes, isLiked, postArr, author,
  } = reply;
  const authId = reply.userId;

  const likeReply = () => {
    props.likeReply(replyId);
  };

  const link = `/Profile/${authId}`;

  const createdTS = convertCreated(reply.created);
  const created = createdTS.toDate().toLocaleString();

  return (
    <div className="ind-reply">
      <p><Link to={link}>{author}</Link> responded by saying:<br /><small>On {created} </small>
        {userId && <FontAwesomeIcon icon={faThumbsUp} className={isLiked ? 'liked' : 'notLiked'} onClick={likeReply} />}
        <small>{likes} likes</small><br />
      </p>
      <TranslateText postArr={postArr} />
    </div>
  );
};

export default Replies;
