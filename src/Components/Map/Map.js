/* eslint-disable react/jsx-curly-brace-presence */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import './Map.css';
import LocationTable from './LocationTable';
import GetLocation from './GetLocation';
import MapRender from './MapRender';

const Map = () => {
  const [mapBuilt, setMB] = useState(false);

  // we want to pass this to child components
  // want it to send new value when updated
  const [zoomLoc, setZL] = useState(null);
  const [popularPoints, setPP] = useState(null);
  const [searchPoints, setSP] = useState([]);

  return (
    <>
      <Helmet id="map">
        <title>{'Welcome to the Digital Destinations World Atlas'}</title>
        <meta name="description" content="The source for the world traveler to share and report on places they have visted, things they have done, and the overall travel experience. A digital atlas of awesome places to visit!" />
        <meta property="og:title" content="Digital Destinations" />
      </Helmet>
      {mapBuilt && (
        <div className="locations">
          <GetLocation setSP={setSP} setZL={setZL} />
          <LocationTable setPP={setPP} />
        </div>
      )}
      <div className="map">
        <MapRender popularPoints={popularPoints} searchPoints={searchPoints} zoomLoc={zoomLoc} setMB={setMB} mapBuilt={mapBuilt} />
      </div>
    </>
  );
};

export default Map;
