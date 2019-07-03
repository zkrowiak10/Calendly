console.log('This tests the content script')

const INPUT_NAME = 'full_name'
const INPUT_EMAIL = 'email'



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('message data', request)
        let fName = document.getElementsByName(INPUT_NAME)[0]
        let fEmail = document.getElementsByName(INPUT_EMAIL)[0]
        fName.value = request.name 
        fEmail.value = request.email 
        fName.setAttribute('value', request.name )
        fEmail.setAttribute('value', request.email)
        
    }
)

let fName = document.getElementsByName(INPUT_NAME)[0]
let fEmail = document.getElementsByName(INPUT_EMAIL)[0]
fName.value = request.name 
fEmail.value = request.email 
fName.setAttribute('value', request.name )
fEmail.setAttribute('value', request.email)