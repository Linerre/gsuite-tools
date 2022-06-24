/**
 * Trim the undesired space occasionally appearing in some cells and causing bugs!
 * Author: Errelin <zl37@nyu.edu>
 * Last Change: 2022-06-24
 */

// run every 2 hours?
function trimSpace() {
  let targetRange = vendorCDLSheet.getRange('J:N');
  targetRange.trimWhitespace();
  Logger.log('Whitespace trimed in cells of Col J to N');
}
