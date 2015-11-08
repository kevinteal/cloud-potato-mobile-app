// JavaScript Document
$(document).ready(function(e) {
	
	
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