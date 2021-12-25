function geoFindMe() {
  function success(position) {
    let lat = round(position.coords.latitude, 4);
    let long = round(position.coords.longitude, 4);
    setLoc1(lat, long);
    submit();
  }

  function error() {
    console.log("Unable")
  }
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by your browser")
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}


function setLoc1(lat, long) {
  //geoPos
  let lScale = 1;
  console.log("Lat: " + lat);
  console.log("Long: " + long);

  minLatitude = round((lat - lScale), 4);
  maxLatitude = round((lat + lScale), 4);
  minLongitude = round((long - lScale), 4);
  maxLongitude = round((long + lScale), 4);
}

function setLoc2(lat1, long1) {
  //Manual Pos
  let lat = lat1-1;
  let long = long1-1;

  minLatitude = round((lat), 4);
  maxLatitude = round((lat + 2), 4);
  minLongitude = round((long), 4);
  maxLongitude = round((long + 2), 4);
}