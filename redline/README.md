Implemented incorrectly: MBTA Redline location cannot be displayed since cannot get real-time data from the .json file

Collaborated with: N/A

Hours spent: 4 hrs

Is it possible to request the real-time data from MBTA using XMLHttpRequest? Why/Why not?
No, because of Javascript's Same Origin Policy. Since we are not in the "www.mbta.com" orgin, and we can only access files that are from the same site the page is on, we cannot get the real-time data. 