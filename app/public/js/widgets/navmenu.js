$(function() {
    $(".navmenu").find("li a").each(function() {
        if( window.location.pathname.match($(this).attr("href")) ) {
            $(this).parent("li").addClass("selected");
        }
    });
});
