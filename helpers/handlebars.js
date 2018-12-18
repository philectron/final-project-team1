// Credits: https://stackoverflow.com/questions/32707322/how-to-make-a-handlebars-helper-global-in-expressjs
module.exports = function hbsHelpers(hbs) {
  return hbs.create({
    defaultLayout: 'default',
    helpers: {
      // Returns true if the left-hand-side number is greater than or equal to
      // the right-hand-side number. Returns false otherwise.
      if_num_gte: function(lhs, rhs, options) {
        if (parseFloat(lhs) >= parseFloat(rhs)) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
      // additional helpers go here
    }
  });
}
