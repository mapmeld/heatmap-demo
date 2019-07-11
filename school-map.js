var map, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: 13.70034162, lng: -89.17501688},
    //mapTypeId: 'satellite'
  });

  fetch("robo_points.csv").then(res => res.text()).then((robos) => {
    robos = robos.split("\n")
      .filter((line) => (line.length > 4) && (line !== '0,0'))
      .map((line) => {
        let lat = line.split(',')[0] * 1 || 0,
            lng = line.split(',')[1] * 1 || 0;
        return new google.maps.LatLng(lat, lng);
    });
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: robos,
      map: map
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
