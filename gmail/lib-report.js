/*
** functions cleaning library notifications/reports
** constants not shared/defined anywhere in this project
** for the sake of privacy 
*/

// run every 4 hours
function libNotyWatcher() {
	var libThreadsFilters = `from:${CONTACTS.LIB} OR from:${CONTACTS.EMS} OR from:${CONTACTS.OFF} label:inbox`;
	var libThreads = find(libThreadsFilters, batchLength=50);

  for (var i = 0; i < libThreads.length; i++) {
    // get the subject of the first message from each thread
    var subject = libThreads[i].getFirstMessageSubject();

    // mark read + unimportant, label either 'keep'(non-empty) 
    // or 'discard' (empty), and archive
 		subjectChecker(libThreads[i], subject, TO_CAST_SUB, LIB_NOTY.CAST);
 		subjectChecker(libThreads[i], subject, TO_KEEP_SUB, LIB_NOTY.KEEP);
  }
}

/* libAllSort.gs */
// take care of messages to lib-all mailing list
// run every 8 hours
function libAllSort() {
	// lib-all invitations --> discard all except workshops
	// another way to detect invitations: subject:+invitation: has:attachment 
	var inviteNoWoFilters = `to:${CONTACTS.ALL} label:inbox (invite.ics OR invite.vcs) has:attachment -subject:workshop`;
	var inviteNoWoThreads = find(inviteNoWoFilters);
	preClean(LIB_NOTY.CAST, inviteNoWoThreads);

	// to:lib-all from:heads 
	// loop over heads in inbox, find their threads and process
  for (const name of Object.keys(HEADS)) {
    var headFilters = `from:${HEADS[name]} label:inbox`;
    var headThreads = find(headFilters);
  // star + mark important + archive, regardless of read/unread
    collectFromHeads(NYU.HEADS, headThreads);
  }
  // select workshops as many as possible
  // since some are just mentioned rather than a subject
  // may improve the algorithm later
  var libWoFilters = `(label:${NYU.HEADS} OR to:${CONTACTS.ALL}) label:inbox subject:workshop`;
  var libWoThreads = find(libWoFilters);
  label(NYU.WORK).addToThreads(libWoThreads);
  // mark unimportant those not from HEADS
  GmailApp.markThreadsUnimportant(find(`to:${CONTACTS.ALL}) subject:workshop`));

  // handle the rest in the inbox
  var libRestFilters = `to:${CONTACTS.ALL} OR to:${CONTACTS.COM} label:inbox`;
  var libRestThreads = find(libRestFilters);
  preClean(NYU.NYC, libRestThreads);
}