  var accessToken = "CAANjBmdVSEcBACyfLUuGiZBkZBZCCI1wWub5T17ZCtzdyKLXV8QU4kA3a9JCDtfDxz3LmQZCRZA0llSpg3l5JthypVRBbwJSeMlUmyZCTCZAbT4SZBn6HDUUrB4omEQdNoYxxA1u6ql1ZBKCiwA5AGBMhaeJVkCaNyfZBfHSTweVtdQWFXZBLM2xDhrXErssZAZBTQJmWCQ8sfc8uZAzwZDZD";
  var def_img = "http://previews.123rf.com/images/carmenbobo/carmenbobo1405/carmenbobo140500482/28389907-Stamp-with-text-free-food-inside-vector-illustration-Stock-Vector.jpg";
  var today = moment().format("YYYY-MM-DD");
  var eventData = [];
  var param = "/events?fields=name,description,start_time,end_time,place,picture.type(large){url}&since=" + today;
  var fb_urls = ['/RUPAPresents','/RUOCSA','/ruaacc','/youth.eagleton','/Cookiesncrepesnb','/rutgersmad',
            '/Rutgers.psa','/ruveg','/RUSURErutgers','/me','/oneatrutgers'];
  var food_tags = [ "appetizer", "snack", "pizza", "lunch", "dinner", "breakfast", "meal", "candy", 
            "drinks","punch", "serving", "pie",  "cake", "soda", "chicken", "wings", "burger",
            "burrito", "bagel", "poporn", " ice ", "cream", "donut", "beer", "free food", 
            "subs", "hoagie", "sandwich", "turkey", "supper", "brunch", "takeout", "refreshment",
            "beverage", "cookie", "brownie", "chips", "soup", "grill", "bbq", "barbecue"
        ];

  FB.init({
          appId      : '953304084727879',
          xfbml      : true,
          version    : 'v2.4'
  });

  /*FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
        accessToken = response.authResponse.accessToken;
    }else if (response.status !== 'not_authorized') {
      FB.login(function(response) {
        if (response.authResponse) {
          accessToken = response.authResponse.accessToken;
        }
      },true, {scope: 'user_events'});
   } 
 });*/

  for (var i = 0; i < fb_urls.length; i++) {
    FB.api(fb_urls[i]+param,{access_token: accessToken }, function(response) {
      loopOverResponse(response.data);
    });
  };

  function getTags(str){
    var ret = "";
    for(var i = 0; i < food_tags.length; i++){
      if(str.toLowerCase().indexOf(food_tags[i]) !== -1){
        ret += "#" + food_tags[i] + " ";
      }
    }
    return ret;
  }

  function loopOverResponse(data){
    if(data === undefined) return;
    for (var i = 0; i < data.length; i++){
      if(getTags(data[i].description).length < 1) continue;
      var location = (data[i].place === undefined || data[i].place.location === undefined) ? " " : data[i].place.location.street + ", " + data[i].place.location.city + " " + data[i].place.location.state;
      var time = moment(data[i].start_time).format("dddd, MMM D (h:mm A");
      time += (data[i].end_time) ? " - " + moment(data[i].end_time).format("h:mm A)") : ")";
      var img_url = data[i].picture.data.url;
      eventData.push([data[i].id.toString(),data[i].name,img_url,time,location,data[i].description]);
    }
  }
  // get the upcoming event link and using that link find the event info.
  function makeAjaxReq(org_url,callback){
  $.ajax({
      type: 'GET',
      url: org_url,
      dataType: 'html',
      success: callback
    });
  }


  function findEvents(data){
    var itemList = $(data).find('item');
    for(var i = 0; i < itemList.length; i++){
      var item = $(itemList[i]);
      var event_title = item.contents()[3].nodeValue;
      if (event_title == null) event_title = "No Title";
      var descr_text = item.find('description').text();
      if(getTags(descr_text).length < 1) continue;
      var img_url = item.find('enclosure').attr('url');
      img_url = (img_url) ? img_url : def_img;
      var time = $.parseHTML(descr_text)[0].innerText;
      if(time.indexOf(") -") !== -1){
        var t_split = time.split(') - ');
        time = moment(t_split[0],"dddd, MMMM D, YYYY (h:mm A").format("dddd, MMM D (h:mm A)") + 
          moment(t_split[1],"dddd, MMMM D, YYYY (h:mm A)").format(" - MMM D (h:mm A)");
      }else if(time.indexOf("M -")){
        var t_split = time.split(' - ');
        time = moment(t_split[0],"dddd, MMMM D, YYYY (h:mm A").format("dddd, MMM D (h:mm A") +
          moment(t_split[1],"h:mm A)").format(" - h:mm A)");
      }else{
        time = moment(time,"dddd, MMMM D, YYYY (h:mm A)").format("dddd, MMM D (h:mm A)");
      }
      var location = $.parseHTML(descr_text)[2].innerText.replace("Location: ","");
      var description = $.parseHTML(descr_text)[4].innerText;
      var eventItem = ["0",event_title,img_url,time,location,description];
      eventData.push(eventItem);
    }
    changeURL();
  }

  function changeURL(){
    var temp = [];
    $.when.apply($, temp).then(function() {
             var xg=arguments; // The array of resolved objects as a pseudo-array
    
             for (var i = xg.length - 1; i >= 0; i--) {
               eventData.push(xg[i]);
             };  
    })    
    eventData.sort(function(a,b){
      var da = (a[3].indexOf(') -') != -1) ? new Date(a[3]) : new Date(a[3].split(' - ')[0]);
      var db = (b[3].indexOf(') -') != -1) ? new Date(b[3]) : new Date(b[3].split(' - ')[0]);      
      return da - db;
    });
    display();
  }

  function display(){
    for(var z = 0; z < eventData.length; z++){
      var item = eventData[z];
      $('#event_box').append("<div class=\"row item\"><div class=\"col-sm-2\"><img class='img-responsive img-rounded' src=\"" + item[2] + 
        "\" height='80' width='190'/><br></div><div class='col-sm-10'><h4 class='nomargin'>" + item[1] + 
        "</h4><span class='glyphicon glyphicon-calendar' aria-hidden='true'/><em class='time'>" + item[3] 
        + "</em><br><span class='glyphicon glyphicon-map-marker' aria-hidden='true'/><span class='loc'>" 
        + item[4] + "</span><br><span class='glyphicon glyphicon-tags' aria-hidden='true'/><span class='tags'>" 
        + getTags(item[5]) + "</span><br><a href='#' onclick='$(this).parent().parent().next().next().toggle(); ($(this).text()[0]==\"V\") ?"
        + " $(this).text(\"Hide description\") : $(this).text(\"View description\");return false;' id='ref'>View Description</a></div></div><br>" + 
        "<div class='div'>" + item[5] + "</div><br><hr>");
    }
    $(".div").hide();
  }

  makeAjaxReq("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%20%3D%20%22https%3A%2F%2Frutgers.collegiatelink.net%2FEventRss%2FEventsRss%22%20and%20xpath%3D%22%2F%2Fitem%22&diagnostics=true",findEvents);