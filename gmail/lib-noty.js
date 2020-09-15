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