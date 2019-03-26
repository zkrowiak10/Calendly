

let testEvent ={
    "start": { 
        "dateTime": "9:00AM",  
        "timeZone": "Pacific Standard Time" 
    },  
      "end": { 
        "dateTime": "2:00PM",  
        "timeZone": "Pacific Standard Time" 
        },
    
      'attendees' : [ 
        { 
          "type": "required",  
          "emailAddress": { 
            "name": "Samantha Booth",
            "address": "samanthab@contoso.onmicrosoft.com" 
            }
         } ],
    'company': 'Sample Inc',
    'profiles' :[
        {
        'wordStream': 'testProfile',
        'google': '0000000000'},
        {'wordStream2': 'testProfile',
        'google2': '0000000000'
        }
        ]
         
      
}


function makeFrame(event){
    let container = $("<div>", {class: 'container-fluid', style: "margin-top:15px"})
    let card= $("<div>", {class: 'card'})
    card.append(`<div class="card-header">${event.start.dateTime} with ${event.attendees[0].emailAddress.name} from 
    ${testEvent.company}</div>`)
    container.append(card)
    return container
}

$('document').ready($('body').append(makeFrame(testEvent)))
$('document').ready($('body').append(makeFrame(testEvent)))