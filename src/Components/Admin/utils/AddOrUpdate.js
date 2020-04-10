/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import {
  Form, Button, Figure, ButtonGroup,
} from 'react-bootstrap';
import firebase from '../../../utils/firebase';
import { LoadingPage } from '../../../utils/LoadingPage';
import ImageSelector from '../../../utils/ImageSelector';
import deleteImageFun from '../../../utils/deleteImageFun';

export const emptyImage = {
  url: null,
};

const AddOrUpdate = ({
  displayItem, updateIndex, updateComplete, title,
}) => {
  const [name, setName] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [description, setDescription] = useState('');
  const [orderedFeatures, setOF] = useState(false);
  const [centeredFeatures, setCF] = useState(false);
  const [features, setFeatures] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [submitting, setSub] = useState(false);
  const emptyFeature = {
    text: '',
  };
  const updateFeature = (value, item, index) => {
    if (value === null) {
      setFeatures((tempFtrs) => {
        const ftrs = [...tempFtrs];
        delete ftrs[index][item];
        return ftrs;
      });
    } else {
      setFeatures((tempFtrs) => {
        const ftrs = [...tempFtrs];
        ftrs[index][item] = value;
        return ftrs;
      });
    }
  };
  const addAbove = (index) => {
    setFeatures((ftrs) => ftrs.slice(0, index).concat(emptyFeature).concat(ftrs.slice(index)));
  };
  const removeBelow = (index) => {
    setFeatures((ftrs) => ftrs.slice(0, index).concat(ftrs.slice(index + 1)));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSub(true);
    const submitObj = {
      name,
      projUrl,
      description: description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      features,
      logoUrl,
      updateIndex,
      orderedFeatures,
      centeredFeatures,
    };
    const submitFun = firebase.functions().httpsCallable(`submit${title}`);
    try {
      await submitFun(submitObj);
      updateComplete();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setSub(false);
    }
  };

  useEffect(() => {
    const newProps = () => {
      const {
        name: inputName,
        projUrl: inputProjUrl,
        description: inputDescr,
        features: inputFtrs,
        logoUrl: inputLU,
        orderedFeatures: inputOF,
        centeredFeatures: inputCF,
      } = displayItem;
      setName(inputName);
      setProjUrl(inputProjUrl);
      setDescription(inputDescr);
      setFeatures(inputFtrs);
      setLogoUrl(inputLU);
      setOF(inputOF);
      setCF(inputCF);
    };
    // eslint-disable-next-line no-unused-expressions
    displayItem && newProps();
  }, [displayItem]);

  if (submitting) { return <LoadingPage contained message="submitting" />; }
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>
          {`${title} Name:`}
        </Form.Label>
        <Form.Control type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>
          {`${title} URL:`}
        </Form.Label>
        <Form.Control type="text" name="projUrl" value={projUrl} onChange={(event) => setProjUrl(event.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>
          {`${title} Description:`}
        </Form.Label>
        <Form.Control as="textarea" name="description" rows="3" value={description} onChange={(event) => setDescription(event.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="checkbox"
          id="custom-checkbox-OL"
          label="Ordered List"
          checked={orderedFeatures}
          onChange={() => setOF(!orderedFeatures)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="checkbox"
          id="custom-checkbox-CL"
          label="Centered List"
          checked={centeredFeatures}
          onChange={() => setCF(!centeredFeatures)}
        />
      </Form.Group>
      {features.map((feature, index) => <UpdateFeature updateIndex={updateIndex} addAbove={addAbove} removeBelow={removeBelow} feature={feature} index={index} key={`feature - ${index}`} update={updateFeature} />)}
      <Button onClick={() => setFeatures((ftrs) => ftrs.concat(emptyFeature))} size="sm">Add Feature</Button>
      <AddLogo updateIndex={updateIndex} logoUrl={logoUrl} setLogoUrl={setLogoUrl} />
      <ButtonGroup>
        <Button type="submit" variant="success" size="sm">{`Add ${title}!`}</Button>
        <Button variant="warning" size="sm" onClick={updateComplete}>Cancel!</Button>
      </ButtonGroup>
    </Form>
  );
};
const AddFI = ({
  imageData, index, updateIndex, update,
}) => {
  const width = 800;
  const height = 800;
  const filename = `FI-${index}`;
  const locationRef = `/Admin/${updateIndex}/${filename}`;
  const newImage = (indImageData) => {
    const { url } = indImageData;
    const tempId = { ...imageData };
    tempId.url = url;
    update(tempId, 'indImageData', index);
  };
  const deleteImage = () => {
    deleteImageFun(locationRef);
    const url = null;
    const tempId = { ...imageData };
    tempId.url = url;
    update(tempId, 'indImageData', index);
  };
  const cancel = () => {
    if (imageData.url) { deleteImage(); }
    update(null, 'indImageData', index);
  };
  return (
    <div className="feature-image">
      <AddOrShowImage filename={filename} deleteImage={deleteImage} logoUrl={imageData.url} locationRef={locationRef} newImage={newImage} width={width} height={height} />
      {!imageData.url && (
      <Button size="sm" onClick={() => cancel()}>
        Cancel
      </Button>
      )}
    </div>
  );
};
const AddLogo = ({ logoUrl, setLogoUrl, updateIndex }) => {
  const width = 400;
  const height = 400;
  const filename = 'logo';
  const locationRef = `/Admin/${updateIndex}/${filename}`;
  const newImage = (indImageData) => {
    const { url } = indImageData;
    setLogoUrl(url);
  };
  const deleteImage = () => {
    deleteImageFun(locationRef);
    setLogoUrl(null);
  };
  return (
    <>
      <h5>Add Logo</h5>
      <AddOrShowImage filename={filename} deleteImage={deleteImage} logoUrl={logoUrl} locationRef={locationRef} newImage={newImage} width={width} height={height} />
    </>
  );
};
const AddOrShowImage = ({
  deleteImage, logoUrl, locationRef, newImage, width, height, filename,
}) => (
  <>
    {logoUrl
      ? <LogoDisplay deleteImage={deleteImage} logoUrl={logoUrl} />
      : (<ImageSelector filename={filename} locationRef={locationRef} newImage={newImage} metadata={{}} width={width} height={height} />)}
  </>
);
const LogoDisplay = ({ deleteImage, logoUrl }) => (
  <Figure>
    <img src={logoUrl} alt="logo" />
    <Button size="sm" onClick={() => deleteImage()}>Delete</Button>
  </Figure>
);
const UpdateFeature = ({
  feature, index, update, addAbove, removeBelow, updateIndex,
}) => (
  <>
    <ButtonGroup>
      <Button onClick={() => addAbove(index)} size="sm">Add Feature Above</Button>
      <Button onClick={() => removeBelow(index)} variant="warning" size="sm">Remove Below</Button>
    </ButtonGroup>
    <Form.Group>
      <Form.Label>{`Feature ${index + 1}`}</Form.Label>
      <Form.Control type="text" name="text" value={feature.text} onChange={(event) => update(event.target.value, event.target.name, index)} />
    </Form.Group>
    {feature.indImageData
      ? <AddFI imageData={feature.indImageData} index={index} updateIndex={updateIndex} update={update} />
      : <Button onClick={() => update(emptyImage, 'indImageData', index)} size="sm">Add Image</Button>}
  </>
);

export default AddOrUpdate;
