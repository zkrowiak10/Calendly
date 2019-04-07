






let SFDC = "https://wordstream.my.salesforce.com/"
let gainsight ="https://wordstream--jbcxm.na66.visual.force.com/apex/JBCXM__customersuccess360?cid="
async function searchSF(email){
    let base = 'https://wordstream.my.salesforce.com/search/SearchResults?searchType=2&str=';
    let target = encodeURI(base+email);
    let sfData = {};
    
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
                    console.log(`Email = ${email}; this text should be a date`,element.cells[10].innerHTML)
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
        fetch("https://wordstream.my.salesforce.com/", {credentials: "include", mode: 'cors'}).then(function(response) {
            return response.text()})
        .then(function(text){
            //console.log(text)
            let error = 'redirectOnLoad()';
            let checker = text.search(error);
            if (checker.length!=-1){
                resolve(true)
            }
            else {
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
