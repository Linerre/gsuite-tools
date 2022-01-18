/**
 * Calculate the number of totla desk shifits and night shifts
 * when a specific staffer is on duty
 */

var staffShiftsCalendarID = 'ID';
var staffName = 'Mika';

// UTC time; time will be adjusted according to my timezone
// +8 GMT here
var start = new Date('2021-08-30T00:00:00Z');    // today
var end   = new Date('2021-12-17T23:00:00Z');    // last Mon
// Logger.log(start);
// Logger.log(end);


function shiftsCounter()
{
  var nightShifts = 0;
  var shiftHours = 0
  var allShifts = CalendarApp.getCalendarById(staffShiftsCalendarID).getEvents(start, end, {search: staffName});
  for (var i = 0, shiftsNum = allShifts.length; i < shiftsNum; i++) {
    var shiftStartTime = allShifts[i].getStartTime().getHours();
    var shiftEndTime  = allShifts[i].getEndTime().getHours();
    shiftHours = shiftHours + (shiftEndTime - shiftStartTime);
    if (shiftStartTime == 18 && shiftEndTime == 20) {
      nightShifts++;
    }
  }
  Logger.log('Number of shifts: ' + allShifts.length);
  Logger.log('Hours at Desk：' + shiftHours);
  Logger.log('Number of night shifts: ' + nightShifts);
}
