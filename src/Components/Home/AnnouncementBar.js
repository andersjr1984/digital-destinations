import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AnnouncementsData } from '../../App';

const AnnouncementBar = () => {
  const announcements = useContext(AnnouncementsData);
  const findAnnouncement = () => {
    const num = announcements.length;
    for (let i = 0; i < num; i += 1) {
      if (announcements[i].id === 'An-01') {
        return announcements[i];
      }
    }
  };

  return (
    <div className="announcement-bar">
      {announcements.length > 0
        ? <SingleAnnouncment announcement={findAnnouncement()} />
        : <small>Loading Announcements</small>
      }
    </div>
  );
};

const SingleAnnouncment = ({ announcement }) => (
  <Link to={`/Announcements/${announcement.id}`}>
    <small>{`${announcement.name} - Click here to read more!`}</small>
  </Link>
);

export default AnnouncementBar;
