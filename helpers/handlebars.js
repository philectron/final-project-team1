// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
module.exports = function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout: 'default',
    helpers: {
      if_gte: function(lhs, rhs, options) {
        if (parseFloat(rhs) > 0 && parseFloat(lhs) >= parseFloat(rhs)) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
      // additional helpers go here
    }
  });
}
