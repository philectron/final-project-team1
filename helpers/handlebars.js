// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs/42224612#42224612
var register = function(Handlebars) {
  var helpers = {
    getGoalPercentage: function(goal, progress) {
      // parse 'goal' and 'progress' from string to float
      var goalFloat = parseFloat(goal),
        progressFloat = parseFloat(progress);

      if (!isNaN(goalFloat) && !isNaN(progressFloat)) {
        // if the parsed values are both not NaN, return the floor of percentage
        return Math.floor(progressFloat * 100.0 / goalFloat);
      } else {
        // otherwise, return 0
        return 0;
      }
    }
    // any more helpers will go here
    // remember to put a comma at the end of the previous helper
    // example:
    //
    // helperName: function(var, options) {
    //  ...
    // }
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    return helpers;
  }

};

module.exports.register = register;
module.exports.helpers = register(null);
