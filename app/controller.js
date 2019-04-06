resetMode=false;
const wordstreamLoginURI ='https://ppc.wordstream.com/admin/product_login/'
const googleURI = 'https://ads.google.com/aw/overview?__e='


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
    let today = new Date('2019-04-08T00:00:00');
    if (window.localStorage.getItem('today')!= today.toDateString()) {
        console.log('Just logged in, or new day');
        calendars(today)
        .then(makeCards())
    }
    else {
        makeCards();
    }
}



function makeCards() {
    let appointments = JSON.parse(window.localStorage.getItem('todayCalendar'))
    
    let l = appointments.value.length;
    
    for (let i=0; i<l; i++){
        let calendly = /calendly.com/i;
        let appointment = appointments.value[i];
        
        let content = appointment.body.content;
        let search = content.search(calendly)
        if ( search > -1) {
           
            let email = appointment.attendees[0].emailAddress.address;
            let name= appointment.attendees[0].emailAddress.name
            if (email == "zkrowiak@wordstream.com") { //must be revised later to reflect current user!!
                email =appointment.attendees[1].emailAddress.address
                 name = appointment.attendees[1].emailAddress.name
            }
            if (resetMode){window.localStorage.removeItem(email)} //to reset local storage while developing
            if (!window.localStorage.getItem(email)){
                searchSF(email).then(function() {
                let client =JSON.parse(window.localStorage.getItem(email))
                client.email = email;
                client.name = name;
                appointment.client = client;
                
                $('body').append(makeFrame(appointment))
                }).catch((err)=>{
                    
                    let client = {}
                    client.email = email;
                    client.name = name
                    appointment.client = client;
                    $('body').append(makeFrame(appointment))
                    console.log(err)
                })
            }
            else {
                //until client objects are consistent
                
                    let client =JSON.parse(window.localStorage.getItem(email))
                   
                    
                    client.email = email;
                    client.name = name
                    appointment.client = client;
                    $('body').append(makeFrame(appointment))
            
                
                /*let client=JSON.parse(window.localStorage.getItem(email))
                appointment.profiles = client.profiles
                appointment.company = client.company;
                $('body').append(makeFrame(appointment))*/
            }
        };
    }
        
}

