import React, { useState } from 'react';
import {
  Form, ProgressBar, ButtonGroup, Button,
} from 'react-bootstrap';
import resize from './resize';
import rotate from './rotate';
import addPhoto from './addPhoto';
import './ImageSelector.css';

const ImageSelector = (props) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [resizing, setRS] = useState(false);
  const [previewUrl, setPU] = useState(null);
  const { filename } = props;

  const getPhoto = async () => {
    setRS(true);
    const file = document.getElementById(filename).files[0];
    resize(file, props.width, props.height, async (resizedDataUrl) => setPU(resizedDataUrl));
    setRS(false);
  };

  if (resizing) return <h5>Resizing</h5>;

  if (progress !== 0) return <ProgressBar now={progress} label={`${progress}`} />;

  if (error) return <h5>{error}</h5>;

  if (previewUrl) {
    const uploadImage = async () => {
      const uploadComplete = (url) => {
        const indImgData = {
          ref: props.locationRef,
          url,
        };
        props.newImage(indImgData);
      };

      const currUpload = await fetch(previewUrl);
      const blobToUpload = await currUpload.blob();
      const metadata = props.metadata ? props.metadata : {};
      addPhoto(blobToUpload, props.locationRef, setProgress, setError, uploadComplete, metadata);
    };

    return <PreviewImage uploadImage={uploadImage} previewUrl={previewUrl} setPU={setPU} />;
  }

  return (
    <Form.Row className="add-image">
      <Form.Group>
        <Button size="sm"><Form.Label htmlFor={filename}>Choose File</Form.Label></Button>
        <Form.Control type="file" name="photo" accept="image/png, image/jpeg" id={filename} onChange={(event) => getPhoto(event.target.files)} />
      </Form.Group>
    </Form.Row>
  );
};

const PreviewImage = (props) => {
  const { previewUrl, uploadImage, setPU } = props;

  const rotateImage = async (direction) => {
    const currUpload = await fetch(previewUrl);
    const file = await currUpload.blob();
    rotate(file, direction, (dataUrl) => setPU(dataUrl));
  };

  return (
    <div className="preview-image">
      <small>Verify Rotation of Image and Accept to Upload.</small>
      <div className="image-holder">
        <img src={previewUrl} alt="preview" className="preview" />
      </div>
      <ButtonGroup size="sm">
        <Button onClick={uploadImage}>Accept</Button>
        <Button onClick={() => rotateImage('left')}>Rotate Left</Button>
        <Button onClick={() => rotateImage('right')}>Rotate Right</Button>
        <Button onClick={() => setPU(null)} variant="warning">Cancel</Button>
      </ButtonGroup>
    </div>
  );
};

export default ImageSelector;
