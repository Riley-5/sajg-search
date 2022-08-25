import "ol-layerswitcher/dist/ol-layerswitcher.css"
import "ol/ol.css"
import "./style.css"

import { Map, View } from "ol"
import LayerGroup from "ol/layer/Group"
import MapboxVector from "ol/layer/MapboxVector"
import { default as LayerTile, default as TileLayer } from "ol/layer/Tile"
import { default as OSM, default as TileJSON } from "ol/source/OSM"
import Stamen from "ol/source/Stamen"
import XYZ from "ol/source/XYZ"

import LayerSwitcher, {
	BaseLayerOptions,
	GroupLayerOptions
} from "ol-layerswitcher"

//import Circle from 'ol/geom/Circle';
import GeoJSON from "ol/format/GeoJSON"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import {
	Circle as CircleStyle,
	Fill,
	Icon,
	Stroke,
	Style,
	Text
} from "ol/style"

import { platformModifierKeyOnly } from "ol/events/condition"
import { DragBox, Select } from "ol/interaction"

import Geocoder from "ol-geocoder"
import Overlay from "ol/Overlay"

var dataArray = []
var done = []
var test = null
const infoBox = document.getElementById("info")

function downloadCSVFile(csv_data) {
	// Create CSV file object and feed
	// our csv_data into it
	var CSVFile = new Blob([csv_data], {
		type: "text/csv"
	})

	// Create to temporary link to initiate
	// download process
	var temp_link = document.createElement("a")

	// Download csv file
	temp_link.download = "SAJG_export.csv"
	var url = window.URL.createObjectURL(CSVFile)
	temp_link.href = url

	// This link should not be displayed
	temp_link.style.display = "none"
	document.body.appendChild(temp_link)

	// Automatically click the link to
	// trigger download
	temp_link.click()
	document.body.removeChild(temp_link)
}

$(document).ready(function () {
	$("#search-input").on("keyup", function () {
		var value = $(this).val().toLowerCase()
		$("#info-table tr").filter(function () {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		})
	})
	// var rowCount = $('#info-table tr').length - 1;
	// $('#lblName').text(rowCount + ' articles');
})

// TODO
/*
	When user searches for key words bring up all the journal articals relating to that search
*/
$(document).ready(() => {
	$("#search-input").toggle()
	$("#search-input").on("keyup", () => {
		selectedFeatures.clear()
		const searchValue = $("#search-input").val().toLowerCase()

		vectorLayer.getSource().forEachFeature((feature) => {
			const objectArr = Object.values(feature.values_)
			objectArr.map((values) => {
				if (values !== null) {
					const stringValues = values.toString().toLowerCase()
					if (stringValues.includes(searchValue)) {
						selectedFeatures.push(feature)
					}
				}
			})
		})
	})

	// $("#search-input").on("keyup", () => {
	// 	let searchValue = $("#search-input").val().toLowerCase()
	// 	/*
	// 		Loop through array
	// 		Check if searchValue is in one of the objects
	// 	*/
	// })
})

$(document).on("click", "#clear-button", function () {
	selectedFeatures.clear()
	dataArray = []
	$("#info-table > tbody").html("")
	$("#info").toggle()
	$("#search-input").toggle()
	$("#clear-button").toggle()
	$("#tableToCSV").toggle()
	$("#myChart").toggle()
	// Clear the search bar contents
	document.querySelector("#search-input").value = ""
})

$(document).on("click", "#tableToCSV", function () {
	// Variable to store the final csv data
	var csv_data = []

	// Get each row data
	var rows = document.getElementsByTagName("tr")
	for (var i = 0; i < rows.length; i++) {
		// Get each column data
		var cols = rows[i].querySelectorAll("td,th")

		// Stores each csv row data
		var csvrow = []
		for (var j = 0; j < cols.length; j++) {
			// Get the text data of each cell
			// of a row and push it to csvrow
			csvrow.push(cols[j].innerHTML)
		}

		// Combine each column value with comma
		csv_data.push(csvrow.join(","))
	}

	// Combine each row data with new line character
	csv_data = csv_data.join("\n")

	// Call this function to download csv file
	downloadCSVFile(csv_data)
})

const image = new CircleStyle({
	radius: 6,
	fill: new Fill({ color: "#fc8d59" }),
	stroke: new Stroke({ color: "#f5f5f5", width: 1.5 })
})

const iconStyle = new Style({
	image: new Icon({
		anchor: [0.5, 46],
		anchorXUnits: "fraction",
		anchorYUnits: "pixels",
		src: "data/pin-24.png"
	})
})

const style = new Style({
	image: image
})

const vectorLayer = new VectorLayer({
	source: new VectorSource({
		url: "https://vrautenbach.github.io/SAJG_2021_v3.geojson",
		format: new GeoJSON()
	}),
	style: function (feature) {
		//style.getText().setText(feature.get('name'));
		return style
	}
})

const osm = new TileLayer({
	title: "OpenStreetMap",
	type: "base",
	visible: true,
	source: new OSM()
})

