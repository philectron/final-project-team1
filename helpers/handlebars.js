// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
module.exports = function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout: 'default',
    helpers: {
      isGreaterThanOrEqualTo: function(lhs, rhs) {
        return parseFloat(lhs) >= parseFloat(rhs);
      }
      // additional helpers go here
    }
  });
}
