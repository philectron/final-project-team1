// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
module.exports = function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout: 'default',
    helpers: {
      isGreaterThanOrEqualTo: function(x, y) {
        return parseFloat(x) >= parseFloat(y);
      }
      // additional helpers go here
    }
  });
}
