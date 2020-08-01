// This is the main Javascript file
// Leaflet map is loaded with basemaps and our custom maps
// Full description of the technology stack explained here:

//https://medium.com/@kennethchambers/using-tippecanoe-tileserver-gl-and-leaflet-to-serve-scale-independent-and-really-cool-looking-751368d821c7

// Initialize Map
var map = L.map('mapid').setView([37, -95], 5)



// Clever method to detect if the client is a mobile browser
var isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)

if (isMobile)
{
    // Remove side panel if on Mobile
    d3.select("#left_panel").remove()
    d3.select("#bottom_panel").style('height', '30px')
    d3.select("#mapid").style('height', 'calc(100vh - 30px)')
    map.invalidateSize()
    map.setView([38, -122], 5)
    build_mobile_panel()

    //map.locate({setView: true})


}
else
{
    // Build the side panel

    d3.select("#bottom_panel").remove()
    build_desktop_panel()

    // d3.select("#left_panel").remove()
    // map.invalidateSize()
    // map.setView([37, -95], 3)
    // build_mobile_panel()

}


var geocoder = L.Control.geocoder({
    collapsed: false,
    placeholder: "Search..."})
    .on('markgeocode', function(e) {
	var bbox = e.geocode.bbox;
	var poly = L.polygon([
	    bbox.getSouthEast(),
	    bbox.getNorthEast(),
	    bbox.getNorthWest(),
	    bbox.getSouthWest()
	])
	map.fitBounds(poly.getBounds());
    })
    .addTo(map);

// Print map - DISABLED: https://github.com/wottomgauss/unity2020maps/issues/3
// L.control.browserPrint({manualMode: true}).addTo(map)

// Move leaflet 'control' off the map
// var newParent = document.getElementById('custom-map-controls');
// var oldParent = document.getElementsByClassName("leaflet-top leaflet-right")
// while (oldParent[0].childNodes.length > 0) {
//     if (newParent)
//     {
// 	//newParent.appendChild(oldParent[0].childNodes[0]);
//     }
// }



// Add basemap from Stamen
var base_layer = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 18,
    id: 'lines',
    tileSize: 512,
    zoomOffset: -1,
})

var base_background = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 18,
    opacity: 0.7,
    id: 'lines',
    tileSize: 512,
    zoomOffset: -1,
})


// Add basemap labels so that they appear on top of all other layers
var base_labels = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png', {
    attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.",
    maxZoom: 18,
    id: 'labels',
    tileSize: 512,
    zoomOffset: -1,
})

// URL of the AWS server with Tileserver running
var url_high = "https://maps443-1.tcpdump.rocks/data/targets_high/{z}/{x}/{y}.pbf"

// Add our map - HIGH RES
var unity_map_high = L.vectorGrid.protobuf(url_high, {
    //maxZoom: 20,
    vectorTileLayerStyles: {
	interactive: true,
	targets_high: properties => {
	    return getColorFromProperty1(properties, "percentile")
	}
    },
    // MUST include attribution - where we got this data
    attribution: ' 2016 Precinct-Level Election Results - Harvard Datasource: Voting and Election Science Team, University of Florida and Witchita State University',
    
})

var url_low = "https://maps443-2.tcpdump.rocks/data/targets_low/{z}/{x}/{y}.pbf"

// Add our map
// LOW RES
var unity_map_low = L.vectorGrid.protobuf(url_low, {
    //maxZoom: 8,
    vectorTileLayerStyles: {
	interactive: true,
	targets_low: properties => {
	    return getColorFromProperty2(properties, "percentile")
	}
    },
    // MUST include attribution - where we got this data
    attribution: ' 2016 Precinct-Level Election Results - Harvard Datasource: Voting and Election Science Team, University of Florida and Witchita State University',
    
})

// Add volunteer map
var volunteer_map = new L.GeoJSON(volunteer_geojson,
				  {
				      pointToLayer: createCircleMarker
});       

function createCircleMarker( feature, latlng ){
  // Change the values of these options to change the symbol's appearance
  let options = {
    radius: feature.properties.volunteer_count,
    fillColor: "green",
    color: "black",
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  }
  return L.circleMarker( latlng, options );
}


// Add our layer to the map, in the right order for visibility
base_layer.addTo(map)
base_background.addTo(map)
unity_map_low.addTo(map)
unity_map_high.addTo(map)
//volunteer_map.addTo(map);
base_labels.addTo(map)


// For development purposes - log the current zoom level
map.on('zoomend', function() {
    console.log("Zoom: " + map.getZoom())
});

// Callback when user clicks on a feature. Not working yet! Goal is to have a pop-up text showing full voter details of the area
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature
    });
}

function clickFeature(d)
{
    console.log(d)
}

