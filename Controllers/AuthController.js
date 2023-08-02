import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";

// REGISTERING A NEW USER

export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    firstname,
    lastname,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//npw after this, go and connect this controller with the Routes in the AuthRout.js

// LOGIN USER

export const loginUser = async (req, res) => {
  // Below are the data we are gonna be recieving from the users during the time of signin.
  const { username, password } = req.body;

  try {
    // First we will find a user with the username and password in our database/checking if the user already exists.
    const user = await UserModel.findOne({ username: username });

    // If user with the username is found... then validate the user by comparing the password the user gives, and the one we already have in the database and if both are same or true, then validations passes else an error would be returned.
    if (user) {
      const validateUser = await bcrypt.compare(password, user.password);

      // if user is valid written as validateUser? return 200, if not true return 400
      validateUser
        ? res.status(200).json(user)
        : res.status(400).json("Wrong Password");
    }
    // And if the user does not exist in our database, return 404,
    else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
