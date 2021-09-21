var map = L.map('mapid').on('load', onMapLoad).setView([41.6896, 2.4919], 9);
// DESCOMENTAR PER ACTIVAR EL NIVELL 3
// map.locate({ setView: true, maxZoom: 16});

var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

//en el clusters almaceno todos los markers
var markers = L.markerClusterGroup();
var data_markers = [];
var kind_foods = [];
var unique_kf = [];
var arrayOfLatLngs = [];

function onMapLoad() {

	console.log("Mapa cargado");
	/* 	FASE 3.1
	1) Relleno el data_markers con una petición a la api*/
	$.ajax({
		type: "get",
		url: "http://localhost/api/apiRestaurants.php",
		data: "data",
		dataType: "json",
		success: function (data) {
			data_markers = data;
			findUniqueKindFoods(data_markers);

			/*2) Añado de forma dinámica en el select los posibles tipos de restaurantes*/
			addingRestTypes(unique_kf);

			/*3) Llamo a la función --> render_to_map(data_markers, 'all'); <-- para mostrar restaurantes en el mapa */
			render_to_map(data_markers, "all");
		},
		error: function (xhr, status, error) {
			console.log(xhr);
			console.log(status);
			console.log(error);
		}
	});
}

function findUniqueKindFoods(yourArray) {
	// 2.1) Amb un bucle recorro tots els kind_food de tots els restaurants.
	$.each(yourArray, function (key, item) {
		// 2.2) Amb l'split els separo per "," i es crea un array per cada restaurant.
		var each_kind_foods = [...item.kind_food.split(",")];
		item.unique_kfs = each_kind_foods;

		// 2.1.1 Amb un altre bucle recorro cada array de kind_food de cada restaurant.
		$.each(each_kind_foods, function (i, value) {
			kind_foods.push(value);
		});
	});

	unique_kf = [...new Set(kind_foods)];
}

function addingRestTypes(arr) {
	// On del DOM apareixeran les opcions
	let kind_food_selector = document.getElementById("kind_food_selector");

	// Creant la <option> per cada tipus de menjar
	$.each(arr, function (index, value) {
		let optionCreated = document.createElement("option");
		optionCreated.innerHTML = `<option value="hola">${value}</option>`;
		kind_food_selector.appendChild(optionCreated);
	});
}

$('#kind_food_selector').on('change', function () {
	console.log(this.value);
	render_to_map(data_markers, this.value);
});

$("#displayAllRestaurants").on('click', function () {
	render_to_map(data_markers, "all");
});

function render_to_map(array, filter) {
	/* FASE 3.2
		1) Limpio todos los marcadores*/
	markers.clearLayers();

	/*	2) Realizo un bucle para decidir que marcadores cumplen el filtro, y los agregamos al mapa */
	if (filter === "all" || filter) {
		$.each(array, function (key, item) {
			let latEl = item.lat;
			let lngEl = item.lng;
			let nomRestaurant = item.name;
			let kfs = item.unique_kfs;
			let latlng = L.latLng(latEl, lngEl);
			arrayOfLatLngs.push(latlng);
			let photo = item.photo;
			let direccio = item.address;

			if (filter === "all") {
				displayEachMarker(latEl, lngEl, nomRestaurant, kfs, photo, direccio);

			} else if (filter !== "all") {
				$.each(item.unique_kfs, function (i, value) {
					if (filter === value) {
						displayEachMarker(latEl, lngEl, nomRestaurant, kfs, photo, direccio);
					}
				});
			}
		});
	}

	map.addLayer(markers);
	// Que el zoom quedi centrat mostrant tots els markers.
	var bounds = new L.LatLngBounds(arrayOfLatLngs);
	map.fitBounds(bounds);
}

function displayEachMarker(lat, lng, nameRest, kfs, photo, direccio) {
	let marker = L.marker([lat, lng])
		.bindPopup("<b> <h5 class='restName'>" + nameRest.toUpperCase() + "</h5> <img src='fotos/" + photo + "'" + " alt= 'foto del restaurant '" + " class=popupImage " + "/></img><br> Direcció: </b>" + direccio + "<br> <b> Lat: </b>" + lat.toString() + " <b> Lng: </b>" + lng.toString() + " <br> <b> Tipus de menjar que hi trobaras: </b>" + kfs);

	markers.addLayer(marker);
}