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
  $('document').ready(checkIn())

  //rewrite this as a function that calls calendars --> and calendars calls it back at the end.
function makeToday(){
    let today = new Date();
    if (window.localStorage.getItem('today')!= today.toDateString()) {
        console.log('Just logged in, or new day');
        calendars(today).then(()=>{
            let appointments = JSON.parse(window.localStorage.getItem('todayCalendar'))
            
            let l = appointments.value.length;
            
            for (let i=0; i<l; i++){
                let calendly = /calendly.com/i;
                let appointment = appointments.value[i];
                
                let content = appointment.body.content;
                let search = content.search(calendly)
                if ( search > -1) {
                    let email = appointment.attendees[0].emailAddress.address;
                    if (!window.localStorage.getItem(email)){
                        searchSF(email).then(function() {
                        let profiles=JSON.parse(window.localStorage.getItem(email))
                        appointment.profiles = profiles
                        $('body').append(makeFrame(appointment))
                        })
                    }
                    else {
                        let profiles=JSON.parse(window.localStorage.getItem(email))
                        appointment.profiles = profiles
                        
                        $('body').append(makeFrame(appointment))
                    }
                };
            }
                
        })
    }
}



