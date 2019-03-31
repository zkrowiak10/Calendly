$("#return").text('Jquery!')
$('#logout').hide()
$('#logout').click(logout)
$('#login').click(syncAccount)
$('#getStuff').click(calendars)
$('#loading').show()
$('#buttons').hide()
$('#today').click(makeToday)
console.log('controller in business')

function loadingView(){
    $('#loading').toggle();
    $('#buttons').toggle()
  }

  //rewrite this as a function that calls calendars --> and calendars calls it back at the end.
function makeToday(){
    let today = new Date();
    if (window.localStorage.getItem('today')!= today.toDateString()) {
        console.log('Just logged in, or new day');
        calendars(today);
    }
}


