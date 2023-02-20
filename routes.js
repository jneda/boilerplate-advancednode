const passport = require("passport");

module.exports = function (app, myDataBase) {
  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please log in",
      showLogin: true,
      showRegistration: true,
    });
  });

  app
    .route("/login")
    .post(
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      }
    );

  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.route("/register").post(
    (req, res, next) => {
      myDataBase.findOne({ username: req.body.username }, (err, user) => {
        if (err) return next(err);
        if (user) return res.redirect("/");
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.insertOne(
          {
            username: req.body.username,
            password: hash,
          },
          (err, doc) => {
            if (err) return res.redirect("/");
            next(null, doc.ops[0]);
          }
        );
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => res.redirect("/profile")
  );

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render("profile", {
      username: req.user.username,
    });
  });

  app.use((req, res, next) => {
    res.status(404).type("text").send("Not found");
  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
