const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();


// REGISTER
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (users[username]) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users[username] = {
    password: password
  };

  return res.status(200).json({
    message: "User successfully registered. Now you can login"
  });
});


// INTERNAL BOOK DATA
public_users.get('/api/books', (req, res) => {
  return res.status(200).json(books);
});

public_users.get('/api/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(books[isbn]);
});


// GET ALL BOOKS - ASYNC/AWAIT + AXIOS
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/api/books");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});


// GET BOOK BY ISBN - ASYNC/AWAIT + AXIOS
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(
      "http://localhost:5000/api/books/" + isbn
    );

    return res.status(200).json(response.data);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    return res.status(500).json({
      message: "Unable to retrieve book"
    });
  }
});


// GET BOOKS BY AUTHOR - ASYNC/AWAIT + AXIOS
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get("http://localhost:5000/api/books");
    const result = {};

    for (let isbn in response.data) {
      if (
        response.data[isbn].author.toLowerCase() ===
        author.toLowerCase()
      ) {
        result[isbn] = response.data[isbn];
      }
    }

    if (Object.keys(result).length === 0) {
      return res.status(404).json({
        message: "Author not found"
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});


// GET BOOKS BY TITLE - ASYNC/AWAIT + AXIOS
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get("http://localhost:5000/api/books");
    const result = {};

    for (let isbn in response.data) {
      if (
        response.data[isbn].title.toLowerCase() ===
        title.toLowerCase()
      ) {
        result[isbn] = response.data[isbn];
      }
    }

    if (Object.keys(result).length === 0) {
      return res.status(404).json({
        message: "Title not found"
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});


// GET REVIEWS
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({
    message: "Book not found"
  });
});


module.exports.general = public_users;