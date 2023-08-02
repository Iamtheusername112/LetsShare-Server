import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";

// Get a user

export const getUser = async (req, res) => {
  // first we will fetch the id of the user from the request, and we will send the id in the parameters of the url...
  const id = req.params.id;

  // after that we will check if this user exist in our database
  const user = await UserModel.findById(id);

  try {
    // So if user exists, then we send a status of 300
    if (user) {
      // now we would have to remove the password because we dont need it here
      const { password, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("User does not exist");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// UPDATE A USER

export const updatUser = async (req, res) => {
  // first we will get the id from the params, the id here is the id of the user that should be updated in the response
  const id = req.params.id;

  // Now we will fetch some data from the body of the request, currentUserId is the user who is performing the action of updating
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  // If the person updating the id belongs to the same account ie, i have an account in a social media and I want to update my account, so the first in the if statement is the condition, and the other condition is if the admin of this application wants to update the user.. So in both senarios we will perform the functionality of updating the user.

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      // If the user would want to update their password, this handles that, and their new password will also be hashed

      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      // Here the id is saying in the database, who should we update?, the req.body is the information that should be updated in the response, so the new info will lay in the req.body and the 3rd parameter new = true means in the response we want to get the updated and not the previous user

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("Access denied!!, you can only update your own profile");
  }
};

// DELETE USER

export const deleteUser = async (req, res) => {
  //Again we will get the id from the params, the id here is the id of the user that should be deleted in the response
  const id = req.params.id;

  // Here it means its only the user who owns the account or the Admin which can delete this account
  const { currentUserId, currentUserAdminStatus } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      req.status(200).json("User deleted Successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json({ msg: "Access denied!!, you can only delete your own profile" });
  }
};

// Follow user

export const followUser = async (req, res) => {
  //Again we will get the id from the params, the id here is the id of the user that should be followed in the response
  const id = req.params.id;

  // Now we have to destructure the currentUserId who wants to follow another user, here the currentUserId is the user who wants to follow
  const { currentUserId } = req.body;

  // First we have to check if the current user wants to follow him/herself which is not possible, so we should restrict him/her from doing so, cos no one can follow him/herself

  if (currentUserId === id) {
    res.status(403).json({ msg: "Action forbidden" });
  } else {
    try {
      //   First we will find the follow user and this is basically the user who we want to follow
      const followUser = await UserModel.findById(id);

      //   followingUser here is the user who wants to follow the "followUser"
      const followingUser = await UserModel.findById(currentUserId);

      // Here we will check if our currentUser is not already present in the followers of our desired user, then inside his follwers array, we will push the currentUserId,
      if (!followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $push: { followers: currentUserId } });

        // along side we should also update the following array of our current user
        await followingUser.updateOne({ $push: { following: id } });

        res.status(200).json("User followed");
      } else {
        res.status(403).json("User is already followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// Follow user

export const unFollowUser = async (req, res) => {
  //Again we will get the id from the params, the id here is the id of the user that should be followed in the response
  const id = req.params.id;

  // Now we have to destructure the currentUserId who wants to follow another user, here the currentUserId is the user who wants to follow
  const { currentUserId } = req.body;

  // First we have to check if the current user wants to follow him/herself which is not possible, so we should restrict him/her from doing so, cos no one can follow him/herself

  if (currentUserId === id) {
    res.status(403).json({ msg: "Action forbidden" });
  } else {
    try {
      //   First we will find the follow user and this is basically the user who we want to follow
      const followUser = await UserModel.findById(id);

      //   followingUser here is the user who wants to follow the "followUser"
      const followingUser = await UserModel.findById(currentUserId);

      // Here we will check if our currentUser is already present in the followers of our desired user, then inside his follwers array, we will pull the currentUserId,
      if (followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $pull: { followers: currentUserId } });

        // along side we should also update the following array of our current user
        await followingUser.updateOne({ $pull: { following: id } });

        res.status(200).json("User unfollowed");
      } else {
        res.status(403).json("User is is not followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
