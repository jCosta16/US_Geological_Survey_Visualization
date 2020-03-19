// Store our API endpoint inside queryUrl
var queryUrl;
var legendcontrol;
var layerscontrol;
var legend;

var myMap = L.map("map", {
  center: [39.0119, -98.4842],
  zoom: 4,
});



function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  var queryUrl
  if(newSample =="Last Week" ){
    queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  }else if(newSample == "Last Day" ){
    queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  }else if(newSample == "Last Month, 4.5+ mag" ){
    queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";
  };
  d3.json(queryUrl).then(function(data) { 
    console.log(data)
  
    updateMap(data.features);
  
  });
};



function createLayers(features){
  
var earthQMarkers = []

  for (var i = 0; i < features.length; i++) {
    // console.log(i);

    var latLong = [features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]];
    // console.log(latLong);

    var mag = features[i].properties.mag;
    // console.log(mag);

    var place = features[i].properties.place;

    if (mag > 5){
      earthQMarkers.push(
        L.circle(latLong, mag * 50000).setStyle({fillColor :'darkred', fillOpacity: 0.5, color:"transparent"}).bindPopup("<h5>" + place +
        "</h5><hr><p>Mag " + mag + "</p>"));

    }else if (mag > 4){
      earthQMarkers.push(
        L.circle(latLong, mag * 50000).setStyle({fillColor :'red', fillOpacity: 0.5, color:"transparent"}).bindPopup("<h5>" + place +
        "</h5><hr><p>Mag " + mag + "</p>"));
    
    }else if (mag > 3){
      earthQMarkers.push(
        L.circle(latLong, mag * 50000).setStyle({fillColor :'orange', fillOpacity: 0.5, color:"transparent"}).bindPopup("<h5>" + place +
        "</h5><hr><p>Mag " + mag + "</p>"));
      
    }else if (mag > 2){
      earthQMarkers.push(
        L.circle(latLong, mag * 50000).setStyle({fillColor :'yellow', fillOpacity: 0.5, color:"transparent"}).bindPopup("<h5>" + place +
        "</h5><hr><p>Mag " + mag + "</p>"));
    
    }else if (mag > 1){
      earthQMarkers.push(
        L.circle(latLong, mag * 50000).setStyle({fillColor :'lightseagreen', fillOpacity: 0.5, color:"transparent"}).bindPopup("<h5>" + place +
        "</h5><hr><p>Mag " + mag + "</p>"));
    
    }
    else{
      earthQMarkers.push(
        L.circle(latLong, mag * 50000).setStyle({fillColor :'green', fillOpacity: 0.5, color:"transparent"}).bindPopup("<h5>" + place +
        "</h5><hr><p>Mag " + mag + "</p>"));
    }
    // console.log(place);
  
  }

  legend = L.control({position: 'bottomright'});

  function getColor(d) {
    return d > 5   ? 'darkred' :
           d > 4   ? 'red' :
           d > 3   ? 'orange' :
           d > 2   ? 'yellow' :
           d > 1   ? 'lightseagreen' :
                      'green';
  }

  legend.onAdd = function (myMap) {
  
    var div = L.DomUtil.create('div', 'info legend'),
    mag = [0,1,2,3,4,5],
    labels = ["5+","4","3","2","1","0" ];

      // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mag.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(mag[i] + 1) + '"></i> ' +
            mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legendcontrol = legend.addTo(myMap);

  addLayers(earthQMarkers);
}
function addLayers(data){
     // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  }).addTo(myMap);

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Light Map": lightmap
  };
  Earthquakes = L.layerGroup(data);
  Earthquakes.addTo(myMap);

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: Earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load


  layerscontrol = L.control.layers(baseMaps, overlayMaps).addTo(myMap)
  .addTo(myMap);
  
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
    // Use the list of sample names to populate the select options
  var data_list = ["Last Week", "Last Day", "Last Month, 4.5+ mag"]

  data_list.forEach((d) => {
    selector
      .append("option")
      .text(d)
      .property("value", d);
    });
  // Use the first sample from the list to build the initial plots
  const firstSample = data_list[0];
  
  if(firstSample =="Last Week" ){
    queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  }else if(firstSample == "Last Day" ){
    queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  }else if(firstSample == "Last Month, 4.5+ mag" ){
    queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";
  };

  d3.json(queryUrl).then(function(data) { 
    console.log(data)
  
    createLayers(data.features);
  
  });
};

// Initialize the dashboard
init();


function updateMap(sample){
  myMap.eachLayer(function (layer) {
    myMap.removeLayer(layer);
});
  myMap.removeControl(layerscontrol);
  myMap.removeControl(legendcontrol)
  createLayers(sample);

}

