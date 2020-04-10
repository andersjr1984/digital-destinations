const { sanitizeUrl } = require('@braintree/sanitize-url');
const { createPostArray } = require('../utils/createPostArr');

exports.submitDI = async (data, ref) => {
  const {
    name,
    projUrl,
    description,
    features,
    logoUrl,
    updateIndex,
    orderedFeatures,
    centeredFeatures,
  } = data;

  const postArr = createPostArray(description);

  const postObj = {
    name,
    projUrl: sanitizeUrl(encodeURI(projUrl)),
    description,
    postArr,
    features,
    logoUrl,
    orderedFeatures,
    centeredFeatures,
  };

  return ref.set({ [updateIndex]: postObj }, { merge: true });
};
