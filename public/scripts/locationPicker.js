var point = {
    lng: "21.92144216932372",
    lat: "39.36443119511233"
}

function initMap() {
    const element = document.getElementById('map')
    const lat = element.getAttribute('latitude')
    const lng = element.getAttribute('longitude')
    if (lat && lng){
        point.lng = lng
        point.lat = lat
    }
    const map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
        },
        zoom: 11
    });

    const marker = new google.maps.Marker({
        position: {
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
        },
        map: map,
        draggable: true
    });

    google.maps.event.addListener(marker, "dragend", function(e) {
        point.lat = e.latLng.lat().toString();
        point.lng = e.latLng.lng().toString();
    });

    const input = document.getElementById("search-box");
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
        input.hidden = false;
    });

    setTimeout(function() {
        input.hidden = false;
    }, 2000)

    map.addListener("bounds_changed", function() {
        const karditsaBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(39.336662, 21.703791),
            new google.maps.LatLng(39.401833, 21.786118)
        );
        searchBox.setBounds(karditsaBounds);
    });

    searchBox.addListener("places_changed", function() {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        const place = places[0];
        marker.setPosition(place.geometry.location);
        map.setCenter(place.geometry.location);
        map.setZoom(15);
    });
}