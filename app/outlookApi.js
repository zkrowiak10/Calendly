//config
var authEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?";
var redirectUri = chrome.identity.getRedirectURL("outlook");
var appId = 'd25c3df7-f3bc-48f3-ba05-b395304067e7';
var scopes = 'openid Calendars.Read';
var calendar_url = 'https://graph.microsoft.com/v1.0/me/calendarview?'
var tokenObj = JSON.parse(window.localStorage.getItem('tokenObj'));

function checkIn(){
  if (!tokenObj){
    //console.log("the token object is undefined, login required",tokenObj)
    tokenObj={}
    loadingView()
  }
  
  else{
    
    window.localStorage.setItem('loggedIn',true)
    
    //console.log('logged in',tokenObj)
    $('#logout').show();
    $('#login').hide();
    loadingView();
    makeToday()
  }
}

async function calendars(date){
  
  date.setHours(0,0,0,0)//set date to midnight
  today = date.toISOString();//create datestring
  let day = date.getDate()
  date.setDate(day+1)//get tomorrow's date
  tomorrow = date.toISOString();
  let response = new Promise((resolve,reject) => { getAccessToken(()=>{
    $.ajax({
      type: 'GET',
      url: calendar_url + `startdatetime=${today}&enddatetime=${tomorrow}&$top=10`,
      headers: {
          "Authorization": "Bearer " + tokenObj.accessToken,
          'Prefer': 'outlook.timezone="Eastern Standard Time"' //undo hardcoding later
          }
    }).done(function(data){
      
      window.localStorage.setItem('todayCalendar',JSON.stringify(data))
      resolve(data)
      })
  })})
  
  let result = await response
  return result
}

function syncAccount(){
    //console.log('beginning')
    //loadingView();
    if (!window.localStorage.getItem('tokenObj')) {            
        let requestURL = {'url': buildAuthUrl(), 'interactive':true}
        chrome.identity.launchWebAuthFlow(requestURL,function(response){
            handleTokenResponse(response);
            //console.log('tokenObj after handleToken',tokenObj)
            window.localStorage.setItem('tokenObj', JSON.stringify(tokenObj))
            chrome.storage.sync.set({loggedIn:true})
            //console.log('stored')
            $('#login').hide();
            $('#logout').show();
            //loadingView();
        })
    }
    else{
        //console.log('already logged in')
        $('#return').text('already in')
        $('#login').hide();
        $('#logout').show();
        //console.log(JSON.toString(tokenObj))
       // loadingView();
    }
}

// Helper method to validate token and refresh
// if needed
function getAccessToken(callback) {
  var now = new Date().getTime();
  var isExpired = now > parseInt(tokenObj.tokenExpires);
  // Do we have a token already?
  if (tokenObj.accessToken && !isExpired) {
    // Just return what we have
    //console.log('access token exists and isnt expired')
    if (callback) {
      callback();
    }
  } else {
    // Attempt to do a hidden iframe request
    //console.log('silent request needed')
    window.localStorage.removeItem('tokenObj')
    //makeSilentTokenRequest(callback);
    syncAccount()
  }
}

function makeSilentTokenRequest(callback) {
 /* // Build up a hidden iframe
    let requestURL = buildSilentAuthUrl();
    sessionStorage.idToken = tokenObj.id_token;
    fetch(requestURL, {credentials: "include", mode: 'cors'}).then(function(response){
      console.log('tknReq', response)
      handleTokenResponse(response);
      window.localStorage.setItem('tokenObj', JSON.stringify(tokenObj))
      console.log('stored')
      $('#login').hide();
      $('#logout').show();
      //loadingView();
    })*/

  /*$.ajax({
    type: 'GET',
    url: buildSilentAuthUrl(),
    headers: {
        "Authorization": "Bearer " + tokenObj.accessToken
        }
  }).done(function(data){
    console.log("the results of calendar query are:",data)
    window.localStorage.setItem('todayCalendar',JSON.stringify(data))
    resolve(data)
    })
}*/
    var iframe = $('<iframe/>');
    iframe.attr('id', 'auth-iframe');
    iframe.attr('name', 'auth-iframe');
    iframe.appendTo('body');
    iframe.hide();

    iframe.on('load',function() {
      callback();
    });

    iframe.attr('src', buildSilentAuthUrl());
}
  

function logout(){
  window.localStorage.removeItem('tokenObj')
  window.localStorage.setItem('loggedIn',false)
  console.log(tokenObj)
  $('#login').show();
  $('#logout').hide();
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
  function buildSilentAuthUrl() {
    // Generate random values for state and nonce
    sessionStorage.authState = guid();
    sessionStorage.authNonce = guid();
  
    var authParams = {
      response_type: 'id_token',
      client_id: appId,
      redirect_uri: redirectUri,
      scope: 'openid',
      state: sessionStorage.authState,
      nonce: sessionStorage.authNonce,
      response_mode: 'fragment',
      prompt: 'none'

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
  console.log('payload',payload)
  console.log('preferred username', payload.preferred_username)
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





  

