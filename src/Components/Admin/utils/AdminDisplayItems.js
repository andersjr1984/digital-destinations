/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { Accordion, Card, Button } from 'react-bootstrap';
import { LoadingPage } from '../../../utils/LoadingPage';
import CreateRender from '../../Announcements/CreateRender';
import AddOrUpdate from './AddOrUpdate';

const AdminDisplayItems = (props) => {
  const [displayItemList, setDIL] = useState(null);
  const [addOrUpdate, setAOU] = useState(false);
  const [updateIndex, setUI] = useState(null);
  const { fbRef, title } = props;
  const updateComplete = () => {
    setAOU(false);
    setUI(null);
  };
  useEffect(() => {
    const updateDisplayItems = (doc) => {
      const diInput = doc.data();
      return diInput ? setDIL(diInput) : setDIL({});
    };
    const unsubscribe = fbRef.onSnapshot(updateDisplayItems);
    return () => {
      unsubscribe();
    };
  }, []);
  if (!displayItemList) { return <LoadingPage contained message={`Loading ${title}s`} />; }
  const diIndicies = Object.keys(displayItemList);
  const numOfDI = diIndicies.length;
  if (addOrUpdate) {
    const nextDINum = numOfDI + 1;
    const nextDI = new Array(3 - nextDINum.toString().length).join(0) + nextDINum.toString();
    const nextDIIndex = `${title.substring(0, 2)}-${nextDI}`;
    return <AddOrUpdate title={title} updateComplete={updateComplete} updateIndex={nextDIIndex} />;
  }
  if (updateIndex !== null) {
    return <AddOrUpdate title={title} updateComplete={updateComplete} displayItem={displayItemList[updateIndex]} updateIndex={updateIndex} />;
  }
  return (
    <>
      <h1>
        {`${title}s!`}
      </h1>
      <Button onClick={() => setAOU(true)} size="sm">Add New</Button>
      {numOfDI > 0 && (
      <Accordion>
        <Card>
          {diIndicies.map((diIndex) => <IndividualDisplayItem displayItem={displayItemList[diIndex]} indexInput={diIndex} key={diIndex} update={() => setUI(diIndex)} />)}
        </Card>
      </Accordion>
      )}
    </>
  );
};

const IndividualDisplayItem = ({
  displayItem, indexInput, update,
}) => (
  <Card bg="info" className="item-accordion">
    <Card.Header>
      <Accordion.Toggle as={Button} variant="outline-light" className="text-toggle" eventKey={indexInput}>
        {displayItem.name}
      </Accordion.Toggle>
    </Card.Header>
    <Accordion.Collapse eventKey={indexInput}>
      <Card.Body className="display-item">
        {update && (
          <>
            <Button size="sm" onClick={() => update()}>Update</Button>
            <br />
          </>
        )}
        <CreateRender displayItem={displayItem} />
      </Card.Body>
    </Accordion.Collapse>
  </Card>
);

export default AdminDisplayItems;
