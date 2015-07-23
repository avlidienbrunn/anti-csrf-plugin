var tabs = {};

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
	if(details.tabId == -1){
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
		uri.href = "http://xxx.yyy.zzz"
	}
	from_host = uri.host;

	//Check if it's under the same domain (*.CURRENTDOMA.IN)
	if(from_host !== "newtab" && /\./.test(from_host)){
		//Get "example.com" from "www.ex.example.com"
		pattern_from_host = from_host.match(/[^.]*\.[^.]*$/)[0].replace(/\./g, "\\.");
		//Check if destination host ends with ".?"
		allow = new RegExp("(^|\\.)"+pattern_from_host+"$", "i");
		should_block = !allow.test(to_host);
	}

	if(should_block){
		console.log("blocked " + from_host + "->" + to_host);
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === 'Cookie') {
				details.requestHeaders.splice(i, 1);
				break;
			}
		}
	}

	return {requestHeaders: details.requestHeaders};
}
var wr = chrome.webRequest;
wr.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {urls: ["https://*/*", "http://*/*"]}, ["blocking", "requestHeaders"]);
