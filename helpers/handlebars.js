// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
module.exports = function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout: 'default',

    helpers: {
      percentageOf: function(num1, num2) {
        // parse 'goal' and 'progress' from string to float
        var num1Float = parseFloat(num1);
        var num2Float = parseFloat(num2);

        if (!isNaN(num1Float) && !isNaN(num2Float)) {
          // if the parsed values are both not NaN, return the floor of percentage
          var percentage;

          // always do smaller * 100.0 / larger
          if (num1Float > num2Float) {
            percentage = Math.floor(num2Float * 100.0 / num1Float);
          } else {
            percentage = Math.floor(num1Float * 100.0 / num2Float);
          }

          return percentage;
        } else {
          // otherwise, return 0
          return 0;
        }
      }
      // additional helpers go here
    }
  });
}
