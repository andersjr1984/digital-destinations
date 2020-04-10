import React, { useState, useContext } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { ChangeInd, IndImageDisplay } from './ChangeInd';
import firebase from '../../utils/firebase';
import { ProfileData, UpdateProfile } from '../../App';
import { LoadingPage } from '../../utils/LoadingPage';
import deleteImageFun from '../../utils/deleteImageFun';
import AddImage from './AddImage';

const AddPost = (props) => {
  const [overview, setOV] = useState('');
  // todo: allow user to add cover photo
  // todo: set coverphoto as background of post
  const [coverImage, setCover] = useState(null);
  const [uploading, setUL] = useState(false);
  const [message, setMessage] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const profileObj = useContext(ProfileData);
  const author = profileObj ? profileObj.profile.userName : null;
  const pins = profileObj ? profileObj.profile.pins : null;
  const updateProfile = useContext(UpdateProfile);
  const { areaId, areaName, areaCoords } = props;

  const initRIObj = {
    attractions: {
      name: 'Attractions',
      rating: 'N/A',
      text: '',
      images: [],
    },
    food: {
      name: 'Food',
      rating: 'N/A',
      text: '',
      images: [],
    },
    trans: {
      name: 'Transportation',
      rating: 'N/A',
      text: '',
      images: [],
    },
    accomidations: {
      name: 'Accomidations',
      rating: 'N/A',
      text: '',
      images: [],
    },
  };
  const [reviewItems, setReviewItems] = useState({
    ...initRIObj,
  });

  // eslint-disable-next-line
  const [forceUpdate, setFU] = useState(0);
  if (!profileObj) {
    return (
      <Link to="/Login">
        <h3>Please login to share.</h3>
      </Link>
    );
  }

  const updateReviewItem = (item, name, value) => {
    const tempReviewItems = reviewItems;
    tempReviewItems[item][name] = value;
    setReviewItems(tempReviewItems);
    setFU(Math.random());
  };

  const deleteImage = async (item, index) => {
    const imageArr = [...reviewItems[item].images];
    const imageIndex = imageArr[index];
    const { ref } = imageIndex;
    // todo: write function to delete image
    await deleteImageFun(ref);
    imageArr.splice(index, 1);
    updateReviewItem(item, 'images', imageArr);
  };

  const deleteCoverImage = async () => {
    const { ref } = coverImage;
    await deleteImageFun(ref);
    setCover(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUL(true);
    const tempRevItems = { ...reviewItems };
    tempRevItems.overview = { text: overview, coverImage };
    const revKey = Object.keys(tempRevItems);
    revKey.forEach((indRevItem) => {
      tempRevItems[indRevItem].text = tempRevItems[indRevItem].text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    });
    const tempPins = pins ? [...pins] : [];
    const areaObj = { areaId, areaName, areaCoords };
    tempPins.push(areaObj);
    updateProfile([{ pins: 'subscriptions', input: tempPins }]);
    const submitObject = {
      post: tempRevItems,
      info:
        {
          areaId, author, areaName,
        },
      tempPins,
    };

    const submitFun = firebase.functions().httpsCallable('submitPost');
    try {
      const postId = await submitFun(submitObject);
      const postLink = `/Posts/${postId.data}`;
      setRedirect(postLink);
    } catch (error) {
      setMessage('Error submitting message.');
      setUL(false);
    }
  };

  if (redirect) return <Redirect to={redirect} />;

  if (uploading) return <LoadingPage contained message="Uploading Post" />;

  // todo: create useEffect that looks for post if it is an update
  const reviewKeys = Object.keys(reviewItems);
  return (
    <Form onSubmit={handleSubmit}>
      {message && <Form.Row>{message}</Form.Row>}
      <Form.Group>
        <Form.Row>
          <Form.Label>
          Overview
          </Form.Label>
        </Form.Row>
        <Form.Control
          as="textarea"
          rows="3"
          required
          value={overview}
          onChange={(event) => setOV(event.target.value)}
        />
      </Form.Group>
      <Form.Group>
        {coverImage
          ? (
            <Form.Row className="image-row">
              <IndImageDisplay
                image={coverImage}
                name="Overview"
                deleteImage={() => deleteCoverImage()}
              />
            </Form.Row>
          )
          : (
            <AddCoverPhoto
              addImage={(indImgData) => setCover(indImgData)}
              areaId={areaId}
            />
          )
      }
      </Form.Group>
      {reviewKeys.map((item) => (
        <ChangeInd
          item={item}
          data={reviewItems[item]}
          key={item}
          updateReviewItem={updateReviewItem}
          areaId={areaId}
          deleteImage={deleteImage}
        />
      ))}
      <Form.Row className="submit-row">
        <Button type="submit" variant="success" size="sm">
        Submit
        </Button>
      </Form.Row>
    </Form>
  );
};

const AddCoverPhoto = (props) => {
  const width = 1800;
  const height = 1200;
  const [displayImageForm, setDIF] = useState(false);
  const { addImage, areaId } = props;

  if (!displayImageForm) return <Button onClick={() => setDIF(true)} size="sm">Add Cover Image</Button>;

  return (
    <AddImage
      name="Cover"
      addImage={addImage}
      setDIF={setDIF}
      areaId={areaId}
      width={width}
      height={height}
    />
  );
};

export default AddPost;
