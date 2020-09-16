/*
** various functions cleaning email threads of
** invitations, mentioning-me notifications, and dialogs that have been marked done
*/ 

/* invitation cleaner */
// trash and label invitations sent to me (lunch&learn; meetings; events, etc)
// rather than sent to a list which inludes me
function invitationCleaner() {
	// if read, trash
	var inviteAttch = '(invite.ics OR invite.vcs)';
  var inviteReadFilters = `to:me ${inviteAttch} label:inbox has:attachment is:read`;
	var inviteReadThreads = find(inviteReadFilters);
	label('RSVP?').removeFromThreads(inviteReadThreads);
	forceClean(inviteReadThreads);

	// if unread for over one day, trash
	var inviteUnreadLongFilters = `to:me ${inviteAttch} label:inbox has:attachment is:unread older_than:1d`;
	var inviteUnreadLongThreads = find(inviteUnreadLongFilters);
	label('RSVP?').removeFromThreads(inviteUnreadLongThreads);
	forceClean(inviteUnreadLongThreads);

	// if unread within one day (To Be Decided), label RSVP? and remain unread
	var inviteTBDFilters = `to:me ${inviteAttch} label:inbox has:attachment is:unread newer_than:1d`;
	var inviteTBDThreads = find(inviteTBDFilters);
	label('RSVP?').addToThreads(inviteTBDThreads);
}


// check labelled threads in inbox and archive them automatically
function archiver()
{
  var threads = GmailApp.getInboxThreads(0, 100);
  for (var thread of threads)
  {
    // get user-created labels, so inbox will be excluded
    labels = thread.getLabels();

    if (labels.length > 0) 
    {
      thread.markUnimportant();
      thread.moveToArchive();
    }
    else continue;
  }
}

// find and clean the "you are mentioned" notifications email from Google
function commentsCleaner()
{
  // criteria
  var filters = 'from:comments-noreply@docs.google.com label:inbox is:read';
  
  // get a list of such threads; there might also be none of them
  var threads = GmailApp.search(filters);
  
  if (threads.length > 0) //if there is any
  {
    // mark unimportant and throw to trash
    GmailApp.markThreadsUnimportant(threads)
    GmailApp.moveThreadsToTrash(threads)
  }
}