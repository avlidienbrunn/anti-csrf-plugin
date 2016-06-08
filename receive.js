chrome.tabs.query(
    { currentWindow: true, active: true },
    function (tabArray) {
    	var info = document.getElementById("info");
    	var reload = document.getElementById("reload");
    	var currentTabId = tabArray[0].id;
    	var backgroundPage = chrome.extension.getBackgroundPage();

    	if(currentTabId in backgroundPage.blockedInfo && backgroundPage.blockedInfo[currentTabId] !== ""){
    		//Display which requests have been blocked
    		info.innerText = backgroundPage.blockedInfo[currentTabId];
    	}

	tabcheckbox = document.getElementById("tabdisable");
	tabcheckbox.onclick = function() {
		if (tabcheckbox.checked) {
			backgroundPage.tabWhitelist[currentTabId] = true;
			backgroundPage.blockedInfo[currentTabId] = "";
			info.innerText = "Nothing blocked.";
		} else {
			if (currentTabId in backgroundPage.tabWhitelist) {
				delete backgroundPage.tabWhitelist[currentTabId];
			}
		}
	}
	tabcheckbox.checked = (currentTabId in backgroundPage.tabWhitelist);

    }
);

//Disable checkbox functionality
checkbox = document.getElementById("disable");
checkbox.onclick = function(){
    chrome.extension.getBackgroundPage().disabled = checkbox.checked;
}
checkbox.checked = chrome.extension.getBackgroundPage().disabled;
