import React from 'react';
import './CreateRender.css';
import TranslateText from '../../utils/TranslateText';

const CreateRender = ({ displayItem }) => {
  const {
    postArr, features, logoUrl, name, orderedFeatures, centeredFeatures,
  } = displayItem;

  return (
    <>
      <div className="main-display">
        {logoUrl && <img src={logoUrl} alt={`${name}'s Logo`} align="left" className="logo" />}
        <TranslateText postArr={postArr} />
      </div>
      {features.length > 0
        && orderedFeatures ? <OFeatures features={features} name={name} />
        : <UOFeatures features={features} name={name} center={centeredFeatures} />}
    </>
  );
};

const UOFeatures = ({ features, name, center }) => (
  <ul className={center ? 'features centered' : 'features'}>
    {features.map((feature, index) => <FeatureDisp feature={feature} key={`${name} - Feature ${index}`} />)}
  </ul>
);

const OFeatures = ({ features, name }) => (
  <ol className="features">
    {features.map((feature, index) => <FeatureDisp feature={feature} name={name} key={`${name} - Feature ${index}`} />)}
  </ol>
);

const FeatureDisp = ({ feature, name }) => (
  <li>
    {feature.text}
    {feature.indImageData && <FeatureImage image={feature.indImageData} name={name} />}
  </li>
);

const FeatureImage = ({ image, name }) => (
  <>
    <br />
    <img src={image.url} alt={`${name}'s logo`} />
  </>
);

export default CreateRender;
