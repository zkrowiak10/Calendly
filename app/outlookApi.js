


$("#return").text('Jquery!')
$('#logout').hide()
$('#logout').click(logout)
$('#login').click(syncAccount)
$('#getStuff').click(calendars)

//config
var authEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?";
var redirectUri = chrome.identity.getRedirectURL("outlook");
var appId = 'd25c3df7-f3bc-48f3-ba05-b395304067e7';
var scopes = 'openid Calendars.Read';
var calendar_url = 'https://graph.microsoft.com/v1.0/me/calendarview?'

var appId = "d25c3df7-f3bc-48f3-ba05-b395304067e7";
var tokenObj = new Object();
chrome.storage.sync.get('tokenObj', (data) =>{
  if (typeof data['tokenObj'] == 'undefined'){console.log("the token object is undefined, login required",data)
    return}
  else{
    console.log('logged in',data)
    tokenObj=data.tokenObj;
    $('#logout').show();
    $('#login').hide();
  }

})


function syncAccount(){
    console.log('beginning')
    chrome.storage.sync.get('tokenObj',function(data){
        if (typeof data[tokenObj] == 'undefined'){            
            let requestURL = {'url': buildAuthUrl(), 'interactive':true}
            chrome.identity.launchWebAuthFlow(requestURL,function(response){
                handleTokenResponse(response);
                chrome.storage.sync.set({'tokenObj':tokenObj})
                $('#login').hide();
                $('#logout').show();
            })
        }
        else{
            console.log('already logged in')
            $('#return').text('already in')
            $('#login').hide();
            $('#logout').show();
            console.log(data)
            tokenObj=data.tokenObj
            console.log(JSON.toString(tokenObj))
        }
    })
}

function makeSilentTokenRequest(callback) {
  // Build up a hidden iframe
  var iframe = $('<iframe/>');
  iframe.attr('id', 'auth-iframe');
  iframe.attr('name', 'auth-iframe');
  iframe.appendTo('body');
  iframe.hide();

  iframe.load(function() {
    callback(tokenObj.accessToken);
  });

  iframe.attr('src', buildAuthUrl() + '&prompt=none&domain_hint=' +
    tokenObj.userDomainType + '&login_hint=' +
    tokenObj.userSigninName);
}

function logout(){
    chrome.storage.sync.clear(function(){
      $('#login').show();
      $('#logout').hide();
    })
}


//helper functions
function guid() {
    var buf = new Uint16Array(8);
    var cryptObj = window.crypto 
    cryptObj.getRandomValues(buf);
    function s4(num) {
      var ret = num.toString(16);
      while (ret.length < 4) {
        ret = '0' + ret;
      }
      return ret;
    }
    return s4(buf[0]) + s4(buf[1]) + '-' + s4(buf[2]) + '-' + s4(buf[3]) + '-' +
      s4(buf[4]) + '-' + s4(buf[5]) + s4(buf[6]) + s4(buf[7]);
  }
function buildAuthUrl() {
  // Generate random values for state and nonce
  sessionStorage.authState = guid();
  sessionStorage.authNonce = guid();

  var authParams = {
    response_type: 'id_token token',
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    state: sessionStorage.authState,
    nonce: sessionStorage.authNonce,
    response_mode: 'fragment'
  };
  
    return authEndpoint + $.param(authParams);
  }

function parseHashParams(hash) {
  var params = hash.split('#')[1].split('&');
  

  var paramarray = {};
  params.forEach(function(param) {
    param = param.split('=');
    paramarray[param[0]] = param[1];
  });

  return paramarray;
}


