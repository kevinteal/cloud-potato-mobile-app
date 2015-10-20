// JavaScript Document
$(document).ready(function(e) {
    
});

function page_to(page){
	console.log(page);
	$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+page, { transition: "slide" } );
}