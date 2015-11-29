// JavaScript Document
var add_show_data=[];
$(document).ready(function(e) {

});
$(document).on( 'pageinit',function(event){
	
	//this function only works in pageinit
   $("#searchshows").keydown(function(event){
		if(event.which == 13){
			//pressed enter to search for shows	
			var tvshow = $("#searchshows").val();
			tvshow = encodeURIComponent(tvshow);
			search_tvmaze_shows(tvshow);
		}
	});
	
});

function page_to(page){
	console.log(page);
	
	if(page=="myshows"){
		myshows_setup();
	}
	
	$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+page, { transition: "slide" } );
}

function getepsfor(id){
	console.log("getting shows")
	console.log(id);
	
	page_to("ep_info");
	$("#show_ep_history").empty();
	
	$.getJSON( "http://api.tvmaze.com/shows/"+id+"/episodes", function( data ) {
	  var items = [];
	  db.transaction(function (tx) {	
	  tx.executeSql('DELETE FROM ep_list'); //clear contents
		  $.each( data, function( key, val ) {
			  if(val.image == null){
				  var img = "no_img.gif";
			  }else{
				   var img = val.image['medium'];
			  }
			  var name =val.name; var season = val.season; var epnum = val.number; var airdate = val.airdate; var summary = val.summary;
			  //items.push( name + " " + season + " " + epnum + " " + airdate + " " + img  + " " + summary);
			  summary = summary.replace(/["'-]/g, "");
			  name = name.replace(/["'-]/g, "");
			  summary = summary.replace(/(<([^>]+)>)/ig,"");
			  tx.executeSql('INSERT INTO ep_list (Name, Season, Epnum, Airdate, Img, Summary) VALUES ("'+name+'", "'+season+'", "'+epnum+'", "'+airdate+'", "'+img+'", "'+summary+'")');
		  });
		  
		  //open up transactions and use "select max(season) from ep_list" to get total season for drop down list
		tx.executeSql('select max(season) as ms from ep_list', [], function(tx, results){
			
			var max_seasons = results.rows.item(0);
			console.log("max seasons "+max_seasons.ms);
			
			$("#seasonSelect").empty();
			daySelect = document.getElementById('seasonSelect');
			
			var i = 1;
			for(i;i<=max_seasons.ms;i++){
				console.log(i);
				daySelect.options[daySelect.options.length] = new Option('SEASON '+i, 's'+i);
			}
			$("#seasonSelect").val('s'+max_seasons.ms).prop('selected', true).selectmenu('refresh','true');
			
			
			tx.executeSql('SELECT * FROM ep_list where Season = '+max_seasons.ms+' order by Epnum asc', [], function(tx, results){
			var len = results.rows.length, i;
			var content = " ";
			for(i=0;i<len;i++){	
				var show = results.rows.item(i);
				console.log(show.Name+" "+show.Season+" "+show.Epnum);
				
				
				var d = new Date(show.Airdate);
				var day_name = get_day(d.getDay());
				var month_name = get_month(d.getMonth());
				var year = d.getFullYear();
				var day = ordinal_suffix_of(d.getDate());
				var day_string = day_name + " " + day + " " + month_name + " " + year;
				
				
				if(show.Name.length>25){
					show.Name = show.Name.substr(0,25)+"...";
				}
				
				content = '<div class="history_wrap">'+
'            <div class="history_title">Ep '+show.Epnum+': '+show.Name+'</div>'+
'            <div class="history_info"><div class="history_img"><img src="'+show.Img+'" height="140" width="250" /><br/><span class="sml_txt">Aired: '+day_string+'</span></div><p>'+show.Summary+'</p></div></div>';
				
				$("#show_ep_history").append(content);
			}
			});
			
		});
		
		//**here have the drop down list use on click to get that season out. possibly move above code for content into reusable function
		  
		});
	 });
	
	
	
}

function search_tvmaze_shows(tvshow){
	console.log(tvshow);
	$.getJSON("http://api.wolfstudioapps.co.uk/apps/cloud_potato/mobile_webfiles/tvmaze_search_mobile.php?value="+tvshow)
	  .done(function( json ) {
		console.log( json);
		var content = "";
			$.each(json,function(key,val){
				console.log(val.id+" "+val.Name+" "+val.Time+" "+val.Day+" "+val.Premiered+" "+val.Runtime+" "+val.Summary+" "+val.Status);
				
				var summary_sanitised = val.Summary.replace(/["'-]/g, "");
				var name_sanitised = val.Name.replace(/["'-]/g, "");
				var show_arr = [val.id,name_sanitised,val.Time,val.Day,val.Premiered,val.Runtime,summary_sanitised,val.Status];
				var summary = val.Summary.substring(0,140);
				if(val.Summary.length>140){
					summary+="...";
				}
				$("#search_show_info").empty();
				content+='<div class="showlistbox">';
				content+='<div class="showlist_pointer"><img src="themes/images/icons-png/carat-r-white.png" height="20" width="20" /></div>';
				content+='<div class="showlist_heading"><a onClick=\'addshow("'+show_arr[0]+'","'+show_arr[1]+'","'+show_arr[2]+'","'+show_arr[3]+'","'+show_arr[4]+'","'+show_arr[5]+'","'+show_arr[6]+'","'+show_arr[7]+'")\' href="#popupCloseRight" data-rel="popup" data-position-to="window" data-transition="slideup">'+val.Name+'</a></div>';
				content+='<div class="showlist_info"><p class="whitenormal">'+summary+'</p></div>';
				content+='</div>';
				content+='<hr class="showlisthr" />';
			});
			$("#search_show_info").html(content);
	  })
	  .fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}

function deleteshow(){
	console.log("deleting show");
}
function addshow(id,Name,Time,Day,Premiered,Runtime,Summary,Status){
	//clear gobal array for new show
	$("#add_show_name_confirm").text("Add Show: "+Name+"?");
	add_show_data = [];
	add_show_data.push(id,Name,Premiered,Runtime,Status,Day,Time,Summary);
	//console.log("id:"+id+" Name:"+Name+" Time:"+Time+" Day:"+Day+" Premiered:"+Premiered+" Runtime:"+Runtime+" Summary:"+Summary);
}
function confirm_add(){
	//adding show to db
	//console.log(add_show_data[3]);
	db.transaction(function (tx) {	
			tx.executeSql('INSERT INTO myshows (id, Name, Premiered, Runtime, Status, Day, AirTime, Summary) VALUES ('+add_show_data[0]+', "'+add_show_data[1]+'", "'+add_show_data[2]+'", "'+add_show_data[3]+'", "'+add_show_data[4]+'", "'+add_show_data[5]+'", "'+add_show_data[6]+'", "'+add_show_data[7]+'")');
			
	});
	$.ajax({
	  method: "POST",
	  url: "http://api.wolfstudioapps.co.uk/apps/cloud_potato/mobile_webfiles/add_to_wolf.php",
	  data: { name: add_show_data[1], id: add_show_data[0], status: add_show_data[4] }
	}).done(function( msg ) {
  	//  alert( "Data Saved: " + msg );
  });
}
function add_notify(e){
	$(e).css("opacity",1);
	console.log("add to notify");
}

function myshows_setup(){
	$("#myshowslist").empty();
	db.transaction(function (tx) {	
			tx.executeSql('SELECT * FROM myshows order by Name asc', [], function(tx, results){
			var len = results.rows.length, i;
			var content = " ";
			for(i=0;i<len;i++){	
				var show = results.rows.item(i);
				
				content ="<li> "+
            		"<div class='showlistbox'>"+
                    	"<div class='showlist_pointer'><img onClick='getepsfor("+show.id+")' src='themes/images/icons-png/carat-r-white.png' width='20' height='20' /></div>"+
                        "<div class='showlist_heading'>"+show.Name+"</div>"+
                        "<div class='showlist_info'><p>Show about cia stan and nerd steve and crazy alien rodger steve and crazy alien rodger steve and crazy alien rodger</p></div>"+
            		"</div>"+
            	"</li>"+
                 "<hr class='showlisthr' />";
				 
				 $("#myshowslist").append(content);
				
				
			}
			});
			$("#myshowslist").listview("refresh");
			
	});
}

function get_day(day){
	switch(day){
	case 0:
        day = "Sunday";
        break;
    case 1:
        day = "Monday";
        break;
    case 2:
        day = "Tuesday";
        break;
    case 3:
        day = "Wednesday";
        break;
    case 4:
        day = "Thursday";
        break;
    case 5:
        day = "Friday";
        break;
    case 6:
        day = "Saturday";
        break;
	}
	return day;
}
function get_month(month){
	switch(month){
	case 0:
        month = "January";
        break;
    case 1:
        month = "February";
        break;
    case 2:
        month = "March";
        break;
    case 3:
        month = "April";
        break;
    case 4:
        month = "May";
        break;
    case 5:
        month = "June";
        break;
    case 6:
        month = "July";
        break;
	case 7:
        month = "August";
        break;
	case 8:
        month = "September";
        break;
	case 9:
        month = "October";
        break;
	case 10:
        month = "November";
        break;
	case 11:
        month = "December";
        break;
	}
	return month;
}
function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}