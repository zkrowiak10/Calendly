

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
    let container = $("<div>", {class: 'card', style: "margin-top:15px"})
    let startTime = parseDatetime(event.start.dateTime)
    let card= $("<div>", {class: 'card'})
    container.attr("data-email",event.attendees[0].emailAddress.address)
    container.attr("data-startTime",startTime)
    card.append(`<div class="card-header">${startTime}: ${event.client.name}`)
    container.append(card)
    
    
      //cardInfo.text(JSON.stringify(event.profiles))
    
    let cardInfo = makeCardInfo(event.client)
    container.append(cardInfo)
      
    
    
    return container
}

//$('document').ready($('body').append(makeFrame(testEvent)))
//$('document').ready($('body').append(makeFrame(testEvent)))

function makeCardInfo(client) {
  let cardInfo =$('<div>', {class:"card-body", syle:"display:inline; border-style:inset"})
  if (!client.profiles){
    cardInfo.text('Not Synced to Salesforce')
  }
  else {
    cardInfo.append(`
    <ul>
        <li>  <h6 style="display:inline" >${client.company}</h6>  </li>
    
        <li><a syle="display:inline" href="${SFDC + client.sfid}" target="_blank" class="btn-sm btn-primary">Go To Salesforce</a></li>
        <li> <a syle="display:inline" href="${gainsight + client.sfid}" style=target="_blank" class="btn-sm btn-primary">Go To Gainsight</a></li>
        <li><a syle="display:inline" href="mailto: ${client.email}" style= target="_blank" class="btn-sm btn-primary">Email Client</a></li>
    </ul>
      `)
    let table = $("<table>", {class : "table "})  
    let tbody = $('<tbody>', {class: "table-striped"})
    for (profile of client.profiles){
        let row = $("<tr>", )
        row.append(`<td>${profile.friendlyName}`)
        let wsPath = wordstreamLoginURI + profile.ws;
        let googlePath = googleURI+ profile.google
        let button = $(`<button class="png-button" style='float:right; margin-right:5px' target="_blank" style="margin-right:5px"><img class="png" src="wordStream.png"></>` )
        button.click(function() {createTab(wsPath)})
        row.append(button)
        let google = $(`<button class="png-button" style='float:right; margin-right:5px' target="_blank" style="margin-right:5px"><img class="png" src="google-icon32.png"></>` )
        google.click(function() {createTab(googlePath)})
        row.append(google)
        //row.append(`<td>${profile.google}`)
        tbody.append(row)
    }
    table.append(tbody)
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

function createTab(url){
    chrome.tabs.create({"url": url, 'active': false})
}