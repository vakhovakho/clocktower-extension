chrome.runtime.onMessage.addListener(async function(e,s,t){return console.log("Message received:",e),e.translate?chrome.declarativeNetRequest.updateStaticRules({rulesetId:"ruleset_1",enableRuleIds:[1]}):chrome.declarativeNetRequest.updateStaticRules({rulesetId:"ruleset_1",disableRuleIds:[1]}),t({success:!0}),!0});
