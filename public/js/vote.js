<<<<<<< HEAD
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
=======
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
>>>>>>> 9a216b3ac5e07bbfd147b1fe81da39cbc55f7e93
});