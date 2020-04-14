
 var streetsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

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
    center: [0, 0], 
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
  L.control.layers(null, overlays).addTo(myMap);

//perform an api call

//if you need to have less earthquakes on the map since it's too cluttered, can easily swap out the geojson link
//More earthquakes than a full week's worth seems to slow down the plotting it all too
//d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(earthquakeData) {
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeData) {
  var earthquakes = earthquakeData.features;

  //keep track of number at each magnitude, just for fun
    var magnitudeCount = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };
    var magnitude;
    
    //function to assign colors by magnitude
    function getColor(magnitude) {
      return magnitude >= 5 ? "red" :
             magnitude >= 4 ? "orange" :
             magnitude >= 3 ? "yellow" :
             magnitude >= 2 ? "green" :
             magnitude >= 1 ? "teal" :
                              "blue" ;
    }

    //loop through data for each earthquake
    for (var i = 0; i < earthquakes.length; i++){
        var earthquake = Object.assign({}, earthquakes[i]);
        if (earthquakes[i].properties.mag >= 5){
            magnitudeCount[5]++;
            createCircle(earthquakes[i], getColor(5), "fiveAndAbove", 30000);
        }
        else if (earthquakes[i].properties.mag >= 4){
            magnitudeCount[4]++;
            createCircle(earthquakes[i], getColor(4), "fourToFive", 20000);
        }
        else if (earthquakes[i].properties.mag >= 3){
            magnitudeCount[3]++;
            createCircle(earthquakes[i], getColor(3), "threeToFour", 15000);
        }
        else if (earthquakes[i].properties.mag >= 2){
            magnitudeCount[2]++;
            createCircle(earthquakes[i], getColor(2), "twoToThree", 15000); //pick out better colors
        }
        else if (earthquakes[i].properties.mag >= 1){
            magnitudeCount[1]++;
            createCircle(earthquakes[i], getColor(1), "oneToTwo", 15000);
        }
        else{
            magnitudeCount[0]++;
            createCircle(earthquakes[i], getColor(0), "zeroToOne", 15000);
        }
    }

    //instead of markers let's go with circles
    function createCircle(earthquake, color, layer, radiusMult){ 
        var newCircle = L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]],{
            fillOpacity: 0.5,
            color: "none", //no outline
            fillColor: color,
            radius: earthquake.properties.mag * radiusMult
        });

        newCircle.addTo(layers[layer]);
        newCircle.bindPopup(earthquake.properties.place + "<br> magnitude: " + earthquake.properties.mag); 
    }

    //create legend, add to map, and populate its information
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map){
        var div = L.DomUtil.create('div', 'info legend'),
        test = [0,1,2,3,4,5]

        return div;
    }

    legend.addTo(myMap); 
    
    updateLegend(magnitudeCount)

    function updateLegend(magnitudeCount) {
      console.log(magnitudeCount)
      test = [0,1,2,3,4,5]
      document.querySelector(".legend").innerHTML = '<strong> Earthquake Magnitude and Count </strong><br>'
      for (var i = 0; i < test.length; i++){
        document.querySelector(".legend").innerHTML +=
          '<i style="background:' + getColor(test[i]) + '"></i>' +
          test[i] + (test[i + 1] ? '&mdash;' + test[i + 1] + ": " + magnitudeCount[test[i]] + '<br>': '+' + ": " + magnitudeCount[test[i]]); //+ " Count: " + magnitudeCount[test[i]]
      }
    }
  });
