import React, { Fragment, useState, useEffect } from 'react';
import firebase from './firebase';
import { LoadingIcon } from './LoadingPage';

const TranslateItem = ({ postItem, identifier, imageList }) => {
  switch (postItem.type) {
    case 'text': {
      return (<>{postItem.content}</>);
    }
    case 'link': {
      // eslint-disable-next-line no-use-before-define
      return (<a href={postItem.link} rel="noopener noreferrer" target="_blank">{postItem.postArr.map((item, index) => <TranslateItem key={`${identifier} - ${index}`} postItem={item} identifier={`${identifier} - ${index}`} />)}</a>);
    }
    case 'bold': {
      // eslint-disable-next-line no-use-before-define
      return (<b>{postItem.postArr.map((item, index) => <TranslateItem key={`${identifier} - ${index}`} postItem={item} identifier={`${identifier} - ${index}`} />)}</b>);
    }
    case 'italics': {
      // eslint-disable-next-line no-use-before-define
      return (<i>{postItem.postArr.map((item, index) => <TranslateItem key={`${identifier} - ${index}`} postItem={item} identifier={`${identifier} - ${index}`} />)}</i>);
    }
    case 'image': {
      if (postItem.url) {
        const align = postItem.align ? postItem.align : 'left';
        return (<img src={postItem.url} alt="user provided" align={align} />);
      }
      return <ShowImage item={identifier} imageList={imageList} />;
    }
    case 'br': {
      return (<br />);
    }
    default: {
      return null;
    }
  }
};

const TranslateText = ({ postArr, imageList }) => {
  if (postArr) {
    return (postArr.map((item, index) => {
      if (item.error) {
        return (
          <Fragment key={index}>
            {item.error}
          </Fragment>
        );
      }
      return (
        <TranslateItem key={index} postItem={item} identifier={index} imageList={imageList} />
      );
    }));
  }

  return (null);
};

const ShowImage = (props) => {
  const [src, setSrc] = useState(null);
  const [message, setMessage] = useState(null);
  const { item, imageList } = props;

  useEffect(() => {
    const getImg = async () => {
      if (imageList) {
        const { ref } = item;
        imageList.forEach((image) => {
          if (ref === image.filename) {
            setSrc(image.url);
            return null;
          }
        });
      }

      try {
        const url = item.url
          ? item.url
          : await firebase.storage().ref(item.ref).getDownloadURL();
        setSrc(url);
      } catch (error) {
        setMessage(error.message);
      }
    };
    item && getImg();
  }, [item, imageList]);

  if (message) { return <p>{message}</p>; }
  if (src) { return <img src={src} alt="User Supplied" />; }

  return <LoadingIcon />;
};

export default TranslateText;
