chrome.tabs.query(
    { currentWindow: true, active: true },
    function (tabArray) {
    	var info = document.getElementById("info");
    	var reload = document.getElementById("reload");
    	var currentTabId = tabArray[0].id;
    	var backgroundPage = chrome.extension.getBackgroundPage();

    	if(currentTabId in backgroundPage.blockedInfo && backgroundPage.blockedInfo[currentTabId] !== ""){
    		info.innerText = backgroundPage.blockedInfo[currentTabId];
    		reload.style.display = "block";
    		reload.onclick = function(){
    			chrome.tabs.reload(currentTabId);
    		}
    	}
    }
);