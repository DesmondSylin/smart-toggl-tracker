export function formatTime(millionseconds,turnMillonSeconds = true) {
  let million = 1000;
  if(!turnMillonSeconds) million = 1;
  const ONE_HOUR = million * 60 * 60;  // 1小時的毫秒數
  const ONE_MIN = million * 60; // 1分鐘的毫秒數
  const ONE_SEC = million;   // 1秒的毫秒數

  const leftHours = Math.floor(millionseconds / ONE_HOUR);
  if (leftHours > 0) millionseconds = millionseconds - (leftHours * ONE_HOUR);

  let leftMins = Math.floor(millionseconds / ONE_MIN);
  if (leftMins > 0) {
      millionseconds = millionseconds - (leftMins * ONE_MIN);
      if(leftMins < 10) leftMins = "0" + leftMins;
  } else leftMins = "00";

  let leftSecs = Math.floor(millionseconds / ONE_SEC);
  if (leftSecs > 0) {
      if(leftSecs < 10) leftSecs = "0" + leftSecs;
  } else leftSecs = "00";

  if(leftHours==0 && leftMins == "00" && leftSecs== "00") return "0";
  if(leftHours==0) return leftMins + ":" + leftSecs;
  return leftHours + ":" + leftMins + ":" + leftSecs;
}

export function caculateDuration(start, end) {
  const time_start = new Date(start);
  const time_end = new Date(end);
  return formatTime(time_end.valueOf() - time_start.valueOf());
}