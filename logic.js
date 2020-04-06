const API_KEY = "sk.eyJ1IjoibWhvdXNlcjMzIiwiYSI6ImNrODZpNTkwNTA1bWMzcW80a2xldTd3cmsifQ.oyx0Bdi1Doo9rdrjPLgrjQ";
// API endpoints for earthquake and tectonic data
var earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tData = "https://raw.githubusercontent.com/fraxen/tPlates/master/GeoJSON/PB2002_boundaries.json";


// API call
d3.json(earthquakeData, function(data) {
  createFeatures(data.features);
});

// Earthquake description
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    // Creates the earthquake layer for the map with popup 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><h3>Magnitude: " + feature.properties.mag + "</h3><h3>Date: " + new Date(feature.properties.time) + "</h3>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.4,
        color: "#000",
        stroke: true,
        weight: 2.0
    })}}
    );
  
  createMap(earthquakes);
}


function createMap(earthquakes) {
    // Creates the outdoor and satellite layers
    var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });
  
    // baseMaps
    var baseMaps = {
      "Outdoor": outdoor,
      "Satellite": satellite,
    };

    // Tectonic plate layer
    var tPlates = new L.LayerGroup();

    // Overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tPlates
    };

    // Creates map and default view + layers
    var myMap = L.map("map", {
      center: [38, 0],
      zoom: 2.5,
      layers: [outdoor, earthquakes, tPlates]
    }); 

    // Add faults to tectonic layer
    d3.json(tData, function(plateData) {
      L.geoJson(plateData, {
        color: "#ff0000",
        weight: 1
      })
      .addTo(tPlates);
  });
  
    // Layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // Create a loop to generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
    return div;
  };
  legend.addTo(myMap);
}

  // Magnitude colors
  function getColor(d){
    return d > 5 ? "#ff0000":
    d  > 4 ? "#ffa500":
    d > 3 ? "#ffff00":
    d > 2 ? "#00ff00":
    d > 1 ? "#0000ff":
             "#ee82ee";
  }

  function getRadius(value){
    return value*50000
  }