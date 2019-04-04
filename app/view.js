

let testEvent ={
    "start": { 
        "dateTime": "2019-03-27T00:36:45.919Z",  
        "timeZone": "Pacific Standard Time" 
    },  
      "end": { 
        "dateTime": "2019-03-27T00:37:45.919Z",  
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
    let startime = parseDatetime(event.start.dateTime)
    let card= $("<div>", {class: 'card'})
    card.append(`<div class="card-header">${startime}: ${event.attendees[0].emailAddress.name}`)
    
    
    
      //cardInfo.text(JSON.stringify(event.profiles))
    
    let cardInfo = makeCardInfo(event.client)
    card.append(cardInfo)
    container.append(card)
    return container
}

//$('document').ready($('body').append(makeFrame(testEvent)))
//$('document').ready($('body').append(makeFrame(testEvent)))

function makeCardInfo(client) {
  let cardInfo =$('<div>', {class:"card-body"})
  if (!client.profiles){
    cardInfo.text('Not Synced to Salesforce')
  }
  else {
    cardInfo.append(`<h5 class="card-title">${client.company}</h5>
                <a href="${SFDC + client.sfid}" style=
                "text-align:left" target="_blank" class="btn-sm btn-primary">Go To Salesforce</a>
                <a href="${gainsight + client.sfid}" style=
                "text-align:left" target="_blank" class="btn-sm btn-primary">Go To Gainsight</a>
      `)
    let table = $("<table>", {class : "table"})  
    for (profile of client.profiles){
        let row = $("<tr>", {scope:"row"})
        row.append(`<td>${profile.friendlyName}`)
        row.append(`<td>${profile.ws}`)
        row.append(`<td>${profile.google}`)
        table.append(row)
    }
    cardInfo.append(table)
    return cardInfo
  }


}
//parse datetime objects
function parseDatetime(string){
  let time = new Date(string);
  let m = "AM";
  let hr = time.getHours();
  if (hr>12){
    m = 'PM';
    hr = hr-12;
  }
  if (hr==12){m='PM'}
  return `${hr}:${(time.getUTCMinutes()<10? '0':'')+time.getUTCMinutes()} ${m}`

}
