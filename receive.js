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
    		//Show unsafe reload button
    		reload.style.display = "block";
    		reload.onclick = function(){
    			chrome.tabs.reload(currentTabId);
    		}
    	}
    }
);
//Disable checkbox functionality
checkbox = document.getElementById("disable");
checkbox.onclick = function(){
    chrome.extension.getBackgroundPage().disabled = checkbox.checked;
}
checkbox.checked = chrome.extension.getBackgroundPage().disabled;