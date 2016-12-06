<<<<<<< HEAD
/* home.js

Custom js to handle validation and submit of the new meeting dialog

 */

$(function () {
    $("#saveButton").on('click', function () {
        if($('form').serializeArray()[0].value != '' && $('form').serializeArray()[1].value != ''){
            $('form').submit();
            $('#newMeetingModal').modal('hide');
            $('#errorMessage').text('');
        }
        else {
            $('#errorMessage').text("Fyll i alla fält");
        }
    });
=======
/* home.js

Custom js to handle validation and submit of the new meeting dialog

 */

$(function () {
    $("#saveButton").on('click', function () {
        if($('form').serializeArray()[0].value != '' && $('form').serializeArray()[1].value != ''){
            $('form').submit();
            $('#newMeetingModal').modal('hide');
            $('#errorMessage').text('');
        }
        else {
            $('#errorMessage').text("Fyll i alla fält");
        }
    });
>>>>>>> 9a216b3ac5e07bbfd147b1fe81da39cbc55f7e93
});