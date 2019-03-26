/*base = 'https://wordstream.my.salesforce.com/search/SearchResults?searchType=2&str=';
search = 'josh@brookslawgroup.com';
let target = encodeURI(base+search);

fetch(target, {credentials: "include", mode: 'cors'}).then(function(response) {
    console.log("Response:");
    console.log(response)
    return response.text()})
    .then(function(text){
        //console.log(text)
        let parser = new DOMParser();
        doc = parser.parseFromString(text, "text/html");
        let hrf = doc.getElementById('Account_body').getElementsByTagName('table')[0].rows[1].cells[1].getElementsByTagName('a')[0].getAttribute('href');
        console.log(hrf)
        /*fetch(hrf.getAttribute('href'), {credentials: "include", mode: 'cors'})
            .then(response=> {return response.text})
            .then(page=>{
                let html = parser.parseFromString(page,"text/html")
                html.getElementById("0010y00001ZAdI4_00N80000004l7nV_body")
                .getElementsByClassName("list")[0]
                .rows[1]
                .cells[1]
                .innerText
            
            })
    
        
            
        
    })*/