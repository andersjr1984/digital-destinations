import React from 'react';
import { Accordion, Card } from 'react-bootstrap';
import TranslateText from '../../utils/TranslateText';
import { AreaImages } from '../Area/Area';

const OtherPostItems = (props) => {
  const postTitles = {
    overview: 'Overview',
    accomidations: 'Accomidations',
    attractions: 'Attractions',
    food: 'Food',
    trans: 'Transportation',
  };
  const otherPostKeys = Object.keys(postTitles);
  return (otherPostKeys.map((otherPI, index) => {
    const eventKey = `PI-${index}`;
    if (props.postArrs[otherPI].length === 0 && props.otherData[otherPI].images.length === 0 && props.otherData[otherPI].rating === 'N/A') return null;
    return (
      <Card bg="secondary" text="white" key={eventKey}>
        <Card.Header>
          <Accordion.Toggle as="span" className="text-toggle" eventKey={eventKey}>
            {postTitles[otherPI]} - Rating {props.otherData[otherPI].rating}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey={eventKey}>
          {(props.postArrs[otherPI].length === 0 && props.otherData[otherPI].images.length === 0)
            ? (
              <Card.Body>
                No images or text in post!
              </Card.Body>
            )
            : (
              <Card.Body>
                <TranslateText postArr={props.postArrs[otherPI]} />
                {(otherPI !== 'overview') && (props.otherData[otherPI].images) && (props.otherData[otherPI].images.length > 0)
                  && <AreaImages areaImages={props.otherData[otherPI].images} />}
              </Card.Body>
            )}
        </Accordion.Collapse>
      </Card>
    );
  }));
};

export default OtherPostItems;
