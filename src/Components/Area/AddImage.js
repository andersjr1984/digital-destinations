import React, {
  useEffect, useState, useContext, useRef,
} from 'react';
import Button from 'react-bootstrap/Button';
import { randomString } from '../../utils/charList';
import { UserData, ProfileData } from '../../App';
import ImageSelector from '../../utils/ImageSelector';

const AddImage = (props) => {
  const [filename, setFilename] = useState(null);

  const userData = useContext(UserData);
  const { userId } = userData;
  const userImages = useRef([]);

  const profileObj = useContext(ProfileData);
  const photographer = profileObj ? profileObj.profile.userName : null;

  const {
    areaId, name, width, height,
  } = props;

  const locationRef = `${userId}/${filename}`;
  const metadata = {
    areaId,
    name,
    userId,
    photographer,
  };

  const newImage = (tempIndImgData) => {
    const indImgData = tempIndImgData;
    indImgData.filename = filename;
    if (!props.images) return props.addImage(indImgData);

    // overview will not send images or setDIF as a prop, it will only have one image;
    props.addImage(props.images.concat(indImgData));
    props.setDIF(false);
  };

  useEffect(() => {
    const getFilename = () => {
      const testUnique = (tempFilename) => {
        if (!userImages.current) return true;
        for (let i = 0; i < userImages.current.length; i += 1) {
          const image = userImages.current[i];
          if (image.filename === tempFilename) return false;
        }
        return true;
      };

      const tempFilename = randomString(8);

      if (testUnique(tempFilename)) {
        const tempIL = userImages.current;
        tempIL.push(tempFilename);
        userImages.current = tempIL;
        return tempFilename;
      } return getFilename();
    };

    (!filename && userImages.current) && setFilename(getFilename());
    // do not want to add userImages dependency, don't want this to run each time it changes
    // eslint-disable-next-line
  }, [userImages, filename]);

  useEffect(() => {
    userImages.current = userData.userImages ? userData.userImages : [];
  }, [userData]);

  return (filename
    ? (
      <div className="image-selection">
        <ImageSelector
          locationRef={locationRef}
          newImage={newImage}
          filename={filename}
          metadata={metadata}
          width={width}
          height={height}
        />
        <Button size="sm" variant="outline-danger" onClick={() => props.setDIF(false)}>Cancel</Button>
      </div>
    ) : null);
};

export default AddImage;
