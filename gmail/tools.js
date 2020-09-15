/*
** Improved version of GmailApp's API functions 
** Source: https://gist.github.com/chrisbobbe/072add64f2254c7a22b21b77eceb874c
*/

// The Gmail Service won't make changes to more than 100 threads \
// at a time, so batchLength defaults to 100.
/* find */
function find(searchString, shouldLimit, batchLength) {
  // The Gmail Service won't make changes to more than 100 threads
  // at a time, so batchLength defaults to 100.
  shouldLimit = (typeof shouldLimit !== 'undefined') ?  shouldLimit : true;
  batchLength = (typeof batchLength !== 'undefined') ?  batchLength : 100;
  if (shouldLimit) {
    return GmailApp.search(searchString, 0, batchLength);
  } else {
    return GmailApp.search(searchString);
  }
}

/* label */
function label(name) {
  // This only works for user-defined labels,
  // not system labels like "Spam."
  return GmailApp.getUserLabelByName(name);
}