const hybrid = new TileLayer({
	title: "MapTiler Satellite Hybrid",
	type: "base",
	visible: false,
	source: new XYZ({
		url: "https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}@2x.jpg?key=uBFqqVbfHTkiVSZLXuBJ" //this works',
	})
})

const satellite = new TileLayer({
	title: "ArcGIS Satellite",
	type: "base",
	visible: false,
	source: new XYZ({
		url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" //this works',
	})
})

const terrain = new TileLayer({
	title: "Stamen Terrain",
	type: "base",
	visible: false,
	source: new XYZ({
		url: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg" //this works',
	})
})

const baseMaps = new LayerGroup({
	title: "Basemaps",
	layers: [satellite, hybrid, terrain, osm]
})

const map = new Map({
	target: "map",
	layers: [baseMaps, vectorLayer],
	view: new View({
		center: [0, 0],
		zoom: 2
	})
})

const layerSwitcher = new LayerSwitcher({
	reverse: true,
	groupSelectStyle: "children"
})

map.addControl(layerSwitcher)

function findValueInArray(value, arr) {
	var result = "Doesn't exist"

	for (var i = 0; i < arr.length; i++) {
		var name = arr[i]
		if (name == value) {
			result = "Exist"
			break
		}
	}
	return result
}

// a normal select interaction to handle click
const select = new Select()
map.addInteraction(select)

const selectedFeatures = select.getFeatures()

// a DragBox interaction used to select features by drawing boxes
const dragBox = new DragBox({
	condition: platformModifierKeyOnly
})

map.addInteraction(dragBox)

/*
	Loops through the data array
	Adds all the data in the data array into a table that will show below the map
	Data of interest is Title, Author, Keywords, Abstract, Vol, Year and Link
*/
const addDataToTable = () => {
	for (var i = 0; i < dataArray.length; i++) {
		test = dataArray[i].ID

		if (findValueInArray(test, done) == "Doesn't exist") {
			$("#info-table > tbody:last-child").append(
				"<tr>" + // need to change closing tag to an opening `<tr>` tag.
					// + '<td>' + dataArray[i].ID + '</td>'
					"<td>" +
					dataArray[i].Title +
					"</td>" +
					"<td>" +
					dataArray[i].Author +
					"</td>" +
					"<td>" +
					dataArray[i].Keywords +
					"</td>" +
					//+ '<td><span class="more">' + dataArray[i].Abstract + '</span></td>'
					"<td>" +
					dataArray[i].Abstract +
					"</td>" +
					"<td>" +
					dataArray[i].Vol +
					"</td>" +
					"<td>" +
					dataArray[i].Year +
					"</td>" +
					'<td><a href="' +
					dataArray[i].Link +
					'" target="_blank">' +
					dataArray[i].Link +
					"</a></td>" +
					"</tr>"
			)
		}
		done.push(test)
	}
}

// Function to switch on and off layers
const toggleLayers = () => {
	$("#info").toggle()
	$("#search-input").toggle()
	$("#clear-button").toggle()
	$("#tableToCSV").toggle()
	$("#myChart").toggle()
}

// Fucntion that loops through the dataArray and adds the words into a worldcloud
const wordcloud = () => {
	var result = dataArray.map((x) => x.Keywords)
	result = result
		.toString()
		.toLowerCase()
		.replace(/[&\/\\#^+()$~%.'":;,*?<>{}!@]/g, "")
	testing(result)
}

dragBox.on("boxend", function () {
	done = []
	test = null

	const rotation = map.getView().getRotation()
	const oblique = rotation % (Math.PI / 2) !== 0
	const candidateFeatures = oblique ? [] : selectedFeatures
	const extent = dragBox.getGeometry().getExtent()
	vectorLayer.getSource().forEachFeatureInExtent(extent, function (feature) {
		candidateFeatures.push(feature)
	})

	if (oblique) {
		const anchor = [0, 0]
		const geometry = dragBox.getGeometry().clone()
		geometry.rotate(-rotation, anchor)
		const extent = geometry.getExtent()
		candidateFeatures.forEach(function (feature) {
			const geometry = feature.getGeometry().clone()
			geometry.rotate(-rotation, anchor)
			if (geometry.intersectsExtent(extent)) {
				selectedFeatures.push(feature)
			}
		})
	}

	// Add the data to the table
	addDataToTable()
	// Add datas keywords to wordcloud
	wordcloud()

	// var rowCount = $('#info-table tr').length - 1;
	// $('#lblName').text(rowCount + ' articles');
	// Show the table below the map
	toggleLayers()

	// Clear contents of search bar
	document.querySelector("#search-input").value = ""
})

// clear selection when drawing a new box and when clicking on the map
dragBox.on("boxstart", function () {
	selectedFeatures.clear()
	dataArray = []
	$("#info-table > tbody").html("")

	// If the table is showing hide the table
	if ($("#info").is(":visible")) {
		toggleLayers()
	}
})

selectedFeatures.on(["add", "remove"], function () {
	//alert('feature added or removed');
	const names = selectedFeatures.getArray().map(function (feature) {
		dataArray.push({
			// Address: feature.properties.Address,
			Title: feature.get("Title"),
			Author: feature.get("Author"),
			Keywords: feature.get("Keywords"),
			Abstract: feature.get("Abstract"),
			Vol: feature.get("Vol"),
			Year: feature.get("Year"),
			Link: feature.get("Link"),
			ID: feature.get("ID")
		})
		return feature.get("ID")
	})
	// if (names.length > 0) {
	//   //infoBox.innerHTML = names.join(', ');
	// } else {
	//   infoBox.innerHTML = 'No points selected';
	// }
})

/*
	Click on marker 
	Show the journal information in the table below the map for that journal artical
*/
map.on("click", (event) => {
	/*
		When the map is clicked
		Clear the selected fetures
		set the dataArray to an empty array
		If the table below the map is showing toggle it to not show
			-> For when a user click from a point to the map
			
	*/
	selectedFeatures.clear()
	dataArray = []

	// If the map is clickec and the table is showing hide the table
	if ($("#info").is(":visible")) {
		toggleLayers()
	}

	/*
		When a marker is clicked 
		Clear the Selected Features and dataArray
		If the tabel below the map is showing toggle it off
			-> for when a user clicks from one marker to the next (resets it)
	*/
	map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
		selectedFeatures.clear()
		dataArray = []
		$("#info-table > tbody").html("")

		// If a point is clicked and the table is showing hide the table
		if ($("#info").is(":visible")) {
			toggleLayers()
		}

		done = []
		test = null
		selectedFeatures.push(feature)

		// Add the selected features to the table
		addDataToTable()

		// Add the keywords to the word cloud for the clicked on marker
		wordcloud()

		// Show the table for the clicked on journal artical
		toggleLayers()
	})

	// Clear search bar contents
	document.querySelector("#search-input").value = ""
})

