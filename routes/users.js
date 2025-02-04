const router = require("express").Router();
const userAuth = require("../middleware/auth");
const validateEmail = require("../middleware/validateEmail");
const upload = require("../middleware/upload");
const {
  register,
  login,
  update,
  getCurrent,
  logout,
  updateAvatar,
  verifyTokenfromEmail,
  verifyAgain,
} = require("../controllers/Auth");

router.post("/signup", register);
router.post("/login", login);
router.get("/current", userAuth, getCurrent);
router.get("/verify/:verificationToken", verifyTokenfromEmail);
router.post("/verify", validateEmail(), verifyAgain);
router.post("/logout", userAuth, logout);
router.patch("/", userAuth, update);
router.patch("/avatars", userAuth, upload.single("avatars"), updateAvatar);
module.exports = router;
