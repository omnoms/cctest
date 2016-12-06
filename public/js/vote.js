/* vote.js
Custom js to handle validation and submit of votes

 */

$(function () {
    $("#saveButton").on('click', function () {

        if(Number($('form').serializeArray()[0].value) != '' && $('form').serializeArray()[1].value != ''){
            $('form').submit();
            $('#errorMessage').text('');
        }
        else {
            $('#errorMessage').text("Ange betyg och kommentar!");
        }
    });
});