import React, { useState } from 'react';
import { Form, Button, Figure } from 'react-bootstrap';
import Rating from './Rating';
import AddImage from './AddImage';

// todo: translate text
// todo: allow update
export const ChangeInd = (props) => {
  const [displayImageForm, setDIF] = useState(false);
  const width = 800;
  const height = 800;
  const { data, areaId } = props;

  return (
    <Form.Group>
      <Form.Row>
        <Form.Label>
          {data.name} Rating and Review
        </Form.Label>
      </Form.Row>
      <Form.Row className="rating">
        <Rating rating={data.rating} ratingChange={(rating) => props.updateReviewItem(props.item, 'rating', rating)} />
      </Form.Row>
      <Form.Row>
        <Form.Control as="textarea" rows="3" value={data.text} onChange={(event) => props.updateReviewItem(props.item, 'text', event.target.value)} />
      </Form.Row>
      <Form.Row>
        <small>To use images in post, paste reference tag in post.</small>
        <small>{'If image isn\'t used in post, it will be shown below post.'}</small>
      </Form.Row>
      {data.images && data.images.length !== 0
    && (
    <Form.Row className="image-row">
      {data.images.map((image, index) => (
        <IndImageDisplay
          key={index}
          image={image}
          name={data.name}
          deleteImage={() => props.deleteImage(props.item, index)}
        />
      ))}
    </Form.Row>
    )}
      {displayImageForm
        ? (
          <AddImage
            name={data.name}
            images={data.images}
            addImage={(indImgData) => props.updateReviewItem(props.item, 'images', indImgData)}
            setDIF={setDIF}
            areaId={areaId}
            width={width}
            height={height}
          />
        ) : <Button onClick={() => setDIF(true)} size="sm" variant="primary">Add Image</Button>}
    </Form.Group>
  );
};

export const IndImageDisplay = (props) => {
  const { image, name } = props;
  if (!image) return null;
  // choose which image to display
  const imageUrl = image.url;
  return (
    <Figure className="usr-upload">
      <img src={imageUrl} alt="user upload" />
      <figcaption><small>{`<image ${name} filename=${image.filename}>`}</small></figcaption>
      <Button size="sm" onClick={() => props.deleteImage()}>Delete Image</Button>
    </Figure>
  );
};
