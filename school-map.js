var map, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: 13.70034162, lng: -89.17501688},
    //mapTypeId: 'satellite'
  });

  fetch("robo_points.csv?r=2").then(res => res.text()).then((robos) => {
    robos = robos.split("\n")
      .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
      .map((line) => {
        let lat = (line.split(',')[0] * 1) || 0,
            lng = (line.split(',')[1] * 1) || 0;
        return [lat, lng]; //new google.maps.LatLng(lat, lng);
    });
    //console.log(robos);
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: robos,
      map: map
    });

    fetch("school_points.csv").then(res => res.text()).then((schools) => {
      schools.split("\n")
        .filter(line => (line.length > 4))
        .forEach((line) => {
          let lat = (line.split(',')[1] * 1) || 0,
              lng = (line.split(',')[0] * 1) || 0,
              latlng = new google.maps.LatLng(lat, lng),
              first_graders = (line.split(',')[2] * 1) || 0,
              second_graders = (line.split(',')[3] * 1) || 0,
              label = (first_graders ?
                  (Math.round(second_graders / first_graders * 100) + '%')
                  : 'X'
              );
          // text marker plz
        });
    });
  });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
  var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ]
  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
  heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}
