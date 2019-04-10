






let SFDC = "https://wordstream.my.salesforce.com/"
let gainsight ="https://wordstream--jbcxm.na66.visual.force.com/apex/JBCXM__customersuccess360?cid="
const SFContactList = "https://wordstream.my.salesforce.com/003?rlid=RelatedContactList&id="
async function searchSF(email){
    let base = 'https://wordstream.my.salesforce.com/search/SearchResults?searchType=2&str=';
    let target = encodeURI(base+email);
    let sfData = {};
    let test = JSON.parse(window.localStorage.getItem(email))
    if (test) {
        sfData = test
    }
    
    //check that contact data is not in existence
    /*if (window.localStorage.getItem(email)){
        console.log('contact data already exists')
        return
    }*/

    let promise = new Promise ((resolve,reject) =>{
        fetch(target, {credentials: "include", mode: 'cors'}).then(function(response) {
            return response.text()})
        .then(function(text){
            //console.log(text)
            let error = 'redirectOnLoad()';
            let checker = text.search(error);
            let parser = new DOMParser();
            doc = parser.parseFromString(text, "text/html");
            if (checker!=-1){
                //alert('You are not logged in. Please go to salesforce.com and log in')
                return
            }
            try {
                var hrf = doc.getElementById('Account_body').getElementsByTagName('table')[0].rows[1].cells[1].getElementsByTagName('a')[0].getAttribute('href');
            }
            catch(err){
                let message = err + '. Error tiere 1 email is:' + email;
                console.log(message)
                try{
                    hrf = doc.getElementById("Contact_body").getElementsByTagName('table')[0].rows[1].cells[2].getElementsByTagName('a')[0].getAttribute('href');
                }
                catch(err){
                    let message = err + '.Error tier 2 email is:' + email;
                    console.log(message)
                }
            }
            let sfid = hrf.split('?')[0];
            sfid = sfid.slice(1);
            console.log('sfid',sfid)
            sfData.sfid = sfid;
            window.localStorage.setItem(email,JSON.stringify(sfData));
            parseSFID(sfid, email)
            .then(()=>{resolve()}).catch((err)=> {reject(err)});
        }).catch((err)=> {reject(err)})
        
    })
    let result = await promise
    return result;
}

async function parseSFID(hrf,email) {
    let sfData = JSON.parse(window.localStorage.getItem(email))
    let profiles = await parseProfiles(hrf);
    let promise = new Promise((resolve,reject)=> {
        fetch(SFDC+hrf,{credentials: "include", mode: 'cors'})
        .then(response=>{return response.text()})
        .then(text=>{
            let id = sfData.sfid + '_00N80000004l7nV_body'
            let parser = new DOMParser();
            doc = parser.parseFromString(text, "text/html");
             //was let profiles = doc.getElementById(id).getElementsByClassName("list")[0].rows
            let company = doc.getElementById("acc2_ileinner").innerText.replace("[View Hierarchy]","").trim();
            let l = profiles.length;
            //console.log('in Salesforce.js, company:', company)
            sfData.company = company;
            sfData.profiles =[];
            for (let i=1; i<l; i++) {
                let obj = {}
                let element= profiles[i];
                if  (element.cells[10].innerHTML != '&nbsp;'){
                    //console.log(`Email = ${email}; this text should be a date`,element.cells[10].innerHTML)
                    continue;
                }
                obj.ws= element.cells[1].innerText;
                obj.google = element.cells[2].innerText;
                obj.friendlyName=  element.cells[5].innerText;
                sfData.profiles.push(obj)
            };
            let message = `email: "${email}";`
            //console.log(message,sfData)
            
            
            window.localStorage.setItem(email,JSON.stringify(sfData));
            resolve()   
        }).catch((err)=> {reject(err)})
    })
    
    let result = await promise;
    return result;
}
        

