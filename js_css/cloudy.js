// JavaScript Document
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
			$.each(json,function(key,val){
				console.log(val.id+" "+val.Name+" "+val.Time+" "+val.Day+" "+val.Premiered+" "+val.Runtime+" "+val.Summary);
				//*** GOT TO HERE, NEED TO CREATE DB TO STORE USER SHOWS, ALSO NEED TO CLEAR INFO BELOW SEARCH AND ADD THIS DATA
			});
	  })
	  .fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}

function deleteshow(){
	console.log("deleting show");
}
function addshow(){
	console.log("add show");
}
function add_notify(e){
	$(e).css("opacity",1);
	console.log("add to notify");
}