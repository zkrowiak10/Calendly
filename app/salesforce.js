
<<<<<<< HEAD





//searchSF('tod@modernostrategies.com	')

function searchSF(email){
    let base = 'https://wordstream.my.salesforce.com/search/SearchResults?searchType=2&str=';
    let SFDC = "https://wordstream.my.salesforce.com/"
    let target = encodeURI(base+email);
    let sfData = {};
    if (window.localStorage.getItem(email)){
        console.log('contact data already exists')
        return
    }

    fetch(target, {credentials: "include", mode: 'cors'}).then(function(response) {
        console.log("Response:");
        console.log(response)
        return response.text()})
    .then(function(text){
        //console.log(text)
        let error = 'redirectOnLoad()';
        let checker = text.search(error);
        let parser = new DOMParser();
        doc = parser.parseFromString(text, "text/html");
        if (checker!=-1){
            alert('You are not logged in. Please go to salesforce.com and log in')
            return
        }
        try {
           var hrf = doc.getElementById('Account_body').getElementsByTagName('table')[0].rows[1].cells[1].getElementsByTagName('a')[0].getAttribute('href');
        }
        catch(err){
            alert(err)

        }
        let sfid = hrf.split('?')[0];
        sfid = sfid.slice(1);
        console.log('sfid:', sfid);
        sfData.sfid = sfid;
        return hrf
    }).then((hrf)=>{
        fetch(SFDC+hrf,{credentials: "include", mode: 'cors'})
        .then(response=>{return response.text()}
        ).then(text=>{
            let id = sfData.sfid + '_00N80000004l7nV_body'
            let parser = new DOMParser();
            doc = parser.parseFromString(text, "text/html");
            let profiles =doc.getElementById(id).getElementsByClassName("list")[0].rows;
            let l = profiles.length -1;
            sfData.profiles =[];
            for (let i=1; i<l; i++) {
                let obj = {}
                let element= profiles[i];
                if  (element.cells[10].innerHTML != '&nbsp;'){
                    console.log( element.cells[10].innerHTML)
                    continue;
                }
                obj.ws= element.cells[1].innerText;
                obj.google = element.cells[2].innerText;
                obj.friendlyName=  element.cells[5].innerText;
                sfData.profiles.push(obj)
            };
            
            console.log(sfData.profiles);
            console.log(sfData);
            window.localStorage.setItem(email,sfData);        })
    })
}
        

    

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
=======
>>>>>>> e9bec23261330b50211fff2d2339c40648b0bd97
