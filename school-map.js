var map, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: 13.70034162, lng: -89.17501688},
    streetViewControl: false
    //mapTypeId: 'satellite'
  });

  fetch("robo_points.csv?r=2").then(res => res.text()).then((robos) => {
    robos = robos.split("\n")
      .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
      .map((line) => {
        let lat = (line.split(',')[0] * 1) || 0,
            lng = (line.split(',')[1] * 1) || 0;
        return new google.maps.LatLng(lat, lng);
    });
    //console.log(robos);
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: robos,
      map: map,
      radius: 15,
      gradient: [
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
    });

    let crv = document.createElement('canvas');
        crv.width = 13;
        crv.height = 12;
        ctx = crv.getContext('2d');
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#000';
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
                  (Math.round(second_graders / first_graders * 100))
                  : 'X'
              );
          if (first_graders && second_graders) {
            ctx.clearRect(0, 0, crv.width, crv.height);
            ctx.fillText(label, 0, 12);
            console.log(crv.toDataURL())
            new google.maps.Marker({
              position: latlng,
              map: map,
              clickable: false,
              icon: {
                url: crv.toDataURL(),
                size: new google.maps.Size(24, 24)
              }
            });
            // text marker plz
          }
        });
    });
  });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}
