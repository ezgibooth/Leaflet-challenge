// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

//Function that determines color based on earthquake map
function DepthColor(depth){
    if(depth > 90){
        return "#ff4000";
    }
    if(depth > 70){
        return "#ff8000";
    }
    if(depth > 50){
        return "#ffbf00";
    }
    if(depth > 30){
        return "#ffff00";
    }
    if(depth > 10){
        return "#adff2f";
    }
    else{
        return "#7cfc00";
    }
}
function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Earthquarke with a magnitude of ${feature.properties.mag}, at a depth of ${feature.geometry.coordinates[2]} km, recorded on ${new Date(feature.properties.time)}</p>`);
  }

  //Create markers based on magnitude and depth
  var marker_info = (feature, border) => L.circleMarker(border, {color:'#00000070',weight:1,fillColor:DepthColor(feature.geometry.coordinates[2]),fillOpacity:0.7,radius:feature.properties.mag**2});


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: marker_info
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

//Create legend based on depth values and matching colors
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          depthvals = [-10, 10, 30, 50, 70, 90],
          labels = ['#800026','#E31A1C','#800026','#E31A1C','#800026','#E31A1C'];
  
      // loop through depth intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depthvals.length; i++) {
        div.innerHTML += '<i style="background:' + DepthColor(depthvals[i] + 1) + '"></i> ' + depthvals[i] + (depthvals[i + 1] ? '&ndash;' + depthvals[i + 1] + '<br>' : '+');
    }
      return div;
  };
  
  legend.addTo(myMap);

}
