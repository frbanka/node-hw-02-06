const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const User = require("../models/User");
const fs = require("fs/promises");

const path = require("path");
const Jimp = require("jimp");

const { v4: uuidv4 } = require("uuid");
const sendVerifyEmail = require("../config/verifyEmail");
const BASE_URL = "http://localhost:3000";
require("dotenv").config();

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const registeredUsed = await User.findOne({ email });
  try {
    if (registeredUsed) {
      res.status(409).json({
        message: "Email in use",
      });
    } else {
      const verifyToken = uuidv4();
      bcrypt.hash(password, 10).then(async (hash) => {
        await User.create({
          email,
          password: hash,
          verificationToken: verifyToken,
        }).then((user) =>
          res.status(201).json({
            message: "User successfully created",
            user,
          })
        );
        const verifyEmail = {
          to: email,
          subject: "Verify email",
          html: `<a target="_blank" href="${BASE_URL}/users/verify/${verifyToken}">Click verify email</a>`,
        };
        await sendVerifyEmail(verifyEmail);
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "User not successful created",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const registeredUser = await User.findOne({ email });

  // Check if username and password is provided
  if (!email || !password) {
    return res.status(400).json({
      message: "Email or Password not present",
    });
  }
  if (!registeredUser) {
    res.status(401).json({
      message: "Login not successful",
      error: "User not found",
    });
  }
  if (registeredUser.verify === false) {
    return res.status(400).send("verify your email");
  }
  const isValidPassword = await bcrypt.compare(
    password,
    registeredUser.password
  );
  if (!isValidPassword) {
    res.status(401).json({ message: "Email or password is wrong" });
  }
  const payload = { id: registeredUser._id };
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  await User.findByIdAndUpdate(registeredUser._id, { token });
  res.status(200).json({
    token,
    registeredUser,
  });
};

exports.update = async (req, res) => {
  const { subscription, _id } = req.body;
  const subscriptions = ["starter", "pro", "business"];

  if (!subscriptions.includes(subscription)) {
    res.status(400).json({ message: "There is no such subscription" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.status(200).json({
    message: "Update successfull",
    data: subscription,
    updatedUser,
  });
};
exports.getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    email,
    subscription,
  });
};
exports.logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204);
};
exports.updateAvatar = async (req, res) => {
  const { user } = req;
  const { filename, path: filepath } = req.file;
  const tmpPath = await path.resolve(__dirname, "../tmp", filename);
  const publicPath = await path.resolve(
    __dirname,
    "../public/avatars",
    filename
  );
  try {
    const img = await Jimp.read(filepath);
    await img.resize(250, 250).writeAsync(filepath);
    await fs.rename(tmpPath, publicPath);
  } catch (error) {
    console.log(error.message);
    await fs.unlink(tmpPath);
    return res
      .status(404)
      .json({ error: error.status, message: error.message });
  }
  const avatarsPath = `/public/avatars/${filename}`;
  const updateUser = await User.findByIdAndUpdate(
    user._id,
    { avatarURL: avatarsPath },
    { new: true }
  );
  return res.status(200).json({
    data: {
      user: {
        imageUrl: updateUser.avatarURL,
      },
    },
  });
};
exports.verifyTokenfromEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};
exports.verifyAgain = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Email is wrong" });
    }

    if (user.verify) {
      res.status(400).json({ message: "Verification has already been passed" });
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click verify email</a>`,
    };

    await sendVerifyEmail(verifyEmail);

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};
