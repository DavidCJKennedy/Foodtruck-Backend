import mongoose from "mongoose";
import {Router} from "express";
import FoodTruck from "../model/foodtruck";
import Review from "../model/review"
import bodyParser from "body-parser";
import passport from "passport";

import { authenticate } from "../middleware/authMiddleware";

export default({ config, db }) => {
  let api = Router();

//CRUD - Creat read update delete

  // "/v1/foodtruck/add" - Create
  api.post("/add", authenticate, (req, res) => { // auth locks down
    let newFoodTruck = new FoodTruck();
    newFoodTruck.name = req.body.name;
    newFoodTruck.foodtype = req.body.foodtype;
    newFoodTruck.avgcost = req.body.avgcost;
    newFoodTruck.geometry.coordinates.lat = req.body.geometry.coordinates.lat;
    newFoodTruck.geometry.coordinates.long = req.body.geometry.coordinates.long;


    newFoodTruck.save(err => {
      if (err) {
        res.send(err);
      }
      res.json({message: "FoodTruck saved"})
    });
  });

  // '/v1/foodtruck' - read return all
  api.get("/", (req, res) => { 
    FoodTruck.find({}, (err, foodtrucks) => { //{something} {} gets everything
      if (err) {
        res.send(err);
      }
      res.json(foodtrucks);
    });
  });

// '/v1/foodtruck/:id' - Read return by id
api.get('/:id', (req, res) => {
  FoodTruck.findById(req.params.id, (err, foodtruck) => {
    if (err) {
      res.send(err);
    }
    res.json(foodtruck)
  });
});

// '/v1/foodtruck/:id' - Update
api.put('/:id', authenticate, (req, res) => {
  FoodTruck.findById(req.params.id, (err, foodtruck) => {
    if (err) {
      res.send(err);
    }
    foodtruck.name = req.body.name; //pass name in request and change
    foodtruck.foodtype = req.body.foodtype;
    foodtruck.avgcost = req.body.avgcost;
    foodtruck.geometry.coordinates.lat = req.body.geometry.coordinates.lat;
    foodtruck.geometry.coordinates.long = req.body.geometry.coordinates.long;
    foodtruck.save(err => {
      if (err) {
        res.send(err);
      }
      res.json({message: "FoodTruck info updated"});
    });
  });
});

// '/v1/foodtruck/:id' - Delete
api.delete('/:id', authenticate, (req, res) => {
 FoodTruck.findById(req.params.id, (err, foodtruck) => {
   if (err) {
     res.status(500).send(err);
     return;
}
   if (foodtruck === null) {
     res.status(404).send("Foodtruck not found");
     return;
}
  FoodTruck.remove({
    _id: req.params.id
  }, (err, foodtruck) => {
    if (err) {
      res.status(500).send(err);
	return;
    }
Review.remove({ foodtruck: req.params.id},
 (err,review) => {
if (err) {
res.send(err);
} res.json({message: "Food truck and reviews removed" });
   });
  });
 });
});

// add review for a specific foodtruck id
//"/v1/foodtruck/reviews/add/:id"
api.post("/reviews/add/:id", authenticate, (req, res) => {
  FoodTruck.findById(req.params.id, (err, foodtruck) => {
    if (err) {
      res.send(err);
    }
    let newReview = new Review();


    newReview.title = req.body.title;
    newReview.text = req.body.text;
    newReview.foodtruck = foodtruck._id
    newReview.save((err, review) => {
      if (err){
        res.send(err);
      }
      foodtruck.reviews.push(newReview);
      foodtruck.save(err => {
        if (err) {
          res.send(err);
        }
        res.json({message: "Food truck review saved"});
      });
    });
  });
});

// get reviews for a specific food truck id
// "/v1/foodtruck/reviews/:id"
api.get("/reviews/:id", (req, res) => {
  Review.find({foodtruck: req.params.id}, (err, reviews) => {
    if (err) {
      res.send(err);
    }
    res.json(reviews);
  });
});

//get reviews for specific foodtype
///v1/foodtruck/foodtype/:foodtype
api.get("/foodtype/:foodtype", (req, res) => {
  FoodTruck.find({foodtype: req.params.foodtype}, (err, foodtype) => {
    if (err) {
      res.send(err);
    }
    res.json(foodtype);
  });
});

  return api;
}
