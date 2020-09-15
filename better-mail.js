// check inbox to automate some daily routines

/* ------------------- constants ----------------- */
/* --------------- frequent senders ---------- */
// frequent senders: non-reply & group
const CONTACTS = {
	// lib-related reports: holds, paging request, etc.
	LIB : "lib-dba@nyu.edu",
	ALL : "lib-all@nyu.edu",
	COM : "lib-community@nyu.edu",
	// group study room reservation report, discard
	EMS : "DoNotReply_EMS_Notification@nyu.edu",
	RES : "shanghai.reserves@nyu.edu",
	CIR : "shanghai.circulation@nyu.edu",
	ARE : "do-not-reply-nyu-classes-group@nyu.edu",
	NTF : "notify@google.com",
	SHL : "shanghai.library@nyu.edu",
	OFF : "lib-offsite@nyu.edu"
};

const NYUSH = {
	MEM: 'shanghai.staff@nyu.edu',
	STU: 'shanghai.student@nyu.edu',
	TEC: 'shanghai.faculty@nyu.edu',
	// NYU/Notice
	HRG: 'shanghai.hr@nyu.edu',
	HRH: 'shanghai.hr.help@nyu.edu',
	PUB: 'shanghai.publicsafety@nyu.edu',
	FIN: 'shanghai.finance.help@nyu.edu',
	FAC: 'shanghai.facilities@nyu.edu',
	HEL: 'shanghai.health@nyu.edu',
	// NYU/Student
	ATH: 'shanghai.athletics@nyu.edu',
	ELE: 'shanghai.student.elections@nyu.edu', 
	// NYU/Academic
	CGA: 'shanghai.cga@nyu.edu', // Center for Gloabl Asia
	AAF: 'shanghai.academicaffairs@nyu.edu',
	ARC: 'shanghai.arc@nyu.edu',
	// NYU/IT
	ITS: 'nyush.itsm@nyu.edu',
	// NYU/Dev
	DEV: 'shanghai.learning.development@nyu.edu',
	// NYU/Today
	TODY: ['shanghai.allowposting.student@nyu.edu ', 
					'all_public_services-group@nyu.edu'],
	GAZ: 'shanghai.gazette@nyu.edu'
};

// Direcotr, Dean, Provost, Librarian
const HEADS = {
	// Office of President
	'Andrew Hamilton'    : 'office.president@nyu.edu',
	// Interim Co-Head of  Bern Dibner Library
	'Ana Torres'         : 'ana.torres@nyu.edu', 
	//Director of Scholarly Communications and Information Policy
	'April Hathcock'     : 'april.hathcock@nyu.edu', 
	//Director, Library Lab & Special Projects
	'Ashley Maynor'      : 'arm12@nyu.edu', 
	// Dean, Division of Libraries
	'Austin Booth'       : 'austin.booth@nyu.edu', 
	// Director, Special Collections & Librarian for Printed Books
	'Charlotte Priddle'  : 'charlotte.priddle@nyu.edu', 
	// Senior Manager, Digital Library Infrastructure
	'Carol Kassel'       : 'cmk@nyu.edu',
	// Dean of Students
	'David Pe'           : 'davidpe@nyu.edu',
	// Assistant Dean, Human Resources
	'Enrique E.Yanez'    : 'enrique.yanez@nyu.edu', 
	// Circulation Services Manager
	'Franses A.Rodriguez': 'far4@nyu.edu', 
	// Head of Resource Management
	'Greg Ferguson'      : 'greg.ferguson@nyu.edu',
	// Vice Chancellor
	'Jeffrey S Lehman'   :'jeffrey.lehman@nyu.edu',
	// Provost, NYU Shanghai
	'Joanna Waley-Cohen' : 'joanna.waleycohen@nyu.edu', 
	// Associate Dean for Collections & Content Strategy
	'Kristina L Rose'    : 'kristina.rose@nyu.edu',
	// Associate Director for Human Resources
	'Katie OBrien'       : 'katie.obrien@nyu.edu', 
	// Director, User Experience 
	'Lisa Gayhart'       : 'lisa.gayhart@nyu.edu', 
	// Metadata Librarian she/her/hers
	'Alexandra Provo'    : 'alexandra.provo@nyu.edu',
	//Health Sciences Librarian
	'Susan Kaplan Jacobs': 'susan.jacobs@nyu.edu', 
	// HR Director'
	'Wei Guo'            : 'wg22@nyu.edu', 
	// Director, NYU Shanghai Library
	'Xiaojing Zu'        : 'xiaojing.zu@nyu.edu'
};

