// JavaScript Document
$(document).ready(function(e) {
	
    
});

function page_to(page){
	console.log(page);
	$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+page, { transition: "slide" } );
}

function getepsfor(){
	console.log("getting shows");
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