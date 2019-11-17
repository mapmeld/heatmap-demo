var map, heatmap;
var layers = {};

var crv = document.createElement('canvas');
    crv.width = 18;
    crv.height = 22;
var ctx = crv.getContext('2d');
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#000';
var imgLabels = {};

map = L.map(document.getElementById('map'))
  .setView([ 13.70034162, -89.17501688], 12);
map.attributionControl.setPrefix('');
L.tileLayer('//tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);

fetch("robo_points.csv").then(res => res.text()).then((robofile) => {
  robos = robofile.split("\n")
    .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
    .map((line) => {
      let lat = (line.split(',')[0] * 1) || 0,
          lng = (line.split(',')[1] * 1) || 0;
      return [lat, lng];
  });
  layers['robos'] = robos;


  //console.log(robos);
  heatmap = L.heatLayer(robos).addTo(map);

  fetch("school_pts.csv").then(res => res.text()).then((schools) => {
    let lookup = {};

    schools.split("\n")
      .filter(line => (line.length > 4))
      .forEach((line) => {
        let lat = (line.split(',')[1] * 1) || 0,
            lng = (line.split(',')[0] * 1) || 0,
            latlng = [lat, lng],
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
      perfs.split("\n")
        .filter(line => (line.length > 4))
        .forEach((line) => {
          let school = line.split(',')[0],
              original = line.split(',')[1] * 1,
              continued = line.split(',')[2] * 1,
              label = Math.round(continued / original * 100),
              point = lookup[school];
          if (point && label) {
            if (!imgLabels[label]) {
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
              imgLabels[label] = crv.toDataURL();
            }

            let myIcon = L.icon({
            	iconUrl: imgLabels[label],
            	iconSize:     [22, 18],
            	iconAnchor:   [11, 9]
            });
            L.marker(point, {icon: myIcon}).addTo(map);
          }
        });

      fetch("hurto_points.csv").then(res => res.text()).then((hurtofile) => {
        console.log('hurtos');
        layers['hurtos'] = hurtofile.split("\n")
          .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
          .map((line) => {
            let lat = (line.split(',')[0] * 1) || 0,
                lng = (line.split(',')[1] * 1) || 0;
            return [lat, lng];
          });

        fetch("homicidio_points.csv").then(res => res.text()).then((homicidiofile) => {
          console.log('homicidios');
          layers['homicidios'] = homicidiofile.split("\n")
            .filter(line => (line.length > 4) && (line !== '0,0') && (line !== 'lat,lon,value'))
            .map((line) => {
              let lat = (line.split(',')[0] * 1) || 0,
                  lng = (line.split(',')[1] * 1) || 0;
              return [lat, lng];
            });
        });
      });
    });
  });
});

function toggleHeatmap () {
  map.removeLayer(heatmap);
}

function changeCrimes (event) {
  if (event.target.checked) {
    if (event.target.value === 'all') {
      heatmap.setLatLngs(layers['hurtos'].concat(layers['robos']).concat(layers['homicidios']));
    } else {
      heatmap.setLatLngs(layers[event.target.value]);
    }
  }
}
