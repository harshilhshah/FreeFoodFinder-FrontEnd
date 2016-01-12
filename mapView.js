  var map;
  var marker;
  var iter;
  var markers = [];
  var infowindow = new google.maps.InfoWindow();


  $(document).ready(function(){
    $(".nav-tabs a").click(function(){
        $(this).tab('show');
    });
    $('.nav-tabs a').on('shown.bs.tab', function(event){
        if($(event.target).text() == " Map View")
          initialize();
    });
  });
  function initialize () {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
          center: new google.maps.LatLng(40.505, -74.45),
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        map = new google.maps.Map(mapCanvas, mapOptions);
        for(var i = 0; i < eventData.length; i++){
          if(eventData[i][8] != null)
          markers.push([eventData[i][1],eventData[i][8]['lat'],eventData[i][8]['lng']]);
        }
        addMarkers();
      }

  function addMarkers(){
    for(iter = 0; iter < markers.length; iter++){
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(markers[iter][1], markers[iter][2]),
        map: map
      });

      google.maps.event.addListener(marker, 'click', (function(marker, iter) {
            return function() {
              infowindow.setContent(markers[iter][0]);
              infowindow.open(map, marker);
            }
          })(marker, iter));
    }
  }