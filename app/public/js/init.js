angular.bootstrap(document, ['infographicApp']);

$(window).on("resize", function() {
    //$('[data-equal-height]').make_children_equal_height(); // Removed library as dependency
});
$(window).trigger("resize");


