$(function setAuthorName() {

    $('.authorNameForm').on('submit', function (e) {
        e.preventDefault();
        var authorName = $('.authorNameFormField').val();
        if (!authorName) {
            return;
        } else {
            var expiresDate = new Date(new Date().getTime() + 60 * 60 * 24 * 365 * 1000);
            document.cookie = 'author=' + authorName + '; expires=' + expiresDate;
            window.location = $('.button-primary').attr('href');
        }
    });

    $('.button-primary').click(function (e) {
        e.preventDefault();
        $('.authorNameForm').trigger('submit');
    });
});
