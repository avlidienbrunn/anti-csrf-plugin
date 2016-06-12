var tabs = {};
var blockedRequests = {};
var blockedInfo = {};
var tabWhitelist = {};
var disabled = false;

// Get all existing tabs
chrome.tabs.query({}, function(results) {
    results.forEach(function(tab) {
	    tabs[tab.id] = tab;
    });
});

// Create tab event listeners
function onUpdatedListener(tabId, changeInfo, tab) {
    tabs[tabId] = tab;
    updateGUICounter(tabId);
}

function onRemovedListener(tabId) {
    delete tabs[tabId];
    if (tabId in tabWhitelist)
	    delete tabWhitelist[tabId];
    delete blockedRequests[tabId];
    delete blockedInfo[tabId];
}

function rst_blocked_info(tabId) {
  blockedInfo[tabId] = [];
}

function add_blocked_info(tabId, source, dst) {
  if (!(tabId in blockedInfo))
    blockedInfo[tabId] = [];

  blockedInfo[tabId].push([source, dst]);
}

function updateGUICounter(tabId) {
  chrome.browserAction.setBadgeBackgroundColor({color:[0,0,0,255]});
  numberOfBlocked = tabId in blockedInfo ? blockedInfo[tabId].length : 0;
  if (numberOfBlocked == 0)
    chrome.browserAction.setBadgeText({text: ""});
  else
    chrome.browserAction.setBadgeText({text: numberOfBlocked.toString()});
}

function onActivatedListener(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    updateGUICounter(activeInfo.tabId);
  })
}

// Subscribe to tab events
chrome.tabs.onActivated.addListener(onActivatedListener);
chrome.tabs.onUpdated.addListener(onUpdatedListener);
chrome.tabs.onRemoved.addListener(onRemovedListener);


function onBeforeSendHeaders(details){

	if (disabled || details.tabId in tabWhitelist) {
		return;
	}

	//Reset popup blocked info text if user is navigating (main_frame)
	if(details.type == "main_frame"){
    rst_blocked_info(details.tabId);
	}

	// The tabId will be set to -1 if the request isn't related to a tab.
	// HTTP/1.1 recommends no action be performed on GET
	if(details.tabId == -1 || (details.type == "main_frame") || (details.method == "GET")) {
		return;
	}

	should_block = false;

	//Get destination host (including subdomain)
	var uri = document.createElement('a');
	uri.href = details.url;
	to_host = uri.host.replace(/^www\./, '');

	uri = document.createElement('a');
	try{
		uri.href=tabs[details.tabId].url;
	}catch(x){
		uri.href = "http://xxx.yyy.zzz";
	}

	//Get origin host (including subdomain)
	from_host = uri.host.replace(/^www\./, '');

	//data uri's will get empty host
	if(from_host == ""){
		from_host = "xxx.yyy.zzz";
	}

	//Check if the request is being made to the same domain (host. we 
	// ignore schema and port)
	if(from_host !== "newtab") {
		should_block = (to_host !== from_host);
	}

	if(should_block){
		has_cookie = false;

		//Remove all cookies
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name.toUpperCase() === 'COOKIE') {
				has_cookie = true;
				details.requestHeaders.splice(i, 1);
				break;
			}
		}

		if(has_cookie){
			//Only log blocked request if it actually removed a cookie
      add_blocked_info(details.tabId, from_host.replace(/xxx.yyy.zzz/g, "data:"), to_host);
			blockedRequests[details.requestId] = 1;
		}
	}

	return {requestHeaders: details.requestHeaders};
}

function onHeadersReceived(details){

	if(!(details.requestId in blockedRequests)){
		return;
	}

	delete blockedRequests[details.requestId];
	
	for (var i = 0; i < details.responseHeaders.length; ++i) {
		if (details.responseHeaders[i].name.toUpperCase() === 'SET-COOKIE') {
			details.responseHeaders.splice(i, 1);
			//No break here since multiple set-cookie headers are allowed in one response.
		}
	}

	return {responseHeaders: details.responseHeaders};
}

var wr = chrome.webRequest;
wr.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {urls: ["https://*/*", "http://*/*"]}, ["blocking", "requestHeaders"]);
wr.onHeadersReceived.addListener(onHeadersReceived, {urls: ["https://*/*", "http://*/*"]}, ["blocking", "responseHeaders"]);