// Quora and other subscribed newsletters
const NEWS = {
	WEEK: 'spaces-digest-noreply@quora.com',
	DAY : 'digest-noreply@quora.com',
	FLAV: 'flavio@mail.flaviocopes.com',
	OREA: 'reply@oreilly.com', 
	CANV: 'start@engage.canva.com',
	ZOOM: 'webinars@zoom.us',
	CHAV: 'newsletter@ch-aviation.com',
	CPEN: 'support@codepen.io',
	GRAM: 'info@send.grammarly.com',
	ADOB: 'demand@mail.adobe.com',
  BLOO: 'noreply@mail.bloombergbusiness.com',
  FA  : 'news@foreignaffairs.com',
  PLUR: 'tech-skills@pluralsight.com'
};


// any empty reports or notificationRead
const TO_CAST_SUB = [
  'NO Shanghai Paging Requests to Report',
  'NO NYUSH Booking Requests to Report',
  'There were NO Shanghai Expired Holds to Report',
  'Return Receipt',
  'NYU Shanghai Group Study Room Schedule'
  'NO Shanghai Offsite Item requests to Report'
];

// any non-empty or with-attachments reports exclude nightly overdue
const TO_KEEP_SUB = [
	// attachment: true
	'NYU52 ILL Rush Orders Report',
	'Shanghai Patrons who owe more than 100 Report',
	'NYU SH Inventory Report',

	//attachment: false
	'Shanghai New Holds Report',
	'ALEPH SHANGHAI Paging Request Report',
	'CLANCY Offsite Requests'
];

/* ----------------------- Labels --------------------- */
const LIB_NOTY = {
  CAST: 'LibNoty/Discard',
  KEEP: 'LibNoty/Keep'
};

const ACTION = {
	TODO : 'Action/ToDo',
	DOING: 'Action/Doing',
	DONE : 'Action/Done',
	NOTED: 'Action/Noted'
};

// NYU Catagories
const NYU = {
	ACADE: 'NYU/Academic',
	BOBST: 'NYU/Bobst',
	DEV  : 'NYU/Dev',
	HEADS: 'NYU/Heads',
	IT   : 'NYU/IT',
	NOTY : 'NYU/Notice',
	NYC  : 'NYU/Groups',
	STUD : 'NYU/Student',
	TODY : 'NYU/Today',
	WORK : 'NYU/Workshop'
};

/* --------------------------- ATTENTION  -------------------------*/
/*
1. time-drive triggers better be created using GUI, unless in need of more conditions
2. catagorize email from within inbox and clean the useless later regularly
3. self-made array not working with arrays created by gmail class
+  use its class to add a group of similar threads at one time
4. can star ONLY msgs, though hasStarredMessages() can detect such thds
+  thus, for thds with a single msg, it is good to star them, leaving imp for ths only

*/

