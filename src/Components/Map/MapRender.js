import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import * as mapJson from '../../utils/110m.json';
import { displayInfo } from '../../App';

const MapRender = (props) => {
  const mapAnchor = useRef('map-container');
  const { width, height, projection } = displayInfo;
  const [topographyData, setTD] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [ready, setReady] = useState(false);
  // refs, we don't want a rerender when these change!
  const svg = useRef(null);
  const g = useRef(null);
  const centered = useRef(null);
  const countries = useRef(null);
  const activeCity = useRef(null);
  // create a path item
  const path = useRef(null);
  const {
    proPoints, popularPoints, searchPoints, setMB, zoomLoc,
  } = props;

  const centerCountry = (d) => {
    // create variables for centering the country
    let x;
    let y;
    let k;
    if (d && centered !== d) {
      const centroid = path.current.centroid(d);
      [x, y] = centroid;
      // calculate the zoom extent
      const boundsArr = path.current.bounds(d);
      const countryWidth = boundsArr[1][0] - boundsArr[0][0];
      const countryHeight = boundsArr[1][1] - boundsArr[0][1];
      const widthZoom = width / countryWidth;
      const heightZoom = height / countryHeight;
      k = 0.8 * Math.min(widthZoom, heightZoom);
      centered.current = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered.current = null;
      // reset active city, if there is one
      if (activeCity.current) {
        activeCity.current = null;
        g.current.select('#popularPoints')
          .selectAll('circle')
          // eslint-disable-next-line no-shadow
          .classed('active-city', activeCity.current && ((d) => d === activeCity.current));
      }
    }
    g.current.select('#country')
      .selectAll('path')
      // eslint-disable-next-line no-shadow
      .classed('active', centered.current && ((d) => d === centered.current));
    g.current.select('#cities')
      .selectAll('circle')
      .attr('r', 4 / k);
    g.current.transition()
      .duration(750)
      .attr('transform', `translate(${width / 2},${height / 2})scale(${k})translate(${-x},${-y})`)
      .style('stroke-width', `${1.5 / k}px`);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setTD(mapJson.default);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const tableZoom = (input) => {
      activeCity.current = input;
      svg.current.select('#popularPoints')
        .selectAll('circle')
        .classed('active-city', activeCity.current && ((d) => d === activeCity.current));
      const inputCoordinates = input.coordinates;
      const { features } = countries.current;
      const numCountries = features.length;
      for (let i = 0; i < numCountries; i += 1) {
        const currCountry = features[i];
        const { coordinates } = currCountry.geometry;
        const areas = coordinates.length;
        for (let j = 0; j < areas; j += 1) {
          const countryCoords = coordinates[j];
          const countryContains = d3.polygonContains(countryCoords[0], inputCoordinates);
          if (countryContains) {
            return centerCountry(currCountry);
          }
        }
      }
    };
    if (ready) {
      return zoomLoc ? tableZoom(zoomLoc) : tableZoom();
    }
  }, [zoomLoc]);

  useEffect(() => {
    const createMap = () => {
      path.current = d3.geoPath(projection);
      // this creates the data for the map
      countries.current = topojson.feature(topographyData, topographyData.objects.countries);
      // create an svg that will hold the map
      svg.current = d3.select(mapAnchor.current)
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width} ${height}`);
      g.current = svg.current.append('g');
      // we append a new "g" element that will have all the county information
      g.current.append('g')
        // the following line selects all the "path" elements inside the new "g" element
        .selectAll('path')
        // have to convert this to the "features" array
        .data(countries.current.features)
        // enter()).append() adds a new "path" element to match the length of the "features" array
        .enter()
        .append('path')
        // for each "path" that is created, we will set the "d" to the path
        .attr('d', path.current)
        // also, we will set the fill, which will give us our chloropleth
        // currently a random number on return
        .attr('fill', 'black')
        // we also want to create a new class for easy boundary editing in a style sheet
        .attr('class', 'county')
        // when clicking on a county, call centerCountry with no "d"
        // this will recenter the map over the entire US
        // viewing the "title" only works since "active" country has no fill
        .on('click', (d) => centerCountry(d));
      // .append("title").text(function (d) { return d.rate + "%"; });
      setReady(true);
    };
    (topographyData) && createMap();
    // eslint-disable-next-line
  }, [topographyData]);

  useEffect(() => {
    setMB && setMB(ready);
  }, [ready]);

  const reqRedirect = (area) => {
    if (area.id) {
      return setRedirect(`/${area.id}`);
    }
    if (area.areaId) return setRedirect(`/${area.areaId}`);
  };

  useEffect(() => {
    const addPoints = () => {
      if (g.current) {
        g.current.select('#popularPoints')
          .remove();
        g.current.select('#proPoints')
          .remove();
        g.current.select('#searchPoints')
          .remove();
      }
      g.current.append('g')
        .attr('id', 'proPoints')
        .selectAll('circle')
        .data(proPoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.areaCoords[0])
        .attr('cy', (d) => d.areaCoords[1])
        .on('click', (d) => reqRedirect(d))
        .attr('r', 8)
        .attr('fill', 'yellow')
        .attr('class', 'city-point')
        .append('title')
        .text((d) => d.areaName);
    };
    (ready && proPoints) && addPoints();
  }, [ready, proPoints]);

  useEffect(() => {
    const addPoints = () => {
      if (g.current) {
        g.current.select('#popularPoints')
          .remove();
        g.current.select('#proPoints')
          .remove();
      }
      // todo: only show top 20 popularPoints
      // todo: toggle between my popularPoints and the top 20 popularPoints
      g.current.append('g')
        .attr('id', 'popularPoints')
        .selectAll('circle')
        .data(popularPoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.adjustedCoords[0])
        .attr('cy', (d) => d.adjustedCoords[1])
        .on('click', (d) => reqRedirect(d))
        .attr('r', 4)
        .attr('fill', 'red')
        .attr('class', 'city-point')
        .append('title')
        .text((d) => d.name);
    };
    (ready && popularPoints) && addPoints();
    // have to disable es-lint on the next line because it triggeres a rerender of points on each addPoints function call
    // eslint-disable-next-line
  }, [ready, popularPoints]);

  useEffect(() => {
    const dispSearchPoints = () => {
      if (g.current) {
        g.current.select('#proPoints')
          .remove();
        g.current.select('#searchPoints')
          .remove();
      }
      searchPoints.length > 0 && g.current.append('g')
        .attr('id', 'searchPoints')
        .selectAll('circle')
        .data(searchPoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.adjustedCoords[0])
        .attr('cy', (d) => d.adjustedCoords[1])
        .attr('r', 4)
        .attr('fill', 'blue')
        .append('title')
        .text((d) => d.name);
    };
    (ready && searchPoints) && dispSearchPoints();
  }, [ready, searchPoints]);

  if (redirect) return <Redirect to={redirect} />;

  return (
    <>
      <div ref={mapAnchor} className="map-container" />
      <Button size="sm" variant="warning" onClick={() => centerCountry()}>Reset Zoom</Button>
    </>
  );
};

export default MapRender;
