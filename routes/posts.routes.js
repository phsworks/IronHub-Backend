const express = require("express");
const router = express.Router();
const Post = require("../models/Post.model");
const Reply = require("../models/Reply.model");

/*Get all post */
router.get("/", async (req, res, next) => {
  // default sorting in ascending order
  const { course, sortBy = "created", order = "asc" } = req.query;

  try {
    const sortOrder = order === "asc" ? 1 : -1;
    const sortField = sortBy === "title" ? "title" : "created";
    const query = course && course !== "All Courses" ? { course } : {};

    let posts = await Post.find(query)
      .sort({ [sortField]: sortOrder })
      .populate("name", "name");

    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while displaying all the post" });
  }
});

/*Create a post */
router.post("/", async (req, res, next) => {
  const { name, course, title, description, link, picture, likes } = req.body;

  const newPost = {
    name,
    course,
    title,
    description,
    link,
    picture,
    likes,
  };

  try {
    const response = await Post.create(newPost);
    if (response) {
      res.json(response);
    } else {
      res
        .status(404)
        .json({ message: "There are no posts on forum, create a new one" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "An error occurred while creating a the post" });
  }
});

/*Get a post by title using search params*/

router.get("/search", async (req, res) => {
  const { title } = req.query;

  try {
    const response = await Post.find({
      title: { $regex: title, $options: "i" },
    }).populate("name", "name");

    if (response) {
      res.json(response);
    } else {
      res.status(404).json({ message: "No post found with the given title!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while searching for the post" });
  }
});

/*Get a post by ID */
router.get("/:postId", async (req, res, next) => {
  const { postId } = req.params;

  try {
    const response = await Post.findById(postId)
      .populate("name", "name")
      .populate({
        path: "replies",
        populate: {
          path: "name",
          select: "name",
        },
      });
    if (response) {
      res.json(response);
    } else {
      res.status(404).json({ message: "No post found with this ID" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while searching for the post" });
  }
});

/*Delete a post by ID */
router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const response = await Post.findByIdAndDelete(postId);
    if (response) {
      res.json(response);
    } else {
      res.status(404).json({ message: "No post found with this ID" });
    }
  } catch (error) {
    res.status(500).json({ message: "The post could not be deleted" });
  }
});

/*Update a post by ID */
router.put("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const response = await Post.findByIdAndUpdate(postId, req.body, {
      new: true,
    });
    if (response) {
      res.json(response);
    } else {
      res.status(404).json({ message: "No post found with this ID" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred modifying the post" });
  }
});

module.exports = router;