/*
	Select all btn clicked
	Get all the journal articals and add them to the table below the map
*/
const selectAllBtn = document.querySelector("#select-all-btn")
selectAllBtn.addEventListener("click", () => {
	// Clear selected feaures and empty the data array
	selectedFeatures.clear()
	dataArray = []

	// Loop through the vector layer and add each layer to the table below the map
	vectorLayer.getSource().forEachFeature((feature) => {
		$("#info-table > tbody").html("")
		// If the table is showing on the map hide it
		if ($("#info").is(":visible")) {
			toggleLayers()
		}

		done = []
		test = null
		selectedFeatures.push(feature)

		// Add all the data to the table
		addDataToTable()

		// Add the keywords to the word cloud for all the data
		wordcloud()

		// Show the table below the map
		toggleLayers()
	})

	// Clear search bar contents
	document.querySelector("#search-input").value = ""
})

/*
	When the mouse moves over a feature on the map
	If the feature is in the table style that row a light grey background
	Otherwise the row must be white background
*/
let selected = null
const table = document.querySelector("#info-table")
map.on("pointermove", (event) => {
	// First check if the something is selected therefore table showing
	if ($("#info").is(":visible")) {
		// If the mouse is not over a feature make the row colour white
		if (selected !== null) {
			tableRowColour("white")
			selected = null
		}

		// When the mouse is over a feature make the selected variable equal to that feature
		map.forEachFeatureAtPixel(event.pixel, (feature) => {
			selected = feature
			return true
		})

		if (selected) {
			tableRowColour("lightgrey")
		}
	}
})

/*
	Function takes a parameter colour as a string 
	Loops through the table and sets the corresponding map location features row colour 
*/
const tableRowColour = (colour) => {
	for (const row of table.rows) {
		for (const cell of row.cells) {
			if (selected.get("Title") === cell.innerHTML) {
				row.style.backgroundColor = colour
			}
		}
	}
}

// Instantiate with some options and add the Control
const geocoder = new Geocoder("nominatim", {
	provider: "osm",
	lang: "en",
	placeholder: "Search for ...",
	limit: 5,
	debug: false,
	autoComplete: true,
	keepOpen: true,
	featureStyle: new CircleStyle({
		radius: 6,
		fill: new Fill({ color: "#000000" }),
		stroke: new Stroke({ color: "#f5f5f5", width: 1.5 })
	})
})

map.addControl(geocoder)

geocoder.on("addresschosen", function (evt) {
	console.info(evt)
})

function testing(text) {
	//Creating the World Cloud
	ZC.LICENSE = [
		"569d52cefae586f634c54f86dc99e6a9",
		"b55b025e438fa8a98e32482b5f768ff5"
	]
	zingchart.MODULESDIR = "https://cdn.zingchart.com/modules/"

	var myConfig = {
		type: "wordcloud",
		backgroundColor: "#1F6B75",
		options: {
			text: text,
			minLength: 3,
			//ignore: ["America", "American", "Applause", "Because", "because", "could", "don’t", "people", "That’s", "that’s", "Their", "their", "there", "these", "thing", "those", "through", "We’re", "we’re", "where", "would"],
			maxItems: 25,
			aspect: "spiral",

			colorType: "color",
			color: "#ffffff",

			style: {
				fontFamily: "Crete Round"
			}
		}
	}

	zingchart.render({
		id: "myChart",
		data: myConfig,
		height: "200px",
		width: "100%"
	})
}
