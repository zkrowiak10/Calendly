



function makeFrame(event){
    let client = JSON.parse(window.localStorage.getItem(event.client.email))
    let container = $("<div>", {class: 'card', style: "margin:15px"})
    let startTime = parseDatetime(event.start.dateTime)
    let card= $("<div>", {class: 'card '})
    let eventType = ''
    card.data("email",event.client.email)
    container.data("data-startTime",startTime)
    header = $('<div>', {class: "card-header"})
    header.append(`<h6 style="display:inline" >${startTime}: ${eventType} with ${event.client.name}</h6>
    <a syle="display:inline"  href="mailto: ${event.client.email}" 
    target="_blank" ><i class="fas fa-envelope"></i></a>`)
    
    refresh = $('<button style="float:right; display:inline" type="button" class="png-button"><i  style="color:0169d8" class="fas fa-sync-alt"></button>')
    refresh.click(()=>{refreshCard(card, cardInfo, event)})
    show = $(`<button style="float:right; display:inline; margin-left:10px" type="button" class="arrow png-button"></button>`)
    arrow = $(`<i style="color:0169d8" class="fas fa-chevron-left"></i>`)
    show.append(arrow)

    header.append(show)
    header.append(refresh)
    let pin = $('<button style="float:right; display:inline; margin-right:10px; color:0169d8" type="button" class=" png-button"><i class="unpinned fas fa-thumbtack"></i></button>')
    if (client.pinned) {
      console.log('this client is pinned')
      pin.find('i').toggleClass('pinned')
    }
    
    pin.click(()=>{
      container.find('.unpinned').toggleClass('pinned')
      let pinnedClientsStored = JSON.parse(window.localStorage.getItem('pinnedClients'))
      console.log('pinnedCLientStored', pinnedClientsStored)
      let pinnedClients =[]
      if (pinnedClientsStored != null) {console.log('ifhappens',pinnedClientsStored); pinnedClients = pinnedClientsStored}
      console.log('pinnedClients',pinnedClients)

      if (client.pinned) {
        let i = pinnedClients.indexOf(event.client.email)
        pinnedClients.splice(i,1)
        client.pinned = false
      }
      else {
        console.log('pinned clients', pinnedClients)
        pinnedClients.push(event.client.email)
        client.pinned=true;
        client.name = event.client.name;
      }
      window.localStorage.setItem(event.client.email, JSON.stringify(client))
      window.localStorage.setItem('pinnedClients',JSON.stringify(pinnedClients))

    })
    header.append(pin)
    card.append(header)
    container.append(card)
    show.on('click',()=>{
      cardInfo.slideToggle()
      container.find('.arrow').toggleClass('rotate')
      
    })
    
      //cardInfo.text(JSON.stringify(event.profiles))
    
    let cardInfo = makeCardInfo(event.client)
    card.append(cardInfo.hide())
      
    
    
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
    let sfButton = $(`<button type="button" class="btn-sm btn-primary">Salesforce</button>`)
    sfButton.click(()=>{createTab(SFDC + client.sfid)})
    clientHeader.append($('<li>').append(sfButton))
    let gButton = $(`<button type="button" class="btn-sm btn-primary">Gainsight</button>`)
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

async function refreshCard(card, cardInfo, event){
  let email = card.data('email')
  cardInfo.children().remove()
  let spinner = makeSpinner()
  cardInfo.append(spinner)
  
  let status = await checkSF();
  if(status){loginSF(); return}
  else{
    parseSFID(event.client.sfid, email)
      .then(()=>{
        let newcardInfo= makeCardInfo(event.client)
        cardInfo.children().remove()
        cardInfo.append(newcardInfo)

      }
      )
    }
  
}

function makeSpinner(){
  let spinnerBorder = $('<div class="spnnr">')
  let spinner= $(`<div class="spinner-border" >
                  <span style='display: inline-block'class="sr-only">Loading...</span>
                 </div>`)
  spinnerBorder.append(spinner);
  return spinnerBorder
}
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

function makePinnedCard(client) {
  let container = $("<div>", {class: 'card', style: "margin:15px"})
    let card= $("<div>", {class: 'card '})
    card.data("email", client.email)
    header = $('<div>', {class: "card-header"})
    header.append(`<h6 style="display:inline" >${client.name} from ${client.company}</h6>
    <a syle="display:inline" href="mailto: ${client.email}" 
    target="_blank" ><i class="fas fa-envelope"></i></a>`);
    let trash =  $('<button style="float:right; display:inline; margin-right:10px; color:0169d8" type="button" class=" png-button"><i class="far fa-trash-alt"></i></button>')
    refresh = $('<button style="float:right; display:inline" type="button" class="png-button"><i  style="color:0169d8" class="fas fa-sync-alt"></button>')
    refresh.click(()=>{refreshCard(card, cardInfo, event)})
    trash.click(()=> {
      let pinnedClients = JSON.parse(window.localStorage.getItem('pinnedClients'))
      let i = pinnedClients.indexOf(client.email)
      pinnedClients.splice(i,1)
      client.pinned = false
      container.remove()
      window.localStorage.setItem('pinnedClients', JSON.stringify(pinnedClients))
      window.localStorage.setItem(client.email, JSON.stringify(client))


    })
  
    header.append(refresh)
    header.append(trash)
    card.append(header)

    container.append(card)
   
    container.append(makePinnedCardInfo(client))
    return container

}

function makePinnedCardInfo(client) {
  let cardInfo =$('<div>', {class:"card-body", syle:"display:inline; border-style:inset"})
  if (!client.profiles){
    cardInfo.text('Not Synced to Salesforce')
  }
  else {
    //create top row buttons
    let clientHeader = $('<ul>')
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
      
    }
    return cardInfo
  }

  function getEventType(body) {
     let re = /<p>Event Name: (\w* \w* \w*)\W*/i
     result = re.exec(body)[1]
     console.log('result of regex', result)
     return result
  }