import './style.css';
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import LayerTile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileJSON from 'ol/source/OSM';
import MapboxVector from 'ol/layer/MapboxVector';
import Stamen from 'ol/source/Stamen';
import XYZ from 'ol/source/XYZ';

import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

//import Circle from 'ol/geom/Circle';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text, Icon } from 'ol/style';
import { Circle as CircleStyle } from 'ol/style';

import { DragBox, Select } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';

import Overlay from 'ol/Overlay';
import Geocoder from 'ol-geocoder';


var dataArray = [];
const infoBox = document.getElementById('info');

function downloadCSVFile(csv_data) {

  // Create CSV file object and feed
  // our csv_data into it
  var CSVFile = new Blob([csv_data], {
      type: "text/csv"
  });

  // Create to temporary link to initiate
  // download process
  var temp_link = document.createElement('a');

  // Download csv file
  temp_link.download = "SAJG_export.csv";
  var url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);
}

$(document).ready(function(){
  $("#search-input").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#info-table tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
  // var rowCount = $('#info-table tr').length - 1;
  // $('#lblName').text(rowCount + ' articles');
});

$(document).on("click", "#clear-button", function () {
  selectedFeatures.clear();
  dataArray = [];
  console.log(dataArray);
  $('#info-table > tbody').html("");
  $("#info").toggle();
  $("#search-input").toggle();
  $("#clear-button").toggle();
  $("#tableToCSV").toggle();
  $("#myChart").toggle();
  document.querySelector('#search-input').value = '';
});

$(document).on("click", "#tableToCSV", function () {
    // Variable to store the final csv data
    var csv_data = [];

    // Get each row data
    var rows = document.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
  
        // Get each column data
        var cols = rows[i].querySelectorAll('td,th');
  
        // Stores each csv row data
        var csvrow = [];
        for (var j = 0; j < cols.length; j++) {
  
            // Get the text data of each cell
            // of a row and push it to csvrow
            csvrow.push(cols[j].innerHTML);
        }
  
        // Combine each column value with comma
        csv_data.push(csvrow.join(","));
    }
  
    // Combine each row data with new line character
    csv_data = csv_data.join('\n');
  
    // Call this function to download csv file 
    downloadCSVFile(csv_data);
});

const image = new CircleStyle({
  radius: 6,
  fill: new Fill({ color: '#fc8d59'}),
  stroke: new Stroke({ color: '#f5f5f5', width: 1.5 }),
});

const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'data/pin-24.png',
  }),
});

const style = new Style({
  image: image,
});

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: 'https://vrautenbach.github.io/SAJG_2021_v3.geojson',
    format: new GeoJSON(),
  }),
  style: function (feature) {
    //style.getText().setText(feature.get('name'));
    return style;
  }
});

const osm = new TileLayer({
  title: 'OpenStreetMap',
  type: 'base',
  visible: true,
  source: new OSM(),
});

const hybrid = new TileLayer({
  title: 'MapTiler Satellite Hybrid',
  type: 'base',
  visible: false,
  source: new XYZ({
    url: 'https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}@2x.jpg?key=uBFqqVbfHTkiVSZLXuBJ' //this works',
  }),
});

const satellite = new TileLayer({
  title: 'ArcGIS Satellite',
  type: 'base',
  visible: false,
  source: new XYZ({
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' //this works',
  }),
});

const terrain = new TileLayer({
  title: 'Stamen Terrain',
  type: 'base',
  visible: false,
  source: new XYZ({
    url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg' //this works',
  }),
});

const baseMaps = new LayerGroup({
  title: 'Basemaps',
  layers: [satellite, hybrid, terrain, osm]
});

const map = new Map({
  target: 'map',
  layers: [baseMaps, vectorLayer],
  view: new View({
    center: [0, 0],
    zoom: 2,
  })
});

const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'children'
});

map.addControl(layerSwitcher);


function findValueInArray(value, arr) {
  var result = "Doesn't exist";

  for (var i = 0; i < arr.length; i++) {
    var name = arr[i];
    if (name == value) {
      result = 'Exist';
      break;
    }
  }
  return result;
}

// a normal select interaction to handle click
const select = new Select();
map.addInteraction(select);

const selectedFeatures = select.getFeatures();

// a DragBox interaction used to select features by drawing boxes
const dragBox = new DragBox({
  condition: platformModifierKeyOnly,
});

map.addInteraction(dragBox);

