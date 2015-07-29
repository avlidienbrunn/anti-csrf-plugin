var tabs = {};
var blockedRequests = {};

// Get all existing tabs
chrome.tabs.query({}, function(results) {
    results.forEach(function(tab) {
        tabs[tab.id] = tab;
    });
});

// Create tab event listeners
function onUpdatedListener(tabId, changeInfo, tab) {
    tabs[tab.id] = tab;
}
function onRemovedListener(tabId) {
    delete tabs[tabId];
}

// Subscribe to tab events
chrome.tabs.onUpdated.addListener(onUpdatedListener);
chrome.tabs.onRemoved.addListener(onRemovedListener);


function onBeforeSendHeaders(details){
	// Set to -1 if the request isn't related to a tab.
	if(details.tabId == -1 || (details.type == "main_frame" && details.method == "GET")){
		return;
	}

	should_block = false;

	//Get destination host
	var uri = document.createElement('a');
	uri.href = details.url;
	to_host = uri.host;

	//Get origin host
	uri = document.createElement('a');
	try{
		uri.href=tabs[details.tabId].url;
	}catch(x){
		uri.href = "http://xxx.yyy.zzz";
	}
	from_host = uri.host;

	//data uri's will get empty host
	if(from_host == ""){
		from_host = "xxx.yyy.zzz";
	}

	//Check if it's under the same domain (*.CURRENTDOMA.IN)
	if(from_host !== "newtab" && /\./.test(from_host)){
		//Get "example.com" from "www.ex.example.com"
		pattern_from_host = from_host.match(/[^.]*\.[^.]*$/)[0].replace(/\./g, "\\.");
		//Check if destination host ends with ".?example.com"
		allow = new RegExp("(^|\\.)"+pattern_from_host+"$", "i");
		should_block = !allow.test(to_host);
	}

	if(should_block){
		console.log("blocked " + from_host + "->" + to_host + "(" + details.type + ")");
		blockedRequests[details.requestId.toString()] = 1;
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === 'Cookie') {
				details.requestHeaders.splice(i, 1);
				break;
			}
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
		if (details.responseHeaders[i].name === 'Set-Cookie') {
			details.responseHeaders.splice(i, 1);
			//No break here since multiple set-cookie headers are allowed in one response.
		}
	}
	return {responseHeaders: details.responseHeaders};
}

var wr = chrome.webRequest;
wr.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {urls: ["https://*/*", "http://*/*"]}, ["blocking", "requestHeaders"]);
wr.onHeadersReceived.addListener(onHeadersReceived, {urls: ["https://*/*", "http://*/*"]}, ["blocking", "responseHeaders"]);
