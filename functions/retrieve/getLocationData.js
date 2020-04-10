/* eslint-disable no-nested-ternary */
const rp = require('request-promise');
const { functions } = require('../index');
const { adjustTheseCoords } = require('../utils/adjustTheseCoords');

const searchGoogle = (location) => {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${location}&inputtype=textquery&fields=geometry,name,types&key=${functions.config().places.key}`;

  const options = {
    uri: url,
    json: true,
  };

  return rp(options);
};

exports.getLocationFunction = async (data) => {
  const { location } = data;
  const { width } = data;
  const { height } = data;

  const returnInfoData = await searchGoogle(location);

  const returnInfo = returnInfoData.candidates;

  return returnInfo.map((area) => {
    const areaObj = {};
    areaObj.coordinates = [area.geometry.location.lng, area.geometry.location.lat];
    areaObj.adjustedCoords = (adjustTheseCoords(width, height, areaObj.coordinates));
    areaObj.name = area.name;
    const tempType = area.types[0];

    // todo: country information?
    areaObj.type = tempType === 'administrative_area_level_1' ? 'region'
      : tempType === 'locality' ? 'city' : tempType === 'country' ? 'country' : 'other';

    return areaObj;
  });
};