dragBox.on('boxend', function () {
  var done = [];
  var test = null;

  const rotation = map.getView().getRotation();
  const oblique = rotation % (Math.PI / 2) !== 0;
  const candidateFeatures = oblique ? [] : selectedFeatures;
  const extent = dragBox.getGeometry().getExtent();
  vectorLayer.getSource().forEachFeatureInExtent(extent, function (feature) {
    candidateFeatures.push(feature);
  });

  if (oblique) {
    const anchor = [0, 0];
    const geometry = dragBox.getGeometry().clone();
    geometry.rotate(-rotation, anchor);
    const extent = geometry.getExtent();
    candidateFeatures.forEach(function (feature) {
      const geometry = feature.getGeometry().clone();
      geometry.rotate(-rotation, anchor);
      if (geometry.intersectsExtent(extent)) {
        selectedFeatures.push(feature);
      }
    });
  }

  for (var i = 0; i < dataArray.length; i++) {
    test = dataArray[i].ID;
  
    if (findValueInArray(test, done) == "Doesn't exist") {

      $('#info-table > tbody:last-child').append(
        '<tr>'// need to change closing tag to an opening `<tr>` tag.
        // + '<td>' + dataArray[i].ID + '</td>'
        + '<td>' + dataArray[i].Title + '</td>'
        + '<td>' + dataArray[i].Author + '</td>'
        + '<td>' + dataArray[i].Keywords + '</td>'
        //+ '<td><span class="more">' + dataArray[i].Abstract + '</span></td>'
        + '<td>' + dataArray[i].Abstract + '</td>'
        + '<td>' + dataArray[i].Vol + '</td>'
        + '<td>' + dataArray[i].Year + '</td>'
        + '<td><a href="' + dataArray[i].Link + '" target="_blank">' + dataArray[i].Link + '</a></td>'
        + '</tr>');
    }
    done.push(test);
  }
  // var rowCount = $('#info-table tr').length - 1;
  // $('#lblName').text(rowCount + ' articles');
  $("#info").toggle();
  $("#search-input").toggle();
  $("#clear-button").toggle();
  $("#tableToCSV").toggle();

  var result = dataArray.map(x => x.Keywords);
  result = result.toString().toLowerCase().replace(/[&\/\\#^+()$~%.'":;,*?<>{}!@]/g, '');
  testing(result);
  $("#myChart").toggle();
});

// clear selection when drawing a new box and when clicking on the map
dragBox.on('boxstart', function () {
  selectedFeatures.clear();
  dataArray = [];
  console.log(dataArray);
  $('#info-table > tbody').html("");
});

selectedFeatures.on(['add', 'remove'], function () {
  //alert('feature added or removed');
  const names = selectedFeatures.getArray().map(function (feature) {

    dataArray.push({
      // Address: feature.properties.Address,
      Title: feature.get('Title'),
      Author: feature.get('Author'),
      Keywords: feature.get('Keywords'),
      Abstract: feature.get('Abstract'),
      Vol: feature.get('Vol'),
      Year: feature.get('Year'),
      Link: feature.get('Link'),
      ID: feature.get('ID')
    });

    return feature.get('ID');

  });
  // if (names.length > 0) {
  //   //infoBox.innerHTML = names.join(', ');
  // } else {
  //   infoBox.innerHTML = 'No points selected';
  // }
});

// Instantiate with some options and add the Control
const geocoder = new Geocoder('nominatim', {
  provider: 'osm',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  debug: false,
  autoComplete: true,
  keepOpen: true,
  featureStyle: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: '#000000'}),
      stroke: new Stroke({ color: '#f5f5f5', width: 1.5 }),
  }),
});

map.addControl(geocoder);

geocoder.on('addresschosen', function(evt) {
  console.info(evt);
});

function testing(text) {
  //Creating the World Cloud
  ZC.LICENSE = ["569d52cefae586f634c54f86dc99e6a9", "b55b025e438fa8a98e32482b5f768ff5"];
  zingchart.MODULESDIR = 'https://cdn.zingchart.com/modules/';

  var myConfig = {
    type: 'wordcloud',
    backgroundColor: '#1F6B75',
    options: {
      text: text,
      minLength: 3,
      //ignore: ["America", "American", "Applause", "Because", "because", "could", "don’t", "people", "That’s", "that’s", "Their", "their", "there", "these", "thing", "those", "through", "We’re", "we’re", "where", "would"],
      maxItems: 25,
      aspect: 'spiral',

      colorType: 'color',
      color: '#ffffff',

      style: {
        fontFamily: 'Crete Round',
      }
    }, 
  };

  zingchart.render({
    id: 'myChart',
    data: myConfig,
    height: '200px',
    width: '100%'
  });
}