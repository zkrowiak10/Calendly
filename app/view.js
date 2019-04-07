

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
    let container = $("<div>", {class: 'card', style: "margin:15px"})
    let startTime = parseDatetime(event.start.dateTime)
    let card= $("<div>", {class: 'card '})
    container.attr("data-email",event.attendees[0].emailAddress.address)
    container.attr("data-startTime",startTime)
    card.append(`<div class="card-header"> <h6 style="display:inline" >${startTime}: ${event.client.name}</h6>
    <a syle="display:inline" href="mailto: ${event.client.email}" 
    target="_blank" class="png-btn"><i class="fas fa-envelope"></i></a></div>`)
    
    container.append(card)
    
    
      //cardInfo.text(JSON.stringify(event.profiles))
    
    let cardInfo = makeCardInfo(event.client)
    card.append(cardInfo)
      
    
    
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
    //create top row buttons
    let clientHeader = $('<ul>')
    clientHeader.append(`<li>  <h6 style="display:inline" >${client.company}</h6>  </li>`)
    let sfButton = $(`<button type="button" class="btn-sm btn-primary">Go To Salesforce</button>`)
    sfButton.click(()=>{createTab(SFDC + client.sfid)})
    clientHeader.append($('<li>').append(sfButton))
    let gButton = $(`<button type="button" class="btn-sm btn-primary">Go To Gainsight</button>`)
    gButton.click(()=>{createTab(gainsight + client.sfid)})
    clientHeader.append($('<li>').append(gButton))
    clientHeader.append(`<li></li>`)
    
    cardInfo.append(clientHeader)

    let table = $("<table>", {class:"table table-striped", style:"margin-top:20px; ; box-shadow: 1px 1px 3px grey; border-radius: 5px"})  
    let count =0;
    for (profile of client.profiles){
        let row = $("<tr>")
        /*if (count==0) {
          row.attr({'id': sfid, )
        }*/
        let td =$('<td>')
        td.append(`${profile.friendlyName}`)
        let wsPath = wordstreamLoginURI + profile.ws;
        let googlePath = googleURI+ profile.google
        let button = $(`<button class="png-button" style='float:right; margin-right:5px' target="_blank" style="margin-right:5px"><img class="png" src="wordStream.png"></>` )
        button.click(function() {createTab(wsPath)})
        td.append(button)
        let google = $(`<button class="png-button" style='float:right; margin-right:5px' target="_blank" style="margin-right:5px"><img class="png" src="google-icon32.png"></>` )
        google.click(function() {createTab(googlePath)})
        td.append(google)
        //row.append(`<td>${profile.google}`)
        row.append(td)
        
        table.append($("<tbody>").append(row))
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

function createTab(url){
    chrome.tabs.create({"url": url, 'active': false})
}