const { firestoreRef } = require('../utils/admin');

exports.getAnnouncementsFun = async () => {
  const announceRef = firestoreRef.collection('displayData').doc('announcements');

  const announceData = await announceRef.get();
  const announce = announceData.data();
  return Object.keys(announce).map((id) => {
    const announcement = announce[id];
    const { description, name } = announcement;

    const shortDesc = () => {
      const hasLinebreak = description.substring(0, 50).indexOf('<br>');
      if (hasLinebreak === -1 || hasLinebreak > 45) {
        if (description.length > 45) {
          const lastSpace = description.lastIndexOf(' ', 45);
          return `${description.substring(0, lastSpace - 1)}${description.substring(lastSpace - 1, lastSpace).replace(/[^A-Za-z0-9]/g, '')}. . .`;
        }
        return description;
      }
      return description.substring(0, hasLinebreak);
    };

    return {
      id,
      shortDesc: shortDesc(),
      name,
    };
  });
};
