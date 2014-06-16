(function($) {
    // Append caption after pictures
    $('.entry-content img').each(function(i) {
        var alt = this.alt;
        var parent = $(this).parent();

        if (alt != '') {
            var element = $(this);
            if (parent.is('a')) {
                element = parent;
            }
            element.after('<span class="caption"></span>');
        }

        if (!parent.is('a')) {
            $(this).wrap('<a href="' + this.src + '" title="' + alt + '" />');
        }
    });

    $('a[data-event-label]').mousedown(function() {

        var eventCategory = $(this).attr("data-event-category");

        if (!eventCategory) {
            eventCategory = 'Uncategorized';
        }

        ga('send', 'event', eventCategory, 'click', $(this).attr('data-event-label'), 1);
    });

    $('a').each(function() {
        var a = new RegExp('/' + window.location.host + '/');
        if (!a.test(this.href)) {
            $(this).click(function(event) {
                event.preventDefault();
                event.stopPropagation();
                window.open(this.href, '_blank');
            });
        }
    });

})(jQuery);
