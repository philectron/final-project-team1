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
      },
      sum: function(numbers){
        if(numbers.length > 0){
          var total = 0;
          var total2 = 0;
          for(var i = 0; i < numbers.length; i++){
            var num1Float = parseFloat(numbers[i].goal);
            var num2Float = parseFloat(numbers[i].progress);
            if(!isNaN(num1Float) && !isNaN(num2Float)){
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
        }
        else{
          return 0;
        }
      }
      // additional helpers go here
    }
  });
}
