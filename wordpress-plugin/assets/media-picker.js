/**
 * Pixza Site Manager – Media Picker
 * Handles WordPress media library integration for the Site Images admin page.
 */
(function ($) {
    'use strict';

    // Open WP media frame when "Change Image" is clicked.
    $(document).on('click', '.pixza-media-btn', function () {
        var targetId = $(this).data('target');

        if (typeof wp === 'undefined' || !wp.media) {
            alert('WordPress media library is not available.');
            return;
        }

        var frame = wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: false,
            library: { type: 'image' }
        });

        frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            var $input = $('#' + targetId);
            $input.val(attachment.url);

            // Update preview thumbnail.
            var $card = $input.closest('.pixza-image-card');
            var $img  = $card.find('img');
            if ($img.length) {
                $img.attr('src', attachment.url).show();
            } else {
                var $placeholder = $card.find('div').first();
                $placeholder.html(
                    '<img src="' + attachment.url + '" ' +
                    'style="width:100%;height:80px;object-fit:cover;" />'
                );
            }
        });

        frame.open();
    });

    // Reset field to default (empty) value.
    $(document).on('click', '.pixza-reset-btn', function () {
        var targetId   = $(this).data('target');
        var defaultVal = $(this).data('default') || '';
        $('#' + targetId).val(defaultVal);

        // Clear preview.
        var $card = $('#' + targetId).closest('.pixza-image-card');
        $card.find('img').attr('src', '').hide();
    });

}(jQuery));