function checkSF(){
    return new Promise((resolve,reject)=>{
        //console.log('promise')
        fetch("https://wordstream.my.salesforce.com/", {credentials: "include", mode: 'cors'}).then(function(response) {
            return response.text()})
        .then(function(text){
            //console.log("checkSFText",text)
            let error = 'redirectOnLoad()';
            let error2 = 'Login to your Salesforce Customer Account'
            let checker = text.search(error);
            let checker2 = text.search(error2)
            //console.log('checker', checker)
            //console.log('checker2',checker2)
            if (checker!=-1 || checker2 != -1){
                //console.log('true')
                resolve(true)
            }
            else {
                //console.log('false')
                resolve(false)
            }
        })
    })
}


async function parseProfiles(hrf){
    let target = "https://wordstream.my.salesforce.com/a06?rlid=00N80000004l7nV&id=" + hrf; 
    return fetch(target,{credentials: "include", mode: 'cors'})
    .then((response)=>{return response.text()})
    .then(text=>{
        let parser = new DOMParser();
        doc = parser.parseFromString(text, "text/html");
        let profiles = doc.getElementsByClassName("pbBody")[0].getElementsByClassName("list")[0].rows;
        return profiles


    })
    
}

function makePinningDialogue() {
    chrome.tabs.query({'active':true, 'currentWindow':true}, (tab)=>{
        let url = tab[0].url
        if (url.search("https://wordstream.my.salesforce.com/")==-1) {
            alert('This function is only available on Salesforce.')
        }
        var re = /salesforce.com\/(\w*)\?*/;
        console.log(re.exec(url))
        sfid  = re.exec(url)[1]
        fetch(SFContactList+sfid, {credentials: "include", mode: 'cors'})
        .then((response)=>{return response.text()})
        .then(text=>{
            let card=$('<div class="card">')
            let form = $('<form style="margin:10px;  box-shadow: 2px 2px 3px gray" class="card-header form-group">Please Choose A Primary Contact</form>')
            let options = $('<div class=card-body>')
            let parser = new DOMParser();
            doc = parser.parseFromString(text, "text/html");
            let contacts = doc.getElementsByClassName("pbBody")[0].getElementsByClassName("list")[0].rows;
            let l = contacts.length
            for (let i=1; i<l; i++) {
                contact = contacts[i];
                console.log('contact',contact)
                if (contact.cells[4].children[0].getAttribute('alt') == "Not Checked") {continue}
                let name = contact.cells[1].innerText
                let email = contact.cells[3].innerText
                options.append(`<input type='radio' name='client' value="${email}"> ${name}<br>`)
                

            }
            let button = $('<button  type="button" class="btn btn-outline-primary">Submit</button>')
            button.click(()=>{customPin(sfid)})
            form.append(options)
            form.append(button)
            
            card.append(form)
            $('#pinnedDialogue').append(card)
        })    



    })
}

function customPin(sfid) {
    let email = $('#pinnedDialogue').find("input[name='client']:checked").val()
    console.log(email)
    searchSF(email).then(()=>{
        let client = JSON.parse(window.localStorage.getItem(email));
        client.pinned=true
        $('#pinned').append(makePinnedCard(client))
        client.pinned=true;
        let pinnedClients = JSON.parse(window.localStorage.getItem('pinnedClients'))
        window.localStorage.setItem(email, JSON.stringify(client))
        pinnedClients.push(email);
        window.localStorage.setItem('pinnedClients', JSON.stringify(pinnedClients))

    })

}
//searchSF('ben@todayslocalmedia.com')

        /*fetch(hrf.getAttribute('href'), {credentials: "include", mode: 'cors'})
            .then(response=> {return response.text})
            .then(page=>{
                let html = parser.parseFromString(page,"text/html")
                html.getElementById("0010y00001ZAdI4_00N80000004l7nV_body")
                .getElementsByClassName("list")[0]
                .rows[1]
                .cells[1]
                .innerText /0011A00001QoNDL?srPos=0&srKp=001
            
            })
    
        
            
        
    })*/
