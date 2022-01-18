// check labelled threads in inbox and archive them automatically
function cleanHNet()
{
  var threads = GmailApp.getInboxThreads(0, 100);
  var numOfTarget = 0;
  for (var thread of threads)
  {
    // get user-created labels, so inbox will be excluded
    var labels = thread.getLabels();
    var targetLabel = "H-Net Announcement";
    // var targetLabel = "test";
    

    // clean h-net-announcement only
    if (labels.length == 1 && labels[0].getName() == targetLabel) 
    { 
      Logger.log("Found a target email thread.");
      numOfTarget++;
      thread.markUnimportant();
      thread.moveToArchive();
    }
    else continue;
  }

  Logger.log("Archived %d email threads.", numOfTarget);
}

// check labelled threads in inbox and archive them automatically
function archiveLabeledThreads()
{
  var threads = GmailApp.getInboxThreads(0, 100);
  var numOfThread = 0;
  for (var thread of threads)
  {
    // get user-created labels, so inbox will be excluded
    var labels = thread.getLabels();
    
    // clean any user-labelled thread
    if (labels.length > 0) 
    { 
      // Logger.log("Found a user-labeled thread.");
      numOfThread++;
      thread.markUnimportant();
      thread.moveToArchive();
    }
    else continue;
  }

  Logger.log("Archived %d email threads.", numOfThread);
}
