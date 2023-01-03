/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.location);

var map = L.map('map').setView([51.505, -0.09], 13);
// const map = L.map('map');

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// L.marker([34.11175, -118.113455]).addTo(map).bindPopup('Location.').openPopup();

// bounds = L.bounds();

const coords = [];
let layers;

locations.forEach((loc) => {
  //Add maker
  // const el = document.createElement('div');
  // el.className = 'marker';

  const [lng, lat] = loc.coordinates;

  const temp = [lat, lng];

  coords.push(temp);

  const layer = L.marker(temp).addTo(map);
});

map.eachLayer(function (layer) {
  layer.bindPopup('Hello').openPopup();
  console.log('newton');
});
// console.log(coords);

map.flyToBounds(coords, { padding: [100, 100] });

// L.marker(loc.coordinates)
//     .addTo(map)
//     .bindPopup(`Day ${loc.day}: ${loc.coordinates}`)
//     .openPopup();
