console.log('This tests the content script')

const INPUT_NAME = 'full_name'
const INPUT_EMAIL = 'email'



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('message data', request)
        document.getElementsByName(INPUT_NAME)[0].value =  request.name
        document.getElementsByName(INPUT_EMAIL)[0].value = request.email 
        
    }
)

