import React from 'react';
import { Form } from 'react-bootstrap';

const rate = ['N/A', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const Rating = (props) => (
  rate.map((rating) => (
    <Form.Check key={rating}>
      <Form.Check.Input type="radio" onChange={() => props.ratingChange(rating)} checked={props.rating === rating} />
      <Form.Check.Label onClick={() => props.ratingChange(rating)}>
        {rating}
      </Form.Check.Label>
    </Form.Check>
  )));

export default Rating;
