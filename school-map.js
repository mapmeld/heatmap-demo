var map, heatmap;
var layers = {};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: 13.70034162, lng: -89.17501688},
    streetViewControl: false,
    //mapTypeId: 'satellite'
    styles: [
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape.natural.landcover",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape.natural.terrain",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.sports_complex",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  }
]
  });

  fetch("robo_points.csv?r=4").then(res => res.text()).then((robofile) => {
    robos = robofile.split("\n")
      .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
      .map((line) => {
        let lat = (line.split(',')[0] * 1) || 0,
            lng = (line.split(',')[1] * 1) || 0;
        return new google.maps.LatLng(lat, lng);
    });
    layers['robos'] = robos;


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

    fetch("school_pts.csv").then(res => res.text()).then((schools) => {
      let lookup = {};

      schools.split("\n")
        .filter(line => (line.length > 4))
        .forEach((line) => {
          let lat = (line.split(',')[1] * 1) || 0,
              lng = (line.split(',')[0] * 1) || 0,
              latlng = new google.maps.LatLng(lat, lng),
              school_code = (line.split(',')[2] * 1) || 0;
          lookup[school_code] = latlng;
        });

      let grade = '1st_to_2nd';
      if (window.location.href.indexOf('1b') > -1) {
        grade = 'hs1_to_hs2';
      } else if (window.location.href.indexOf('2b') > -1) {
        grade = 'hs2_to_hs3';
      }
      document.getElementById('school_rate').innerText = grade.replace(/\_/g, ' ');

      fetch("school_perf_" + grade + ".csv").then(res => res.text()).then((perfs) => {
        let crv = document.createElement('canvas');
            crv.width = 18;
            crv.height = 22;
            ctx = crv.getContext('2d');
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#000';

        perfs.split("\n")
          .filter(line => (line.length > 4))
          .forEach((line) => {
            let school = line.split(',')[0],
                original = line.split(',')[1] * 1,
                continued = line.split(',')[2] * 1,
                label = Math.round(continued / original * 100),
                point = lookup[school];
            if (point && label) {
              ctx.clearRect(0, 0, crv.width, crv.height);
              // red default
              let color = 'rgb(255, 0, 0, 0.3)';
              if (label > 70) {
                // green
                color = 'rgb(0, 255, 0, 0.5)';
              } else if (label > 50) {
                // yellow
                color = 'rgb(255, 255, 0, 0.3)';
              }
              ctx.fillStyle = color;
              ctx.arc(9, 6, 9, 0, 2 * Math.PI, false);
              ctx.fill();
              ctx.fillStyle = '#000';
              let xval = Math.floor((crv.width - ctx.measureText(label).width) / 2);
              ctx.fillText(label, xval, 10);
              new google.maps.Marker({
                position: point,
                map: map,
                clickable: false,
                icon: {
                  url: crv.toDataURL(),
                  size: new google.maps.Size(18, 12)
                }
              });
            }
          });

        fetch("hurto_points.csv?v=2").then(res => res.text()).then((hurtofile) => {
          layers['hurtos'] = hurtofile.split("\n")
            .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
            .map((line) => {
              let lat = (line.split(',')[0] * 1) || 0,
                  lng = (line.split(',')[1] * 1) || 0;
              return new google.maps.LatLng(lat, lng);
            });
          //layers['hurtos'] = layers['hurtos'].sort((a, b) => Math.random() - 0.5);
          layers['hurtos'] = layers['hurtos'].slice(0, 4000);

          fetch("homicidio_points.csv?v=2").then(res => res.text()).then((homicidiofile) => {
            layers['homicidios'] = homicidiofile.split("\n")
              .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
              .map((line) => {
                let lat = (line.split(',')[0] * 1) || 0,
                    lng = (line.split(',')[1] * 1) || 0;
                return new google.maps.LatLng(lat, lng);
              });
          });
        });
      });
    });
  });
}

function toggleHeatmap () {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeCrimes (event) {
  if (event.target.checked) {
    console.log(event.target.value);
    if (event.target.value === 'all') {
      heatmap.setData(layers['hurtos'].concat(layers['robos']).concat(layers['homicidios']));
    } else {
      heatmap.setData(layers[event.target.value]);
    }
  }
}
