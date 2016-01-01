  var def_img = "http://previews.123rf.com/images/carmenbobo/carmenbobo1405/carmenbobo140500482/28389907-Stamp-with-text-free-food-inside-vector-illustration-Stock-Vector.jpg";
  var myFirebaseRef = new Firebase("https://crackling-heat-4631.firebaseio.com/events");
  var myFBFirebaseRef = new Firebase("https://crackling-heat-4631.firebaseio.com/fb");
  var ruRSSRef = new Firebase("https://crackling-heat-4631.firebaseio.com/rss");
  var clRSSRef = new Firebase("https://crackling-heat-4631.firebaseio.com/collegiatelinkrss");
  var timeParser = new chrono.Chrono();
  var today = moment().format("YYYY-MM-DD");
  var eventData = [];
  var food_tags = [ "appetizer", "snack", "pizza", "lunch", "dinner", "breakfast", "meal", "candy", 
            "drinks", "punch", "serving", "pie",  "cake", "soda", "chicken", "wings", "burger",
            "burrito", "bagel", "poporn", " ice ", "cream", "donut", "beer", "free food", 
            "subs", "hoagie", "sandwich", "turkey", "supper", "brunch", "takeout", "refreshment",
            "beverage", "cookie", "brownie", "chips", "soup", "grill", "bbq", "barbecue", "tacos"
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

  myFirebaseRef.on("child_added", function(snapshot) {
    var data = snapshot.val();
    if(getTags(data.body).length < 1) return;
    var time = timeParser.parseDate(data.body,moment(data.created));
    if(time == null || moment(time).format("YYYY-MM-DD") < today) return;
    var timeChronoSt = moment(time).format("YYYY-MM-DD hh:mm:ss A");
    time = moment(time).format("dddd, MMM D (h:mm A)");
    eventData.push([data.created,data.subject,def_img,time,"Check description",data.body,timeChronoSt,timeChronoSt]);
    changeDisplay();
  });

  myFBFirebaseRef.on("child_added", function(snap) {
    snap.forEach(function(dataPair) {
      var data = dataPair.val();
      if(getTags(data.description).length > 1) {
        var location = (data.place === undefined || data.place.location === undefined) ? " " : data.place.location.street + ", " + data.place.location.city + " " + data.place.location.state;
        var time = moment(data.start_time).format("dddd, MMM D (h:mm A");
        var timeChronoSt = moment(data.start_time).format("YYYY-MM-DD hh:mm:ss A");
        var timeChronoEn = (data.end_time) ? moment(data.end_time).format("YYYY-MM-DD hh:mm:ss A") : timeChronoSt;
        time += (data.end_time) ? " - " + moment(data.end_time).format("h:mm A)") : ")";
        var img_url = data.picture.data.url;
        eventData.push([data.id,data.name,img_url,time,location,data.description,timeChronoSt,timeChronoEn]);
        changeDisplay();
      }
    });
  });

  ruRSSRef.on("child_added", function(snap) {
    var data = snap.val();
    if(getTags(data.description).length < 1) return;
    var time = moment(data.startTime,"YYYY-MM-DD hh:mm:ss ddd").format("dddd, MMMM D, YYYY (h:mm A")
      + moment(data.endTime,"YYYY-MM-DD hh:mm:ss ddd").format(" - h:mm A)");
    var timeChronoSt = moment(data.startTime,"YYYY-MM-DD hh:mm:ss ddd").format("YYYY-MM-DD hh:mm:ss A");
    var timeChronoEn = moment(data.endTime,"YYYY-MM-DD hh:mm:ss ddd").format("YYYY-MM-DD hh:mm:ss A");
    var location = data.location + ", " + data.campus;
    eventData.push([snap.key(),data.title,def_img,time,location,data.description,timeChronoSt,timeChronoEn]); 
    changeDisplay();
  });

  clRSSRef.on("child_added", function(snap) {
    var data = snap.val();
    if(getTags(data.description).length < 1) return;
    var event_title = data.title;
    if (event_title == null) event_title = "No Title";
    var img_url = def_img;
    var descr_text = $('<div/>').html(data.description).text();
    var time = $.parseHTML(descr_text)[0].innerText;
    var timeChronoSt = today;
    var timeChronoEn = today;
    if(time.indexOf(") -") !== -1){
        var t_split = time.split(') - ');
        timeChronoSt = moment(t_split[0],"dddd, MMMM D, YYYY (h:mm A").format("YYYY-MM-DD hh:mm:ss A");
        timeChronoEn = moment(t_split[1],"dddd, MMMM D, YYYY (h:mm A)").format("YYYY-MM-DD hh:mm:ss A");
        time = moment(t_split[0],"dddd, MMMM D, YYYY (h:mm A").format("dddd, MMM D (h:mm A)") + 
          moment(t_split[1],"dddd, MMMM D, YYYY (h:mm A)").format(" - MMM D (h:mm A)");
    }else if(time.indexOf("M -")){
        var t_split = time.split(' - ');
        timeChronoSt = moment(t_split[0],"dddd, MMMM D, YYYY (h:mm A").format("YYYY-MM-DD hh:mm:ss A");
        timeChronoEn = moment(t_split[1],"h:mm A)").format("YYYY-MM-DD hh:mm:ss A");
        time = moment(t_split[0],"dddd, MMMM D, YYYY (h:mm A").format("dddd, MMM D (h:mm A") +
          moment(t_split[1],"h:mm A)").format(" - h:mm A)");
    }else{
        time = moment(time,"dddd, MMMM D, YYYY (h:mm A)").format("dddd, MMM D (h:mm A)");
        timeChronoSt = moment(time,"dddd, MMMM D, YYYY (h:mm A)").format("YYYY-MM-DD hh:mm:ss A");
        timeChronoEn = timeChronoSt;
    }
    var location = $.parseHTML(descr_text)[2].innerText.replace("Location: ","");
    var description = $.parseHTML(descr_text)[4].innerText;
    eventData.push([snap.key(),event_title,img_url,time,location,description,timeChronoSt,timeChronoEn]); 
    changeDisplay();
  });

  function changeDisplay(){
    $('#event_box').html("");
    eventData.sort(function(a,b){
      var da = (a[3].indexOf(') -') != -1) ? new Date(a[3]) : new Date(a[3].split(' - ')[0]);
      var db = (b[3].indexOf(') -') != -1) ? new Date(b[3]) : new Date(b[3].split(' - ')[0]);      
      return da - db;
    });
    for (var i = 1; i < eventData.length; i++) {
      if(eventData[i][1] == eventData[i-1][1]){
        eventData.splice(i,1);
      }
    };
    display();
  }

  function display(){
    for(var z = 0; z < eventData.length; z++){
      var item = eventData[z];
      $('#event_box').append("<div class=\"row item\"><div class=\"col-sm-2\"><img class='img-responsive img-rounded' src=\"" + item[2] + 
        "\" height='80' width='190'/><br></div><div class='col-sm-10'><h4 class='nomargin'>" + item[1] + 
        "</h4><span class='addtocalendar atc-style-button-icon'><a class='atcb-link' tabindex='1'>"
        + "<img src='https://addtocalendar.com/static/cal-icon/cal-bw-01.png' width='22'>"
        + "</a><var class='atc_event'><var class='atc_date_start'>" + item[6] + "</var>" + 
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
  }


