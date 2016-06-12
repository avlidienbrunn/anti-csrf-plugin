chrome.tabs.query(
  { currentWindow: true, active: true },
  function (tabArray) {
    var info = document.getElementById("info");
    var reload = document.getElementById("reload");
    var currentTabId = tabArray[0].id;
    var backgroundPage = chrome.extension.getBackgroundPage();

    	if(currentTabId in backgroundPage.blockedInfo && 
         backgroundPage.blockedInfo[currentTabId].length > 0){
        var blockedInfo = backgroundPage.blockedInfo[currentTabId];
        info.innerText = "Stripped cookies for:\n";
        for (var i = 0; i < blockedInfo.length; i++) 
          info.innerText += blockedInfo[i][0] + " -> " + blockedInfo[i][1] + "\n";
    	}

    tabcheckbox = document.getElementById("tabdisable");
    tabcheckbox.onclick = function() {
      if (tabcheckbox.checked || document.getElementById("disable").checked) {
        backgroundPage.tabWhitelist[currentTabId] = true;
        backgroundPage.blockedInfo[currentTabId] = [];
        info.innerText = "Nothing blocked.";
        chrome.browserAction.setIcon({"path":"badgedis.png"});
      } else {
        if (currentTabId in backgroundPage.tabWhitelist) {
          chrome.browserAction.setIcon({"path":"badge.png"});
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
  if (checkbox.checked || document.getElementById("tabdisable").checked)
    chrome.browserAction.setIcon({"path":"badgedis.png"});
  else
    chrome.browserAction.setIcon({"path":"badge.png"});

}

checkbox.checked = chrome.extension.getBackgroundPage().disabled;
