// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
module.exports = function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout: 'default',
    helpers: {
      sum: function(numbers) {
        if (numbers.length > 0) {
          var total = 0;
          var total2 = 0;
          for (var i = 0; i < numbers.length; i++) {
            var num1Float = parseFloat(numbers[i].goal);
            var num2Float = parseFloat(numbers[i].progress);
            if (!isNaN(num1Float) && !isNaN(num2Float)) {
              total += num1Float;
              total2 += num2Float;
            }
          }
          if (total > total2) {
            percentage = Math.floor(total2 * 100.0 / total);
          } else {
            percentage = Math.floor(total * 100.0 / total2);
          }
          return percentage;
        } else {
          return 0;
        }
      },
      isGreaterThanOrEqualTo: function(x, y) {
        return parseFloat(x) >= parseFloat(y);
      }
      // additional helpers go here
    }
  });
}
