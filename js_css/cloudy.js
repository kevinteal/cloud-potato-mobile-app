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