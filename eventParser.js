var def_img = "def.jpg";
var config = {
  apiKey: "AIzaSyCaHVx1Aesj0QIuSKWo8mBlAitBjQfrpEg",
  authDomain: "crackling-heat-4631.firebaseapp.com",
  databaseURL: "https://crackling-heat-4631.firebaseio.com"
};

firebase.initializeApp(config);

var rootRef = firebase.database().ref();
var sourceRef = rootRef.child("source");
var postRef = rootRef.child("posts");

  var today = moment().format("YYYY-MM-DD");
  var eventData = [];
  var postData = [];
  var food_tags = [ "appetizer", "snack", "pizza", "lunch", "dinner", "breakfast", "meal", "candy", 
            "drinks", "punch", " serving", "pie ",  "cake", "soda", "chicken", "wings", "burger",
            "burrito", "bagel", "popcorn", "cream", "donut", "beer", "food", "dessert", "chocolate",
            "subs ", "hoagie", "sandwich", "turkey", "supper", "brunch", "takeout", "refreshment",
            "beverage", "cookie", "brownie", "chips", "soup", "grill", "bbq", "barbeque", "taco",
            "pretzel"
        ];  

  function getTags(str){
    var ret = "";
    for(var i = 0; i < food_tags.length; i++){
      if(str != undefined && str.toLowerCase().indexOf(food_tags[i]) !== -1){
        ret += "#" + food_tags[i] + " ";
      }
    }
    return ret;
  }

  function parseClubEvents(dataPair) {
    var data = dataPair.val();
    console.log(data);
    var club_name = dataPair.ref.parent.key;
    if(club_name != 'user_post' && getTags(data.description).length < 1) return;
    var location = " ";
    var latlng;
    if(data.place !== undefined){
      if(data.place.location !== undefined){
        location = data.place.location.street + ", " + data.place.location.city + " " + data.place.location.state;
        location = location.replace('undefined,','').replace(/undefined/g,'').trim();
        latlng = {lat: data.place.location.latitude, lng: data.place.location.longitude};
      }else{
        location = data.place.name;
      }
    } 
    var time = moment(data.start_time).format("dddd, MMMM D, YYYY (h:mm A");
    var timeChronoSt = moment(data.start_time).format("YYYY-MM-DD hh:mm:ss A");
    var timeChronoEn = (data.end_time) ? moment(data.end_time).format("YYYY-MM-DD hh:mm:ss A") : timeChronoSt;
    time += (data.end_time) ? " - " + moment(data.end_time).format("h:mm A)") : ")";
    var img_url = (data.cover !== undefined) ? data.cover.source : def_img;
    eventData.push([data.link,data.name,img_url,time,location,data.description,timeChronoSt,timeChronoEn,latlng]);
  }

  sourceRef.on("child_added", function(snap) {
    snap.forEach(function(datap){
      datap.forEach(parseClubEvents);
    });
    changeDisplay();
  });  

  postRef.on("child_added", function(snap){
      var data = snap.val();
      if(data.feed != null){
        data.feed.forEach(function(dataPair){
          if(dataPair.message === undefined || getTags(dataPair.message).length < 1) return;
           postData.push([dataPair.id,data.name, data.img_url, moment(dataPair.created_time).format('ddd, MMM D, YYYY'),
            dataPair.message, dataPair.full_picture]);
        });
      }
      postData.sort(function(a,b){
        return new Date(b[3]) - new Date(a[3]);
      })
      displayPost();
  });

  function changeDisplay(){
    $('#event_box').html("");
    eventData.sort(function(a,b){
      var da = (a[3].indexOf(') -') != -1) ? new Date(a[3]) : new Date(a[3].split(' - ')[0]);
      var db = (b[3].indexOf(') -') != -1) ? new Date(b[3]) : new Date(b[3].split(' - ')[0]);  
      return da - db;
    });
    for (var i = 1; i < eventData.length; i++) {
      if(eventData[i][1] == eventData[i-1][1] || new Date(eventData[i][6]) < new Date(today)){
        if(eventData[i-1][2] === def_img){
          eventData.splice(i-1,1);
        }else{
          eventData.splice(i,1);
        }
      }
    };
    if(eventData.length > 0 && new Date(eventData[0][6]) < new Date(today)){
      eventData.splice(0,1);
    }
    display();
  }

  function displayPost(){
    $('#post_box').html("");
    for(var xs = 0; xs < postData.length; xs++){
      $('#post_box').append("<div class=\"post-card\"><div class='header'><img class='card-avatar' src=\"" 
        + postData[xs][2] +"\" height='50' width='50'/><div class='post-title'>" 
        + postData[xs][1] + "</div><div class='post-date'>" + postData[xs][3] + "</div></div><div class='trunc'>"
        + "<img class='img-responsive' src=\"" + postData[xs][5] + "\" /><div class='post-message'>" + postData[xs][4] + "</div></div>");
    }
  }

  function display(){
    for(var z = 0; z < eventData.length; z++){
      var item = eventData[z];
      $('#event_box').append("<div class=\"row item\"><div class=\"col-sm-2\"><img class='img-responsive img-rounded min-size' src=\"" + item[2] + 
        "\"/><br></div><div class='col-sm-10'><a href='"+ item[0] +"' class='dark-title'><h4 class='nomargin'>" 
        + item[1] + "</h4></a><span class='addtocalendar atc-style-button-icon'><a class='atcb-link' tabindex='1'>"
        + "<img src='cal.png' width='22'></a><var class='atc_event'><var class='atc_date_start'>" + item[6] + "</var>" + 
        "<var class='atc_date_end'>" + item[7] + "</var><var class='atc_timezone'>America/New_York</var>" + 
        "<var class='atc_title'>" + item[1] + "</var><var class='atc_description'>" + item[5] + "</var>" + 
        "<var class='atc_location'>" + item[4] + "</var></var></span><em class='time'>" + item[3] 
        + "</em><br><span class='glyphicon glyphicon-map-marker' aria-hidden='true'/><span class='loc'>" 
        + item[4] + "</span><br><span class='glyphicon glyphicon-tags' aria-hidden='true'/><span class='tags'>" 
        + getTags(item[5]) + "</span><br><a href='#' onclick='$(this).parent().parent().next().next().toggle(); ($(this).text()[0]==\"V\") ?"
        + " $(this).text(\"Hide description\") : $(this).text(\"View description\");return false;' id='ref'>View Description</a></div></div><br>" + 
        "<div class='div'>" + item[5] + "</div><br><hr>");
    }
    $(".div").hide();
    addToCal();
  }

  function addToCal() {
    if (window.ifaddtocalendar == 1) { 
      $("#addToCal").remove();
    }
      window.ifaddtocalendar = 1;
        var d = document, s = d.createElement('script'), g = 'getElementsByTagName';
        s.type = 'text/javascript';s.charset = 'UTF-8';s.async = true;s.id= 'addToCal';
        s.src = ('https:' == window.location.protocol ? 'https' : 'http')+'://addtocalendar.com/atc/1.5/atc.min.js';
        var h = d[g]('body')[0];h.appendChild(s); 
  }
