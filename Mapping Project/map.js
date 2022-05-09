//global variables for map and lat and lon values
map = new Microsoft.Maps.Map(document.getElementById('myMap'), {});
lat = document.getElementById('lattitude').value;
lon = document.getElementById('longitude').value;

function LoadMap() {
       //Loads the map
        map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(30.392834, -88.887085),
        zoom: 12
    });
    //Enables the search bar and sets up the zoom features
        map.setOptions({
        maxZoom: 15,
        minZoom: 5,
       // showSearchBar: true
    }); 
}//end load map function

function GeoLocate() {
    //get users current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(GetUserLocation);
    }//end if
}//end function

function GetUserLocation(position) {
    //set the value of our coords to lat and lon variables
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    //store the lat and lon values into html element
    document.getElementById('lattitude').value = lat;
    document.getElementById('longitude').value = lon;

    DisplayUserLocation();
}//end function

function DisplayUserLocation() {
    //set the view of our map to our users location
    map.setView({
        mapTypeID: Microsoft.Maps.MapTypeId.aerial,
        center: new Microsoft.Maps.Location(lat, lon),
        zoom: 12,
    });
    var center = map.getCenter();
    //Create Pushpin for users current location
    var pin = new Microsoft.Maps.Pushpin(center, {
        title: 'Your Here',
        color: 'red'
    });
    //Add the pushpin to the map
    map.entities.push(pin);
}//end function


function DrawPolygon() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {});
    var center = map.getCenter();
    var polygon = new Microsoft.Maps.Polygon([
        new Microsoft.Maps.Location(center.latitude - 0.05, center.longitude - 0.05),
        new Microsoft.Maps.Location(center.latitude + 0.01, center.longitude - 0.05),
        new Microsoft.Maps.Location(center.latitude + 0.01, center.longitude + 0.05)], { fillColor: 'blue', strokeColor: 'red', strokeThickness: 2 });
    map.entities.push(polygon);
    document.getElementById('printoutPanel').innerHTML =
        'Setting polygon rings in 2 seconds...';
    var updatePrintout = setTimeout(function () {
        polygon.setRings([
            [new Microsoft.Maps.Location(center.latitude + 0.1, center.longitude - 0.1),
            new Microsoft.Maps.Location(center.latitude + 0.1, center.longitude + 0.1),
            new Microsoft.Maps.Location(center.latitude - 0.1, center.longitude + 0.1),
            new Microsoft.Maps.Location(center.latitude - 0.1, center.longitude - 0.1)],
            [new Microsoft.Maps.Location(center.latitude + 0.05, center.longitude - 0.05),
            new Microsoft.Maps.Location(center.latitude - 0.05, center.longitude - 0.05),
            new Microsoft.Maps.Location(center.latitude - 0.05, center.longitude + 0.05),
            new Microsoft.Maps.Location(center.latitude + 0.05, center.longitude + 0.05)]]);
        document.getElementById('printoutPanel').innerHTML =
            'Rings of polygon set.';
    }, 2000);

}//end draw polygon function


function GetDirections() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: new Microsoft.Maps.Location(30.392834, -88.887085),
        zoom: 10
    });
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') });
        directionsManager.showInputPanel('directionsInputContainer');
    });
}//end get directions function

function QuickSearch() {

    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: onLoad,
        errorCallback: onError
    });
    function onLoad() {
        var options = { maxResults: 5, businessSuggestions: true };
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectedSuggestion);
    }
    function onError(message) {
        document.getElementById('printoutPanel').innerHTML = message;
    }
    function selectedSuggestion(suggestionResult) {
        document.getElementById('printoutPanel').innerHTML =
            'Suggestion: ' + suggestionResult.formattedSuggestion;
    }
}//end quick search function


function GetNearbyEntities() {

    //gets users selection out of our textbox so we can use it for our POI search in url
    options = document.getElementById("PointsOfInterest").value;
   
    //our api url to search our map for a specific POI based on the user current location
    queryUrl = 'https://dev.virtualearth.net/REST/v1/LocalSearch/?query=' + options + '&userLocation=' + lat + ',' + lon + '&key=Ap_sPVyGSb5CiUWhf-roRRNhqMSu6dKR4SUGYM4QGkbKc6O693s6cBSpcQ_h2LwY';

    //fetch the response data from our url request, returns in json format
    fetch(queryUrl)
        .then((response) => {
            return response.text();
        })
        .then(function (data) {
            //parse data into object
            jsonData = JSON.parse(data);

            //call function
            GetPoiData(jsonData);
        });//end fetch
}//end nearby entities function


function GetPoiData() {
    //declare variables for POI
    let poiName = [];
    let poiAddress = [];
    let poiPhoneNumber = [];
    let pointsOfInterest = [];
    let poiGeocodePoints = [];
    let poiCoordinates = [];
    let resourceSet = [];
    let coords = [];
    let poiLat = [];
    let poiLon = [];
    let pin = [];
    
    //grab the resourceSet, grab resources from resourceset
    resourceSet = jsonData.resourceSets[0].resources;

    //for loop to run through the resourceSet (from our json object)
    for (let i = 0; i < resourceSet.length; i++) {

        poiName = resourceSet[i].name;
        poiAddress = resourceSet[i].Address.formattedAddress;    
        poiPhoneNumber = resourceSet[i].PhoneNumber;
        poiGeocodePoints = resourceSet[i].geocodePoints[0];   
        poiCoordinates = poiGeocodePoints.coordinates;

        poiLat = poiCoordinates[0];
        poiLon = poiCoordinates[1];
        coords[i] = [poiLat, poiLon];

        pointsOfInterest[i] = poiName + ' ' + poiAddress + ' ' + poiPhoneNumber + '\n';

        //change the map view
        map.setView({
            mapTypeID: Microsoft.Maps.MapTypeId.aerial,
            center: new Microsoft.Maps.Location(poiLat, poiLon),
            zoom: 13,
        });
        //center the map
        let center = map.getCenter(lat, lon);

        //Create Entities Pushpins
        pin = new Microsoft.Maps.Pushpin(center, {
            title: poiName,
            color: 'blue'
        });

        //Add the pushpins to the map
        map.entities.push(pin);

    }//end for 

    //display POI results into text area
    for (let i = 0; i < pointsOfInterest.length; i++) {

        displayData = document.getElementById("PoiList").innerHTML = pointsOfInterest;
    }//end for

}//end function

function LogVisit(){
//To Do make this functional
}//end log visit functiion


