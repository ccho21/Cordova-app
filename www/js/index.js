/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var geoController = (function () {
    var CurrentGPS = function (latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp, type, staticMapUrl) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.accuracy = accuracy;
        this.altitudeAccuracy = altitudeAccuracy;
        this.heading = heading;
        this.timestamp = timestamp;
        this.type = type;
        this.staticMapUrl = staticMapUrl;
    };

    var mapOptions = {
        center: {lat: 43.695615, lng: -79.492005},
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    var allGPS = [];
    ///////////////////////////////////// PROTOTYPE for GPS OBJECT
    CurrentGPS.prototype.getLatLng = function () {
        var curLatLng = {};
        curLatLng.latitude = this.latitude;
        curLatLng.longitude = this.longitude;
        return curLatLng;
    }

    return {
        getallLatLng: function () {
            var allLatLng = allGPS.map(function (cur) {
                return cur.getLatLng();
            });
            return allLatLng;
        },
        getMapOptions: function () {
            return mapOptions;
        },
        getPosition: function (type) {
            var newGPS = {};
            var currentTime = new Date();
            var obj = this;

            var options = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 10000
            }
            var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

            function onSuccess(position) {

                alert('Latitude: ' + position.coords.latitude + '\n' +
                    'Longitude: ' + position.coords.longitude + '\n' +
                    'Altitude: ' + position.coords.altitude + '\n' +
                    'Accuracy: ' + position.coords.accuracy + '\n' +
                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                    'Heading: ' + position.coords.heading + '\n' +
                    'Speed: ' + position.coords.speed + '\n' +
                    'Timestamp: ' + position.timestamp + '\n');

                var imgUrl = obj.imgExport(position.coords.latitude, position.coords.longitude);
                newGPS = new CurrentGPS
                (
                    position.coords.latitude,
                    position.coords.longitude,
                    position.coords.altitude,
                    position.coords.accuracy,
                    position.coords.altitudeAccuracy,
                    position.coords.heading,
                    position.coords.speed,
                    currentTime,
                    type,
                    imgUrl
                );
                /////////////STORE the INFO INTO VARIABE

                console.log(newGPS);
                if (newGPS !== null) {
                    console.log('trying to put image url in object');

                    allGPS.push(newGPS);
                    console.log("GPS is Successfully stored");
                    console.log(allGPS);
                    obj.post_ajax_request(newGPS);
                }
                else {
                    console.log("GPS is not stored");
                }
            };

            function onError(error) {
                alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            }
        },

        displayListOfWork: function () {
            console.log("Display is working");
            var record = '';

            for (var i = 0; i < allGPS.length; i++) {
                record +=
                    '<div class="card">' +
                    '<img class="card-img-top" src="' + allGPS[i].staticMapUrl + '" alt="MapUrl" style="width:200px;height:200px;">' +
                    '<div class="card-body">' +
                    '<p class="card-text">' +
                    '<div>Employee Name</div>' +
                    '<div>' + allGPS[i].timestamp + '</div>' +
                    '<div>' + allGPS[i].type + '</div>' +
                    '</p>' +
                    '</div>' +
                    '</div>';
            }
            console.log(record);
            return record;
        },
        imgExport: function (latitude, longitude) {
            var mapOptions = this.getMapOptions();
            console.log("this is static image object in imgExport");
            console.log(mapOptions);

            //URL of Google Static Maps.
            var staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap";

            //Set the Google Map Center.
            staticMapUrl += "?center=" + mapOptions.center.lat + "," + mapOptions.center.lng;

            //Set the Google Map Size.
            staticMapUrl += "&size=220x350";

            //Set the Google Map Zoom.
            staticMapUrl += "&zoom=" + mapOptions.zoom;

            //Set the Google Map Type.
            staticMapUrl += "&maptype=" + mapOptions.mapTypeId;

            //Loop and add Markers.
            staticMapUrl += "&markers=color:red|" + latitude + "," + longitude;

            console.log(staticMapUrl);
            return staticMapUrl;
        },
        post_ajax_request: function (newGPS) {

            console.log("This is Ajax Call"+ " " + "IN AJAX_REQUEST FUNCTION");
            console.log(newGPS);
            $.ajax({
                url: "http://192.168.2.149/api/v1/employee_locations",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: newGPS,
                datatype: 'json',
                crossDomain: true,
                method: "POST",
                success: function (data) {
                    console.log("This is DATA after through POST method");
                    if(data.type === 'START WORK') {
                        alert("Work has started");

                        console.log(data);
                    }
                    if(data.type === 'END WORK') {
                        alert("Work is finished");

                        console.log(data);
                    }
                    if(data.type === 'START BREAK') {
                        alert("Break has started");

                        console.log(data);
                    }
                    if(data.type === 'END BREAK') {
                        alert("Break is done");

                        console.log(data);
                    }
                },
                errors: function(data) {
                    console.log(data);
                }
            });
        },
        get_ajax_request: function () {

            console.log("This is Ajax Call"+ " " + "IN GET_AJAX_REQUEST FUNCTION");
            $.ajax({
                url: "http://192.168.2.149/api/v1/employee_locations",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                datatype: 'json',
                crossDomain: true,
                method: "GET",
                success: function (data) {
                    console.log("successfully received data through GET method");
                    console.log(data);
                    var record = '';
                    for (var i = 0; i < data.length; i++) {
                        record +=
                            '<div class="card">' +
                            '<img class="card-img-top" src="' + data[i].staticMapUrl + '" alt="MapUrl" style="width:200px;height:200px;">' +
                            '<div class="card-body">' +
                            '<p class="card-text">' +
                            '<div>Employee Name</div>' +
                            '<div>' + data[i].created_at + '</div>' +
                            '<div>' + data[i].type + '</div>' +
                            '</p>' +
                            '</div>' +
                            '</div>';
                    }
                    $("#table-work-list").append(record);
                    record = '';
                },
                errors: function(data) {
                    console.log(data);
                }
            });
        }
    }
})();

var controller = (function (geoController) {
    var setupEventListeners = function () {
        document.getElementById("startPosition").addEventListener("click", function (event) {
            event.preventDefault();
            geoController.getPosition("START WORK");
        });
        document.getElementById("endPosition")
            .addEventListener("click", function (event) {
                 event.preventDefault();
                geoController.getPosition("END WORK");
            });
        document.getElementById("startBreakPosition")
            .addEventListener("click", function (event) {
                 event.preventDefault();
                geoController.getPosition("START BREAK");
            });
        document.getElementById("endBreakPosition")
            .addEventListener("click", function (event) {
                 event.preventDefault();
                geoController.getPosition("END BREAK");
            });
        $("#display").click(function () {
            geoController.get_ajax_request();

            $('#jq_list_work_location').show();
            $( "#display" ).prop( "disabled", true );

        });
    }
    return {
        init: function () {

            console.log("application has started");
            setupEventListeners();
            $('#jq_list_work_location').hide();
            this.initMap();

        },
        initMap: function () {

            /*var locations = geoController.getallLatLng();
            console.log("this is are data from work");
            console.log(locations);*/
            var mapOptions = geoController.getMapOptions();

                var map = new google.maps.Map(document.getElementById('map'), mapOptions);
                var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

                var markers = this.locations.map(function (location, i) {
                    // console.log(location);
                    return new google.maps.Marker({
                        position: location,
                        label: labels[i % labels.length],
                        map: map
                });
            });
        }
    }
})(geoController);

controller.init();