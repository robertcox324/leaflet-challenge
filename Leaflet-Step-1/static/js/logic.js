//http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
//const API_KEY = "pk.eyJ1IjoicmNvb3htYXBib3giLCJhIjoiY2s4amM3aHE0MDBiaDNsbXlrNjlmeGNibiJ9.KAaP1GTfFaUEwaJIYKi1gQ";

//create map using leaflet to plot all earthquakes from chosen dataset
//scale markers to magnitude and change color
//include popups for additional information when clicked
//create a legend for context on the map data (scale with what color equals what magnitude)
  
 var streetsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

//   var streetsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
//   attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
//   maxZoom: 18,
//   id: "mapbox.light",
// //   id: "mapbox.streets",
//   accessToken: API_KEY
// });

  //initialize all the layergroups to use 
  var layers = {
    zeroToOne: new L.LayerGroup(),
    oneToTwo: new L.LayerGroup(),
    twoToThree: new L.LayerGroup(),
    threeToFour: new L.LayerGroup(),
    fourToFive: new L.LayerGroup(),
    fiveAndAbove: new L.LayerGroup(),
  }
// Create a map object
var myMap = L.map("map", {
    center: [15.5994, -28.6731], //CHANGE CENTER AND ZOOM LATER IMPORTANT
    zoom: 3,
    layers: [
        layers.zeroToOne,
        layers.oneToTwo,
        layers.twoToThree,
        layers.threeToFour,
        layers.fourToFive,
        layers.fiveAndAbove
    ]
  });

  streetsMap.addTo(myMap);
  //get the data to be used...

  //overlays object to add to the layer control
  var overlays = {
    "0-1": layers.zeroToOne,
    "1-2": layers.oneToTwo,
    "2-3": layers.twoToThree,
    "3-4": layers.threeToFour,
    "4-5": layers.fourToFive,
    "5+":  layers.fiveAndAbove
  };

  //create the layer control
  //remove collapsed: false if you want the legend to well, collapse into a smaller area
  //L.control.layers(null, overlays, {collapsed: false}).addTo(myMap); 
  L.control.layers(null, overlays).addTo(myMap);

  //create the legend to show the info about our data
  var info = L.control({
    position: "bottomright"
  });
  // When the layer control is added, insert a div with the class of "legend"
  info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    return div;
  };
  // Add the info legend to the map
  info.addTo(myMap);
  // Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
// "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//perform an api call

//if you need to have less earthquakes on the map since it's too cluttered, can easily swap out the geojson link
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(earthquakeData) {
  var earthquakes = earthquakeData.features;
  //magnitude -> earthquakes[i].properties.mag
  //lat -> earthquakes[i].geometry.coordinates.1
  //lon -> earthquakes[i].geometry.coordinates.0
  //confirm those are lat and lon... there's also a coordinate at 2 I believe would be elevation or something
  
// console.log(earthquakes[0].properties.mag)
  //keep track of number at each magnitude, just for fun
    var magnitudeCount = {
        zeroToOne: 0,
        oneToTwo: 0,
        twoToThree: 0,
        threeToFour: 0,
        fourToFive: 0,
        fiveAndAbove: 0
    };

    var magnitude;

    //loop through data for each earthquake
    for (var i = 0; i < earthquakes.length; i++){
        var earthquake = Object.assign({}, earthquakes[i]);
        if (earthquakes[i].properties.mag >= 5){
            // console.log(`earthquake ${i} is over 5!`)
            magnitudeCount["fiveAndAbove"]++;
            //createMarker(earthquakes[i]);
            createCircle(earthquakes[i], "red", "fiveAndAbove");
        }
        else if (earthquakes[i].properties.mag >= 4){
            // console.log(`earthquake ${i} is 4-5`)
            magnitudeCount["fourToFive"]++;
            createCircle(earthquakes[i], "orange", "fourToFive");
        }
        else if (earthquakes[i].properties.mag >= 3){
            // console.log(`earthquake ${i} is 3-4`)
            magnitudeCount["threeToFour"]++;
            createCircle(earthquakes[i], "yellow", "threeToFour");
        }
        else if (earthquakes[i].properties.mag >= 2){
            // console.log(`earthquake ${i} is 2-3`)
            magnitudeCount["twoToThree"]++;
            createCircle(earthquakes[i], "green", "twoToThree"); //pick out better colors
        }
        else if (earthquakes[i].properties.mag >= 1){
            // console.log(`earthquake ${i} is 1-2`)
            magnitudeCount["oneToTwo"]++;
            createCircle(earthquakes[i], "teal", "oneToTwo");
        }
        else{
            // console.log(`earthquake ${i} is below 1`)
            magnitudeCount["zeroToOne"]++;
            createCircle(earthquakes[i], "blue", "zeroToOne");
        }
    }
    console.log(magnitudeCount);
    // console.log(earthquakes[0].geometry.coordinates[0])

    //instead of markers let's go with circles
    function createCircle(earthquake, color, layer){ //maybe pass in a radius multiplier to make smaller mag even smaller
        //var newCircle =
        var newCircle = L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]],{
            fillOpacity: 0.5,
            color: "none", //no outline
            fillColor: color,
            radius: earthquake.properties.mag * 15000
        });

        newCircle.addTo(layers[layer]);
        newCircle.bindPopup(earthquake.properties.place); //put better info here
        // console.log("test")
    }

    //IMPORTANT: still have to create the legend 
    
    // createMarker(earthquake){
    //     var newMarker = L.marker([earthquake.geometry.coordinates[0],earthquake.geometry.coordinates[1]],{
            
    //     });
    //     newMarker.addTo(layers[])
    // }
});




// Perform a GET request to the query URL
// d3.json(queryUrl, function(data) {
// // Once we get a response, send the data.features object to the createFeatures function
// createFeatures(data.features);
// });

// var earthquakes = L.geoJSON(earthquakeData, {
//     onEachFeature: onEachFeature
//   });