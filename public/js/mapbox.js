/* eslint-disable */

export const displayMap = (locations) => {
  var map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
  }).setView([51.505, -0.09], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const coords = [];
  let markers;

  locations.forEach((loc) => {
    const [lng, lat] = loc.coordinates;
    const temp = [lat, lng];

    L.marker(temp)
      .bindPopup(
        `<p style="font-size:10px;">Day ${loc.day}: ${loc.description}</p>`,
        {
          autoClose: false,
        }
      )
      .addTo(map)
      .openPopup();

    coords.push(temp);
  });

  map.flyToBounds(coords, { padding: [150, 150] });
};
