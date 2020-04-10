import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const ChooseZoom = (props) => {
  const { countryList, areaInViewPort } = props;
  const [countries, setCountries] = useState(countryList.current[0].name);

  const callCenter = (event) => {
    event.preventDefault();
    const tempCountry = event.target.value;
    setCountries(tempCountry);
    if (tempCountry === 'NONE') {
      return props.centerCountry();
    }
    let id;
    countryList.current.forEach((country) => {
      if (country.name === tempCountry) {
        id = country.id;
      }
    });
    props.countries.current.features.forEach((country) => {
      if (country.id === id) {
        props.centerCountry(country);
        return null;
      }
    });
  };

  useEffect(() => {
    const setCountryInView = () => {
      countryList.current.forEach((country) => {
        areaInViewPort.id === country.id && (setCountries(country.name));
      });
    };
    areaInViewPort ? setCountryInView() : setCountries(countryList.current[0].name);
    // eslint-disable-next-line
  }, [areaInViewPort]);

  return (
    <Form className="zoomer zoom-form">
      <Form.Control name="countries" as="select" value={countries} onChange={callCenter}>
        {countryList.current.map((country) => (<option key={country.id}>{country.name}</option>))}
      </Form.Control>
      <Button disabled={!areaInViewPort} size="sm" variant="outline-danger" onClick={() => props.centerCountry()}>
        Reset
      </Button>
    </Form>
  );
};

export default ChooseZoom;
