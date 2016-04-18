var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var simplePrefs = require('sdk/simple-prefs');

function setHiddenUsers(worker) {
    var hiddenUsers = simplePrefs.prefs['hiddenUsers'].split(',').map(function(u) { 
       return u.trim();
    });
    worker.port.emit("setHiddenUsers", hiddenUsers);
}

pageMod.PageMod({
  include: ["*.wikipedia.org", "*.wikimedia.org", "*.wikidata.org"],
  contentScriptFile: self.data.url("hider.js"),
  contentStyleFile: self.data.url("hider.css"),
  onAttach: function(worker) {
      setHiddenUsers(worker);
      // FIXME: Cleanup on detach
      simplePrefs.on('hiddenUsers', function() {
          setHiddenUsers(worker);
      });
    }
});

