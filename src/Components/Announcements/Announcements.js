import React, { useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AnnouncementsData } from '../../App';

const Announcements = () => {
  const announcements = useContext(AnnouncementsData);
  const announcmentDisp = {};
  announcements.forEach((announ) => { announcmentDisp[announ.id] = announ; });
  const announcementList = Object.keys(announcmentDisp).sort();

  return (
    <>
      <h1>Announcements</h1>
      {announcementList.map((announId, index) => <DisplayAnnoun key={`Announcement-${index}`} announcement={announcmentDisp[announId]} />)}
    </>
  );
};

const DisplayAnnoun = ({ announcement }) => (
  <Alert>
    <Link to={`/Announcements/${announcement.id}`}>{`${announcement.name} - ${announcement.shortDesc}`}</Link>
  </Alert>
);

export default Announcements;
