const d3 = require('d3');

exports.adjustTheseCoords = (width, height, coordinates) => {
  const projection = d3.geoNaturalEarth1()
    .scale(153)
    .translate([width / 2, height / 2]);
  return projection(coordinates);
};
