$("#return").text('Jquery!')
$('#logout').hide()
$('#logout').click(logout)
$('#login').click(syncAccount)
$('#getStuff').click(calendars)
$('#loading').show()
$('#buttons').hide()
console.log('controller in business')

function loadingView(){
    $('#loading').toggle();
    $('#buttons').toggle()
  }


