/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
const { sanitizeUrl } = require('@braintree/sanitize-url');

const createPostArray = (text) => {
  const numChar = text.length;
  const tempArr = [];
  let currLoc = 0;
  while (currLoc < numChar || currLoc > 0) {
    const openBracketLoc = text.indexOf('<', currLoc);
    if (openBracketLoc < 0) {
      tempArr.push({
        type: 'text',
        content: text.substring(currLoc, numChar),
      });
      break;
    }
    if (openBracketLoc !== currLoc) {
      tempArr.push({
        type: 'text',
        content: text.substring(currLoc, openBracketLoc),
      });
    }
    const closedBracketLoc = text.indexOf('>', openBracketLoc);
    if (closedBracketLoc < currLoc) {
      tempArr.push({
        type: 'text',
        content: text.substring(openBracketLoc, closedBracketLoc + 1),
      });
      break;
    } else {
      // eslint-disable-next-line no-await-in-loop
      const bracket = bracketCheck(openBracketLoc, closedBracketLoc, text);
      currLoc = bracket.currLoc;
      tempArr.push(bracket.content);
    }
  }
  return tempArr;
};
exports.createPostArray = createPostArray;

const bracketCheck = (openBracketLoc, closedBracketLoc, text) => {
  const innerBracketText = text.substring(openBracketLoc, closedBracketLoc + 1);
  const bracketText = innerBracketText.toLowerCase();
  const content = {};
  const image = '<image';
  const lineBreak = '<br';
  const boldOpen = '<b>';
  const italicsOpen = '<i>';
  const link = '<link';
  // if not an image (or link in future), can strip all spaces
  const noSpaceText = bracketText.replace(/ /g, '');

  let currLoc;

  if (noSpaceText.includes(image)) {
    const refStart = bracketText.indexOf(' ref=') + 5;
    const refEnd = bracketText.indexOf(' ', refStart) > 0 ? bracketText.indexOf(' ', refStart) : bracketText.length - 1;
    let ref = innerBracketText.substring(refStart, refEnd);
    ref = ref.replace(/"/g, '');
    ref = ref.replace(/'/g, '');
    content.type = 'image';
    content.ref = ref;
    currLoc = closedBracketLoc + 1;
  } else if (noSpaceText.includes(lineBreak)) {
    content.type = 'br';
    currLoc = closedBracketLoc + 1;
  } else if (noSpaceText === boldOpen) {
    content.type = 'bold';
    const closedLoc = text.indexOf('</b>', closedBracketLoc + 1);
    const boldText = closedLoc !== -1 ? text.substring(closedBracketLoc + 1, closedLoc) : text.substring(closedBracketLoc + 1);
    content.postArr = createPostArray(boldText);
    currLoc = closedLoc !== -1 ? closedBracketLoc + 1 + boldText.length + 4 : closedBracketLoc + text.length;
  } else if (noSpaceText === italicsOpen) {
    content.type = 'italics';
    const closedLoc = text.indexOf('</i>', closedBracketLoc + 1);
    const italicText = closedLoc !== -1 ? text.substring(closedBracketLoc + 1, closedLoc) : text.substring(closedBracketLoc + 1);
    content.postArr = createPostArray(italicText);
    currLoc = closedLoc !== -1 ? closedBracketLoc + 1 + italicText.length + 4 : closedBracketLoc + text.length;
  } else if (noSpaceText.includes(link)) {
    content.type = 'link';
    const linkStart = noSpaceText.indexOf('to="');
    const linkEnd = noSpaceText.indexOf('"', linkStart + 5);
    const encUrl = encodeURI(noSpaceText.substring(linkStart + 4, linkEnd));
    content.link = sanitizeUrl(encUrl);
    const closedLoc = text.indexOf('</link>', closedBracketLoc + 1);
    const linkText = closedLoc !== -1 ? text.substring(closedBracketLoc + 1, closedLoc) : text.substring(closedBracketLoc + 1);
    content.postArr = createPostArray(linkText);
    currLoc = closedLoc !== -1 ? closedBracketLoc + 1 + linkText.length + 7 : closedBracketLoc + text.length;
  } else {
    content.type = 'text';
    content.content = bracketText;
    currLoc = closedBracketLoc + 1;
  }
  return ({
    content,
    currLoc,
  });
};