/* --------------------------- run hourly ----------------------- */
/* libnoty watcher */
// deal with daily lib notifications with various subjects, which can be divided
// into two groups: 1. nth to report; 2. sth to report 
// run every 4 hours
function libNotyWatcher() {
	var libThreadsFilters = `from:${CONTACTS.LIB} OR from:${CONTACTS.EMS} OR from:${CONTACTS.OFF} label:inbox`;
	var libThreads = find(libThreadsFilters, batchLength=50);

  for (var i = 0; i < libThreads.length; i++) {
    // get the subject of the first message from each thread
    var subject = libThreads[i].getFirstMessageSubject();

    // if nth to report, discard
 		subjectChecker(libThreads[i], subject, TO_CAST_SUB, LIB_NOTY.CAST);
 		// if sth to report, label keep first
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

	// to:lib-all from:heads inbox
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

  // handle the rest
  var libRestFilters = `to:${CONTACTS.ALL} OR to:${CONTACTS.COM} label:inbox`;
  var libRestThreads = find(libRestFilters);
  preClean(NYU.NYC, libRestThreads);
}

/* NYUSH Messages Sort */
function nyushSort() {
	batchClean(`from:${NYUSH.HRG} OR from:${NYUSH.HRH} label:inbox`, NYU.NOTY);
	batchClean(`from:${NYUSH.PUB} OR from:${NYUSH.FIN} label:inbox`, NYU.NOTY);
	batchClean(`from:${NYUSH.FAC} OR from:${NYUSH.HEL} label:inbox`, NYU.NOTY);
	batchClean(`from:${NYUSH.ATH} OR from:${NYUSH.ELE} label:inbox`, NYU.STUD);
	batchClean(`from:${NYUSH.CGA} OR from:${NYUSH.AAF} OR from:${NYUSH.ARC} label:inbox`, NYU.STUD);
	batchClean(`from:${NYUSH.ITS} label:inbox`, NYU.IT);
	batchClean(`from:${NYUSH.DEV} label:inbox`, NYU.DEV);
	batchClean(`from:${NYUSH.GAZ} label:inbox`, NYU.STUD);
}

/* invitation cleaner */
// run every 2 hours
// get rid of RSVP notifications which will go calendar
function invitationCleaner() {
	var inviteAttch = '(invite.ics OR invite.vcs)';
	// if read, trash
	var inviteReadFilters = `to:me ${inviteAttch} has:attachment label:inbox is:read`;
	var inviteReadThreads = find(inviteReadFilters);
	label('RSVP?').removeFromThreads(inviteReadThreads);
	forceClean(inviteReadThreads);

	// if unread for over one day, trash
	var inviteUnreadLongFilters = `to:me ${inviteAttch} has:attachment label:inbox is:unread older_than:1d`;
	var inviteUnreadLongThreads = find(inviteUnreadLongFilters);
	label('RSVP?').removeFromThreads(inviteUnreadLongThreads);
	forceClean(inviteUnreadLongThreads);

	// if unread within one day (To Be Decided), label RSVP? and remain unread
	var inviteTBDFilters = `to:me ${inviteAttch} label:inbox has:attachment is:unread newer_than:1d`;
	var inviteTBDThreads = find(inviteTBDFilters);
	label('RSVP?').addToThreads(inviteTBDThreads);
}

/* --------------------------- run daily ----------------------- */
/* notify@google and ares class reprot */
/* notify google */
// deal with ares class report and notify google
// run every 24 hours at 12:00PM-1:00PM
function notifyGoogle() {
	// if read, label discard + unimport and archive
	var readFilters = `from:${CONTACTS.NTF} label:inbox is:read`;
	var read = find(readFilters);
	if (read.length !== 0) {
		preClean('LibNoty/Discard', read);
	}

	// if unread for more than one day, 
	// label discard + unimportant and archive
	var unreadForeverFilters = `from:${CONTACTS.NTF} label:inbox is:unread older_than:1d`;
  var unreadForever = find(unreadForeverFilters);
	if (unreadForever.length !== 0) {
		preClean('LibNoty/Discard', unreadForever);
	}

  // if unread for less than one day, keep it unread until the next loop
	var unreadOneDayFilters = `from:${CONTACTS.NTF} label:inbox is:unread newer_than:1d`;
	var unreadOneDay = find(unreadOneDayFilters);
	if (unreadOneDay.length !== 0) {
		GmailApp.markThreadsUnimportant(unreadOneDay);
  	label('LibNoty/Keep').addToThreads(unreadOneDay);
	}

	// trash those older than 1d regardless of label and (un)read status
	var oldNotiFilters = `from:${CONTACTS.NTF} older_than:1d`;
	var oldNotiThreads = find(oldNotiFilters);
	forceClean(oldNotiThreads);
}

/* Ares Merged Classes */
// deal with merged classes report
// run every 24 hours at 2:00PM
function aresMergedClasses() {
	var aresFilters = `from:${CONTACTS.ARE} label:inbox`;
	var aresThreads = find(aresFilters);
    // in case some are important by default, undo this!
  GmailApp.markThreadsUnimportant(aresThreads);
    
    // star the NoSH message (a thread with a single msg) 
	for (var thread of aresThreads) {
		var msgnum = thread.getMessageCount();
    var msg = thread.getMessages();   
		if (msgnum == 1) {GmailApp.starMessages(msg);}
  }
  
	// find those starred NoSH threads and trash
	var aresNoSHFilters = `from:${CONTACTS.ARE} label:inbox is:starred`;
	var aresNoSHThreads = find(aresNoSHFilters);
	forceClean(aresNoSHThreads);
  
  // deal with SH threads, if (unread and older than 1d or more), discard
  var aresSHUnreadFilters = `from:${CONTACTS.ARE} label:inbox is:unread older_than:1d`;
  var aresSHUnreadThreads = find(aresSHUnreadFilters);
  preClean('LibNoty/Discard', aresSHUnreadThreads);
    
  // if read, trash
  var aresSHReadFilters = `from:${CONTACTS.ARE} label:inbox is:read`;
  var aresSHReadThreads = find(aresSHReadFilters);
  forceClean(aresSHReadThreads);
}



/* NYU Today summary */
// document the history, never clean
function nyuToday() {
	batchClean(`from:${NYUSH.TODY[0]} OR from:${NYUSH.TODY[1]} label:inbox`, NYU.TODY);
}

/* Clear Quora weekly digest */
// run daily
function clearNewsLetters() {
	for (const sender of Object.keys(NEWS)) {
		var filters = `from:${NEWS[sender]} label:inbox (is:read OR older_than:1d)`;
		forceClean(find(filters));
	}
}

/* --------------------------- run weekly ----------------------- */
// run every week on Fri 1-2am
// change label to discard for notification previously labelled 'keep'
function libNotyCleaner() {
	// first, discard attach-free threads
	var noAttachFilters = `label:${LIB_NOTY.KEEP} -has:attachment`;
	var noAttachthreads = find(noAttachFilters);
	labelSwap(LIB_NOTY.KEEP, LIB_NOTY.CAST, noAttachthreads);

	// then, find all the 'discard' threads
	// do the trash n=length/100 times
	// Gmail won't automatically include trash in a search
	// so it's fine to just search for emails with a label
	var cleanerFilter = `label:${LIB_NOTY.CAST} older_than:1m`;
	var totalDiscards = find(cleanerFilter, shouldLimit=false); // up to 500 thds
	var discards = find(cleanerFilter); // up to 100 thds
	var n = totalDiscards.length/100; // clean n time(s)
	if (n > 1) {
		do {
			GmailApp.moveThreadsToTrash(discards);
			discards = find(cleanerFilter); // another up-to-100 thds
			n--;
		} while (n > 0);  // n, n-1, n-2, ..., 3, 2, 1 done!	
	} else if (n < 1) {GmailApp.moveThreadsToTrash(discards);}
}


/* --------------------------- run monthly----------------------- */



/* ------------------------ customized funcs --------------------- */
// check subject and label accordingly
function subjectChecker(thread, subject, subList, labelString) {
	for (var sub of subList) {
		if (subject == sub) {
			thread.markUnimportant();
			thread.markRead();
			label(labelString).addToThread(thread);
			thread.moveToArchive();
		} else continue;
	}
}

// get things ready for cleaner
// mark read + unimportant, label discard, archive
function preClean(labelString, threads) {
	for (var thread of threads) {
		if (thread.hasStarredMessages()) {
			var messages = thread.getMessages();
			GmailApp.unstarMessages(messages);
		} else continue;
	}
	GmailApp.markThreadsUnimportant(threads);
	GmailApp.markThreadsRead(threads);
	label(labelString).addToThreads(threads);
	GmailApp.moveThreadsToArchive(threads);
}

/* force clean */
// {unimportant + read + trash} threads
function forceClean(threads) {
	GmailApp.markThreadsUnimportant(threads);
	GmailApp.markThreadsRead(threads);
	GmailApp.moveThreadsToTrash(threads);
}

/* batch clean */
// pretty much the same the other cleaners 
// except label used to find target thds
function batchClean(filterString, labelString) {
	var threads = find(filterString);
	GmailApp.markThreadsUnimportant(threads);
	label(labelString).addToThreads(threads);
	GmailApp.moveThreadsToArchive(threads);
}

function collectFromHeads(labelString, threads) {
  GmailApp.markThreadsImportant(threads);
  label(labelString).addToThreads(threads);
  // var msgs = GmailApp.getMessagesForThreads(threads);
  // for (var i=0; i<msgs.length; i++) {
  //   GmailApp.starMessages(msgs[i]);
  // }
  GmailApp.moveThreadsToArchive(threads);
}

/* find.gs */
function find(searchString, shouldLimit, batchLength) {
  // The Gmail Service won't make changes to more than 100 threads
  // at a time, so batchLength defaults to 100.
  // shouldLimit here is like a switch, when defiend, it means
  // no need to limit, which is rarely the case
  shouldLimit = (typeof shouldLimit !== 'undefined') ?  shouldLimit : true;
  batchLength = (typeof batchLength !== 'undefined') ?  batchLength : 100;
  if (shouldLimit) {
    return GmailApp.search(searchString, 0, batchLength);
  } else {
    return GmailApp.search(searchString);
  }
}

/* label.gs */

function label(name) {
  // This only works for user-defined labels,
  // not system labels like "Spam."
  return GmailApp.getUserLabelByName(name);
}

/* label swapper */
function labelSwap(oldLabel, newLabel, threads) {
	label(oldLabel).removeFromThreads(threads);
	label(newLabel).addToThreads(threads);
}


/* ===================== triggers ================ */
/* ===================== deprecated ================ */
// run every 4 hours
// function manager() {
// 	// run every 4 hours
//   var hourjob = ScriptApp.newTrigger('libNotyWatcher').timeBased();
//   hourjob.everyHours(4)
//   .create();

//   // run every two months
//   var fortnightjob = ScriptApp.newTrigger('libNotyCleaner').timeBased();
//   fortnightjob.atHour(10)
//   .onWeekDay(ScriptApp.WeekDay.SATURDAT)
//   .everyWeeks(8)
//   .create();
// };