function handleTokenResponse(hash) {
  // clear tokens
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('idToken');

  var tokenresponse = parseHashParams(hash);

  // Check that state is what we sent in sign in request
  if (tokenresponse.state != sessionStorage.authState) {
    sessionStorage.removeItem('authState');
    sessionStorage.removeItem('authNonce');
    // Report error
    window.location.hash = '#error=Invalid+state&error_description=The+state+in+the+authorization+response+did+not+match+the+expected+value.+Please+try+signing+in+again.';
    console.log('states dont match')
    return;
  }
  sessionStorage.authState = '';
  tokenObj.accessToken = tokenresponse.access_token;

  // Get the number of seconds the token is valid for,
  // Subract 5 minutes (300 sec) to account for differences in clock settings
  // Convert to milliseconds
  var expiresin = (parseInt(tokenresponse.expires_in) - 300) * 1000;
  var now = new Date();
  var expireDate = new Date(now.getTime() + expiresin);
  sessionStorage.tokenExpires = expireDate.getTime();
  tokenObj.tokenExpires = sessionStorage.tokenExpires;

  sessionStorage.idToken = tokenresponse.id_token;
  tokenObj.idToken = tokenresponse.id_token;
  validateIdToken(function(isValid) {
    if (isValid) {
      // Re-render token to handle refresh
      console.log('token is valid')
      $("#return").text('All Good')
    }
  })
}

function validateIdToken(callback) {
  // Per Azure docs (and OpenID spec), we MUST validate
  // the ID token before using it. However, full validation
  // of the signature currently requires a server-side component
  // to fetch the public signing keys from Azure. This sample will
  // skip that part (technically violating the OpenID spec) and do
  // minimal validation

  if (null == sessionStorage.idToken || sessionStorage.idToken.length <= 0) {
    callback(false);
  }

  // JWT is in three parts seperated by '.'
  var tokenParts = sessionStorage.idToken.split('.');
  if (tokenParts.length != 3){
    callback(false);
  }

  // Parse the token parts
  var header = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(tokenParts[0]));
  var payload = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(tokenParts[1]));

  // Check the nonce
  if (payload.nonce != sessionStorage.authNonce) {
    sessionStorage.authNonce = '';
    callback(false);
  }

  sessionStorage.authNonce = '';

  // Check the audience
  if (payload.aud != appId) {
    callback(false);
  }

  // Check the issuer
  // Should be https://login.microsoftonline.com/{tenantid}/v2.0
  if (payload.iss !== 'https://login.microsoftonline.com/' + payload.tid + '/v2.0') {
    callback(false);
  }

  // Check the valid dates
  var now = new Date();
  // To allow for slight inconsistencies in system clocks, adjust by 5 minutes
  var notBefore = new Date((payload.nbf - 300) * 1000);
  var expires = new Date((payload.exp + 300) * 1000);
  if (now < notBefore || now > expires) {
    callback(false);
  }

  // Now that we've passed our checks, save the bits of data
  // we need from the token.

  sessionStorage.userDisplayName = payload.name;
  sessionStorage.userSigninName = payload.preferred_username;
  tokenObj.userDisplayName = payload.name;
  tokenObj.userSigninName = payload.preferred_username;

  // Per the docs at:
  // https://azure.microsoft.com/en-us/documentation/articles/active-directory-v2-protocols-implicit/#send-the-sign-in-request
  // Check if this is a consumer account so we can set domain_hint properly
  sessionStorage.userDomainType =
    payload.tid === '9188040d-6c67-4c5b-b112-36a304b66dad' ? 'consumers' : 'organizations';
  tokenObj.userDomainType=sessionStorage.userDomainType

  callback(true);
}

function getAccessToken(callback) {
  var now = new Date().getTime();
  var isExpired = now > parseInt(tokenObj.tokenExpires);
  // Do we have a token already?
  if (tokenObj.accessToken && !isExpired) {
    // Just return what we have
    if (callback) {
      callback(tokenObj.accessToken);
    }
  } else {
    // Attempt to do a hidden iframe request
    makeSilentTokenRequest(callback);
  }
}

function calendars(){
  let header = {

  }
  $.ajax({
    type: 'GET',
    url: calendar_url + "startdatetime=2019-03-25T01:00:00&enddatetime=2019-03-26T01:00:00&$top=10",
    headers: {
        "Authorization": "Bearer " + tokenObj.accessToken
    }
}).done(function(data){
  console.log("the results of calendar query are:",data)
})}
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
