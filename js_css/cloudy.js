// JavaScript Document
var add_show_data=[];
$(document).ready(function(e) {
	
	
	
$("#seasonSelect").on('change', function() {
  var season = this.value;
  season = season.substring(1);
  set_ep_list(season);
});



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
	//console.log(page);
	
	if(page=="myshows"){
		myshows_setup();
	}
	
	if(page=="recently_aired"){
		recently_aired_setup();
	}
	
	
	
	$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+page, { transition: "slide" } );
}

function getepsfor(id){
	console.log("getting shows")
	console.log(id);
	
	page_to("ep_info");
	$("#show_ep_history").empty();
	
	
	
	db.transaction(function (tx) {	
		tx.executeSql('SELECT Name FROM myshows Where id='+id+' ', [], function (tx, results) {
			  
			  var show_name = results.rows.item(0).Name
			  document.getElementById("ep_info_head").innerHTML=show_name.substr(0,20)+"...";
			});
	});
	
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
			  //encodeURI(summary)
			  //summary = summary;
			  //name = name;
			  summary = summary.replace(/(<([^>]+)>)/ig,"");
			  name = name.replace(/(<([^>]+)>)/ig,"");
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
			set_ep_list(max_seasons.ms); //set up the page grab the eps to output
		});
			
			
		
		  
		});
	 });
	
	
	
}


function set_ep_list(season){
	$("#show_ep_history").empty(); //empty ep list
	db.transaction(function (tx) {
	tx.executeSql('SELECT * FROM ep_list where Season = '+season+' order by Epnum asc', [], function(tx, results){
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
				//decodeURI(show.Name)
				//decodeURI(show.Summary)
				content = '<div class="history_wrap">'+
'            <div class="history_title">Ep '+show.Epnum+': '+show.Name+'</div>'+
'            <div class="history_info"><div class="history_img"><img src="'+show.Img+'" height="140" width="250" /><br/><span class="sml_txt">Aired: '+day_string+'</span></div><p>'+show.Summary+'</p></div></div>';
				
				$("#show_ep_history").append(content);
			}
			});
	});
	//** just moved this code to reusable function and have drop down change the season. Tried to santize input but hard to send in html function output. also could use show img on show search, would need to alter db to inculd img. or simpler just have none img placeholder
}


function search_tvmaze_shows(tvshow){
	console.log(tvshow);
	$.getJSON("http://api.wolfstudioapps16.co.uk/apps/cloud_potato/mobile_webfiles/tvmaze_search_mobile.php?value="+tvshow)
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

function delete_shows_opt(){	
	var x = document.getElementsByClassName("myshowitem");
	
	//if has class icon-check, change functions and img back to carat and go to eps - user done deleting.
	//if has class icon-potbin, change functions to delete 
	
	//check opt for click
	
	var opt = 0; //set to delete. //0 - delete. 1 - gotoeps
	
	if($("#myshowsdelete").hasClass('ui-icon-check')){
		//done deleting
		opt=1;
		$("#myshowsdelete").addClass('ui-icon-potbin').removeClass('ui-icon-check');
	}else{
		//start deleting
		opt=0;
		$("#myshowsdelete").addClass('ui-icon-check').removeClass('ui-icon-potbin');
	}
	
	var i=0;
	for (i; i < x.length; i++) {
		
		if(opt==0){
			document.getElementById(x[i].id).src="themes/images/icons-png/delete-white.png"; 		
			document.getElementById(x[i].id).onclick = function () {
				var sname = $(this).data("sname");
				$("#del_confirm").text("Delete Show: "+sname+"?");
				$("#popupConDel").popup("open");
				
				var showid = this.id;
				showid=showid.substr(1,showid.length);
				var parent = $("#"+this.id).parent().parent();
				//console.log(parent);
				
				document.getElementById("delconid").onclick = function(){
					confirm_del(showid,parent);
				}
				
		  		return false; // <-- to suppress the default link behaviour
		};
		}else if(opt==1){
			document.getElementById(x[i].id).src="themes/images/icons-png/carat-r-white.png"; 		
			document.getElementById(x[i].id).onclick = function () {
				var id = this.id;
				id=id.substr(1,id.length);
		 	 	getepsfor(id);
		  		return false; // <-- to suppress the default link behaviour
		};			
		}

	}
}

function confirm_del(id,parent){
	//*****here just sent over id from above function
	console.log("deleting show "+id);
	$(parent).remove();
	db.transaction(function (tx) {	
			tx.executeSql('DELETE FROM myshows WHERE id='+id+' ');
			
	});
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
	  url: "http://api.wolfstudioapps16.co.uk/apps/cloud_potato/mobile_webfiles/add_to_wolf.php",
	  data: { name: add_show_data[1], id: add_show_data[0], status: add_show_data[4] }
	}).done(function( msg ) {
  	  alert( "Data Saved: " + msg );
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
				
				var summary = decodeURI(show.Summary);
				var s_summary = summary.substring(0,140);
				if(summary.length>140){
					s_summary+="...";
				}
				content ="<li> "+
            		"<div class='showlistbox'>"+
                    	"<div class='showlist_pointer'><img class='myshowitem' id='i"+show.id+"' data-sname='"+decodeURI(show.Name)+"' onClick='getepsfor("+show.id+")' src='themes/images/icons-png/carat-r-white.png' width='20' height='20' /></div>"+
                        "<div class='showlist_heading'>"+decodeURI(show.Name)+"</div>"+
                        "<div class='showlist_info'><p>"+s_summary+"</p></div>"+
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

function recently_aired_setup(){
	console.log("take id of users shows, send them to the wolf server and pull back episodes which aired this week. make a check on 'searched' if show not searched then search it.\n also make automatic script that searches unsearched shows every half hour. if it finds ep that aired in last 7 days add to recently aired shows, if finds one for next 7 days add to upcoming. also make sure that when user adds show the id is sent to the wolf server so it can be searched");
}
