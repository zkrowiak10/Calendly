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
$('#today').click(()=>{
    $('#calendar').children().remove();
    save('today',"")
    makeToday()})
$('document').ready(checkIn())
$('document').ready(makePinned())
$('#pinIt').click(makePinningDialogue)


function loadingView(){
    $('#loading').toggle();
    $('#buttons').toggle()
  }
  

  //rewrite this as a function that calls calendars --> and calendars calls it back at the end.
function makeToday(){
    let today = new Date();
    today.setHours(0,0,0,0)
    checkSF()
    if (window.localStorage.getItem('today')!= today.toDateString()) {
        //console.log('Just logged in, or new day');
        calendars(today)
        .then(()=> {
            makeCards()
            today = new Date(); //need to reset this value as the calendars function changes the day to get tomorrow's date
            today.setHours(0,0,0,0)
            //console.log(today.toDateString())
            window.localStorage.setItem('today',today.toDateString())
        })
    }
    else {
        makeCards();
    }
}



async function makeCards() {
    let appointments = JSON.parse(window.localStorage.getItem('todayCalendar'))
    let l = appointments.value.length; 
    
    //check that salesforce is logged in, halt function & offer SF redirect if not
    //
    //console.log('status',status)

    for (let i=0; i<l; i++){
        //find all calendly made appointemnts
        let calendly = /calendly.com/i;
        let appointment = appointments.value[i];
        let content = appointment.body.content;
        let search = content.search(calendly) 
        if ( search > -1) {
            
            //get first client that is not me (current user later)
            let email = appointment.attendees[0].emailAddress.address;
            let name= appointment.attendees[0].emailAddress.name
            if (email == open('me').email) { //must be revised later to reflect current user!!
                email =appointment.attendees[1].emailAddress.address
                name = appointment.attendees[1].emailAddress.name
            }

            if (resetMode){window.localStorage.removeItem(email)} //to reset local storage while developing
            
            if (!window.localStorage.getItem(email)){
                //checkSF only if client info is not stored.
                //let status = await checkSF();
                //console.log('status in frame', status)
                //if(status){loginSF(); return}
                
                searchSF(email).then(function(resolve) {
                //console.log('resolve', resolve)
                if(!resolve){let errorOccured=true} 
                let client =JSON.parse(window.localStorage.getItem(email))
                client.email = email;
                client.name = name;
                appointment.client = client;
                
                $('#calendar').append(makeFrame(appointment))
                }).catch((err)=>{
                    
                    let client = {}
                    client.email = email;
                    client.name = name
                    appointment.client = client;
                    $('#calendar').append(makeFrame(appointment))
                    loginSF()
                    return
                })
            }
            else {
                //until client objects are consistent
                
                    let client =JSON.parse(window.localStorage.getItem(email))
                    client.email = email;
                    client.name = name
                    appointment.client = client;
                    $('#calendar').append(makeFrame(appointment))
            

                
                /*let client=JSON.parse(window.localStorage.getItem(email))
                appointment.profiles = client.profiles
                appointment.company = client.company;
                $('body').append(makeFrame(appointment))*/
            }
        };
    }
        
}

function loginSF(){
    let confirm = window.confirm("You are not logged into salesforce. Go to Salesforce then come back to extension")
    
    if (confirm){
        //console.log('confirmed')
        chrome.tabs.create({url:"https://wordstream.my.salesforce.com/"})
    }
}

function makePinned(){
    let pinned = window.localStorage.getItem('pinnedClients')
    if (pinned) {
        //console.log('pinned',pinned)
        pinned = JSON.parse(pinned)
        
        for (email of pinned) {
            //console.log('email', email)
            let client = JSON.parse(window.localStorage.getItem(email))
            //console.log(client)
            client.email = email;
            let card = makePinnedCard(client) 
            $('#pinned').append(card)
        }
    }
}


