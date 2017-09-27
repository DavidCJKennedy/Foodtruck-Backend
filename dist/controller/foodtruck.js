"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require("express");

var _foodtruck = require("../model/foodtruck");

var _foodtruck2 = _interopRequireDefault(_foodtruck);

var _review = require("../model/review");

var _review2 = _interopRequireDefault(_review);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _authMiddleware = require("../middleware/authMiddleware");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  //CRUD - Creat read update delete

  // "/v1/foodtruck/add" - Create
  api.post("/add", _authMiddleware.authenticate, function (req, res) {
    // auth locks down
    var newFoodTruck = new _foodtruck2.default();
    newFoodTruck.name = req.body.name;
    newFoodTruck.foodtype = req.body.foodtype;
    newFoodTruck.avgcost = req.body.avgcost;
    newFoodTruck.geometry.coordinates.lat = req.body.geometry.coordinates.lat;
    newFoodTruck.geometry.coordinates.long = req.body.geometry.coordinates.long;

    newFoodTruck.save(function (err) {
      if (err) {
        res.send(err);
      }
      res.json({ message: "FoodTruck saved" });
    });
  });

  // '/v1/foodtruck' - read return all
  api.get("/", function (req, res) {
    _foodtruck2.default.find({}, function (err, foodtrucks) {
      //{something} {} gets everything
      if (err) {
        res.send(err);
      }
      res.json(foodtrucks);
    });
  });

  // '/v1/foodtruck/:id' - Read return by id
  api.get('/:id', function (req, res) {
    _foodtruck2.default.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.send(err);
      }
      res.json(foodtruck);
    });
  });

  // '/v1/foodtruck/:id' - Update
  api.put('/:id', _authMiddleware.authenticate, function (req, res) {
    _foodtruck2.default.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.send(err);
      }
      foodtruck.name = req.body.name; //pass name in request and change
      foodtruck.foodtype = req.body.foodtype;
      foodtruck.avgcost = req.body.avgcost;
      foodtruck.geometry.coordinates.lat = req.body.geometry.coordinates.lat;
      foodtruck.geometry.coordinates.long = req.body.geometry.coordinates.long;
      foodtruck.save(function (err) {
        if (err) {
          res.send(err);
        }
        res.json({ message: "FoodTruck info updated" });
      });
    });
  });

  // '/v1/foodtruck/:id' - Delete
  api.delete('/:id', _authMiddleware.authenticate, function (req, res) {
    _foodtruck2.default.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (foodtruck === null) {
        res.status(404).send("Foodtruck not found");
        return;
      }
      _foodtruck2.default.remove({
        _id: req.params.id
      }, function (err, foodtruck) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        _review2.default.remove({ foodtruck: req.params.id }, function (err, review) {
          if (err) {
            res.send(err);
          }res.json({ message: "Food truck and reviews removed" });
        });
      });
    });
  });

  // add review for a specific foodtruck id
  //"/v1/foodtruck/reviews/add/:id"
  api.post("/reviews/add/:id", _authMiddleware.authenticate, function (req, res) {
    _foodtruck2.default.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.send(err);
      }
      var newReview = new _review2.default();

      newReview.title = req.body.title;
      newReview.text = req.body.text;
      newReview.foodtruck = foodtruck._id;
      newReview.save(function (err, review) {
        if (err) {
          res.send(err);
        }
        foodtruck.reviews.push(newReview);
        foodtruck.save(function (err) {
          if (err) {
            res.send(err);
          }
          res.json({ message: "Food truck review saved" });
        });
      });
    });
  });

  // get reviews for a specific food truck id
  // "/v1/foodtruck/reviews/:id"
  api.get("/reviews/:id", function (req, res) {
    _review2.default.find({ foodtruck: req.params.id }, function (err, reviews) {
      if (err) {
        res.send(err);
      }
      res.json(reviews);
    });
  });

  //get reviews for specific foodtype
  ///v1/foodtruck/foodtype/:foodtype
  api.get("/foodtype/:foodtype", function (req, res) {
    _foodtruck2.default.find({ foodtype: req.params.foodtype }, function (err, foodtype) {
      if (err) {
        res.send(err);
      }
      res.json(foodtype);
    });
  });

  return api;
};
//# sourceMappingURL=foodtruck.js.map