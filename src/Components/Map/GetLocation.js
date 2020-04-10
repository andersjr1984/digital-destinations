import React, {
  useRef, useEffect, useState, useContext,
} from 'react';
import {
  Form, Button, ButtonGroup, Table,
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import firebase from '../../utils/firebase';
import {
  PopularItems, displayInfo, UserData, ProfileData, UpdateProfile,
} from '../../App';
import { LoadingPage } from '../../utils/LoadingPage';

const GetLocation = (props) => {
  const [location, setLocation] = useState('');
  const [readOnly, setRO] = useState(false);
  const [internalLocation, setIL] = useState([]);
  const [googleLocation, setGL] = useState([]);

  const [travelling, setSail] = useState(false);
  const [redirect, setRedirect] = useState(null);
  const [message, setMessage] = useState(null);

  const currentLocations = useRef(null);
  const popular = useContext(PopularItems);
  const { userId } = useContext(UserData);
  const profileObj = useContext(ProfileData);
  const updateProfile = useContext(UpdateProfile);

  const { setSP, setZL } = props;

  const searchGoogle = async () => {
    const retrieveInfo = firebase.functions().httpsCallable('getLocationData');
    const { width } = displayInfo;
    const { height } = displayInfo;
    const data = { location, width, height };
    try {
      const doc = await retrieveInfo(data);
      const posibleAreas = doc.data;
      setGL(posibleAreas);
    } catch (error) {
      setMessage('Error retrieving data');
    }
  };

  const reset = () => {
    setLocation('');
    setRO(false);
    setIL([]);
    setGL([]);
    setMessage(null);
  };

  const checkForLocation = async (event) => {
    event.preventDefault();
    setRO(true);
    if (location === '') {
      reset();
      return null;
    }
    const tempLocationArr = [];
    currentLocations.current && currentLocations.current.forEach((locationData) => {
      if (locationData.name.toLowerCase().includes(location.toLowerCase())) {
        tempLocationArr.push(locationData);
      }
    });
    if (tempLocationArr.length === 0) {
      await searchGoogle();
    }
    setIL(tempLocationArr);
  };

  const takeMeThere = async (locInput) => {
    setSail(true);

    if (locInput.id) { return setRedirect(locInput.id); }
    const submitAreaFun = firebase.functions().httpsCallable('submitArea');
    const areaIdData = await submitAreaFun({ location: locInput });

    const areaId = areaIdData.data;
    if (!areaId) { setMessage('We experienced and issue adding that area.'); }
    if (userId) {
      const { subscriptions } = profileObj;
      subscriptions.areaSubscriptions.push(areaId);
      updateProfile([{ item: 'subscriptions', input: subscriptions }]);
    }
    setRedirect(areaId);
    setSail(false);
  };

  const tableZoom = (zoomLoc) => setZL(zoomLoc);

  useEffect(() => {
    setSP(internalLocation.concat(googleLocation));
    // have to disable es-lint on the next line because it triggeres a rerender of points on each addPoints function call
    // eslint-disable-next-line
  }, [internalLocation, googleLocation]);

  useEffect(() => {
    const updateCurrentLocations = () => {
      currentLocations.current = popular.popularCities.concat(popular.popularRegions).concat(popular.popularOther);
    };
    (popular.popularCities && popular.popularRegions && popular.popularOther && !currentLocations.current) && updateCurrentLocations();
  }, [popular.popularCities, popular.popularRegions, popular.popularOther]);

  if (message) {
    return (
      <div className="loc-search">
        <h3>{message}</h3>
        <Button variant="outline-danger" onClick={reset}>
          Reset
        </Button>
      </div>
    );
  }

  if (travelling) {
    return (
      <div className="loc-search">
        <LoadingPage contained message="Preparing to teleport" />
      </div>
    );
  }

  if (redirect) {
    const link = `/${redirect}`;
    return (
      <Redirect to={link} />
    );
  }

  if (readOnly && !internalLocation && !googleLocation) {
    return (
      <div className="loc-search">
        <LoadingPage contained message="Reviewing Areas" />
      </div>
    );
  }

  return (
    <div className="loc-search">
      <Form className="get-location" onSubmit={checkForLocation}>
        <Form.Group>
          <Form.Label>Find a Location</Form.Label>
          <Form.Control type="text" name="location" readOnly={readOnly} value={location} onChange={(event) => setLocation(event.target.value)} />
        </Form.Group>
        <ButtonGroup className="mt-3" size="sm">
          <Button disabled={!readOnly} variant="outline-danger" onClick={reset}>
          Reset
          </Button>
          <Button disabled={readOnly || location === ''} type="submit" variant="outline-primary">
          Get Location
          </Button>
        </ButtonGroup>
      </Form>
      {googleLocation && (
      <ReturnTable
        type="Google"
        locations={googleLocation}
        tableZoom={tableZoom}
        takeMeThere={takeMeThere}
      />
      )}
      {internalLocation && <ReturnTable type="Existing" locations={internalLocation} tableZoom={tableZoom} />}
      {(internalLocation && !googleLocation)
      && (
      <Button onClick={searchGoogle} disabled={googleLocation}>
        Try Advanced Search
      </Button>
      )}
    </div>
  );
};

// todo: make take me there function work, again.  asshole.
const ReturnTable = (props) => {
  const { locations, type } = props;

  if (!locations) {
    return <h4>Awaiting results.</h4>;
  }
  if (locations.length === 0) {
    return (<small>No {type} results.</small>);
  }
  return (
    <>
      <small>{type} Locations</small>
      <Table striped bordered hover variant="dark" size="sm">
        <thead>
          <tr>
            <th>
            Name
            </th>
            <th>
            Type
            </th>
          </tr>
        </thead>
        <tbody>
          {locations.length > 0
            ? locations.map((location, index) => (
              <tr key={index}>
                <td>
                  <span>{location.name}</span><br />
                  <ButtonGroup vertical>
                    <Button size="sm" className="user-loc-zoom" variant="outline-primary" onClick={() => props.tableZoom(location)}>Zoom in on map!</Button>
                    <Button size="sm" className="user-loc-zoom" variant="outline-success" onClick={() => props.takeMeThere(location)}>Take me there!</Button>
                  </ButtonGroup>
                </td>
                <td>
                  {location.type === 'city' ? 'City'
                    : location.type === 'region' ? 'State'
                      : location.type === 'country' ? 'Country' : 'Other'}
                </td>
              </tr>
            ))
            : type === 'Existing'
              ? (
                <tr>
                  <td colSpan="2">No data to display, try advanced search.</td>
                </tr>
              )
              : (
                <tr>
                  <td colSpan="2">Are you sure you entered that correctly?</td>
                </tr>
              )}
        </tbody>
      </Table>
    </>
  );
};

export default GetLocation;
