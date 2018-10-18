$(function() {


  $('#calendar').fullCalendar({
    editable: true,
    eventLimit: true,
    themeSystem:"bootstrap3",bootstrapGlyphicons:!1,
    eventClick: function(calEvent, jsEvent, view) {
    $('#viewDay').modal('show')



    // change the border color just for fun
    $(this).css('border-color', 'red');

  }
  })

});
