const express = require("express");
const router = new express.Router();
const UserModel = require("./../models/User");
const bcrypt = require("bcrypt"); // lib to encrypt data

router.get("/signin", async (req, res, next) => {
  res.render("signin");
});

router.post("/signin", async (req, res, next) => {
  // DO something
  //   res.render("auth/signin.hbs");
  const { email, password } = req.body;
  const foundUser = await UserModel.findOne({ email: email });

  if (!foundUser) {
    //   Display an error message telling the user that either the password
    // or the email is wrong
    req.flash("error", "Invalid credentials");
    res.redirect("/signin");
    console.log("notfounduser");
    // res.render("auth/signin.hbs", { error: "Invalid credentials" });
  } else {
    // https://www.youtube.com/watch?v=O6cmuiTBZVs
    const isSamePassword = bcrypt.compareSync(password, foundUser.password);
    if (!isSamePassword) {
      // Display an error message telling the user that either the password
      // or the email is wrong
      req.flash("error", "Invalid credentials");
      res.redirect("/signin");
      console.log("wrongPassword");
      // res.render("auth/signin.hbs", { error: "Invalid credentials" });
    } else {
      //
      // Authenticate the user...
      const userDocument = { ...foundUser };
      const userObject = foundUser.toObject();
      delete userObject.password; // remove password before saving user in session
      // console.log(req.session, "before defining current user");
      req.session.currentUser = userObject; // Stores the user in the session (data server side + a cookie is sent client side)
      console.log("you got in!");
      // https://www.youtube.com/watch?v=nvaE_HCMimQ
      // https://www.youtube.com/watch?v=OFRjZtYs3wY

      req.flash("success", "Successfully logged in...");
      res.redirect("/dashboard");
    }
  }
});

router.get("/signup", async (req, res, next) => {
  res.render("signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const newUser = { ...req.body };
    const foundUser = await UserModel.findOne({ email: newUser.email });

    if (foundUser) {
      req.flash("warning", "Email already registered");
      res.redirect("/signin");
    } else {
      const hashedPassword = bcrypt.hashSync(newUser.password, 10);
      newUser.password = hashedPassword;
      await UserModel.create(newUser);
      req.flash("success", "Congrats ! You are now registered !");
      res.redirect("/dashboard");
    }
  } catch (error) {
    next(error);
  }
});

router.get("/signout", async (req, res, next) => {
  req.session.destroy(function (err) {
    // cannot access session here
    // console.log(req.session.currentUser);
    res.redirect("/signout");
  });
});

module.exports = router;
