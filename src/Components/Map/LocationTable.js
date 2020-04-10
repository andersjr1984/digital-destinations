import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './LocationTable.css';
import { PopularItems, UserData } from '../../App';
import { LoadingPage } from '../../utils/LoadingPage';
import SubButton from '../Profile/SubButton';

const LocationTable = ({ setPP }) => {
  const [currIndex, setCI] = useState(0);
  const [cityRegionOther, setCRO] = useState('Cities');
  const [currList, setCL] = useState([]);
  const numToView = 10;

  const popular = useContext(PopularItems);

  useEffect(() => {
    currList && setPP(currList.slice(currIndex, currIndex + numToView));
  // have to disable es-lint on the next line because it triggeres a rerender of points on each addPoints function call
  // eslint-disable-next-line
  }, [currIndex, currList]);

  useEffect(() => {
    setCI(0);
  }, [cityRegionOther]);

  useEffect(() => {
    const tempList = () => {
      switch (cityRegionOther) {
        case 'Cities': {
          return popular.popularCities;
        }
        case 'Regions': {
          return popular.popularRegions;
        }
        case 'Countries': {
          return popular.popularCountries;
        }
        case 'Other': {
          return popular.popularOther;
        }
        default: {
          return [];
        }
      }
    };

    setCL(tempList());
  }, [popular, cityRegionOther]);

  if (popular.loading) {
    return (
      <div className="location-table">
        <LoadingPage contained message="Loading Areas" />
      </div>
    );
  }

  return (
    <div className="location-table d-flex flex-column">
      <ButtonGroup className="mt-3" size="sm">
        <Button disabled={cityRegionOther === 'Cities'} onClick={() => setCRO('Cities')} variant="success" size="sm">
        Cities
        </Button>
        <Button disabled={cityRegionOther === 'Regions'} onClick={() => setCRO('Regions')} variant="success" size="sm">
        Regions
        </Button>
        <Button disabled={cityRegionOther === 'Countries'} onClick={() => setCRO('Countries')} variant="success" size="sm">
        Countries
        </Button>
        <Button disabled={cityRegionOther === 'Other'} onClick={() => setCRO('Other')} variant="success" size="sm">
        Other
        </Button>
      </ButtonGroup>
      <Table striped variant="dark" size="sm">
        <thead>
          <tr>
            <th colSpan="2">
            Popular {cityRegionOther}<br />
              <small>Choose a location below to travel!</small>
            </th>
          </tr>
        </thead>
        <tbody>
          <PopularListing currIndex={currIndex} currList={currList.slice(currIndex, currIndex + numToView)} />
        </tbody>
      </Table>
      <ButtonGroup className="mt-3" size="sm">
        <Button disabled={currIndex === 0} onClick={() => setCI(currIndex - numToView)} size="sm">
        Previous
        </Button>
        <Button disabled={currIndex + numToView >= currList.length} onClick={() => setCI(currIndex + numToView)} size="sm">
        Next
        </Button>
      </ButtonGroup>
    </div>
  );
};

const PopularListing = (props) => {
  const user = useContext(UserData);
  const { userId } = user;

  const allowSub = !!userId;

  if (props.currList.length === 0) {
    return (
      <tr>
        <td>
          {'"No areas to display"'}
        </td>
      </tr>
    );
  }

  return props.currList.map((area, index) => (
    <tr key={index + 1}>
      <td className="area-name-column">
        <Link to={`/${area.id}`}>
          {`${props.currIndex + index + 1}. ${area.name}`}
        </Link>
      </td>
      <td className="sub-button-column">
        <SubButton
          allowSub={allowSub}
          subId={area.id}
          type="areaSubscriptions"
          userId={userId}
        />
      </td>
    </tr>
  ));
};

export default LocationTable;
