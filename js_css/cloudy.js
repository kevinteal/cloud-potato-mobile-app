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
	$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+page, { transition: "slide" } );
}

function getepsfor(){
	console.log("getting shows")
	page_to("ep_info");
	$("#seasonSelect").empty();
    daySelect = document.getElementById('seasonSelect');
 	daySelect.options[daySelect.options.length] = new Option('SEASON 1', 'Value1');
	daySelect.options[daySelect.options.length] = new Option('SEASON 3', 'Value0');
	daySelect.options[daySelect.options.length] = new Option('SEASON 4', 'Value2');
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
			//**UP TO HERE, NOW NEED TO SHOW MYSHOWS LIST ON PAGE, ALSO DELETE FROM DB
	});
}
function add_notify(e){
	$(e).css("opacity",1);
	console.log("add to notify");
}