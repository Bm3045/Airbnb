const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
 const ExpressError = require("../utils/expresserror.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js")


const validateListing= (req,res,next) => {
    let{error}= listingSchema.validate(req.body);
    if (error) {
      let errmsg=error.details.map((el)=> el.message).join(",")
      throw new expresserror(400, errmsg);
    }else{
      next();
    }
  };


//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
  //New Route
  router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
  });
  
  //Show Route
  router.get("/:id",wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flsh("error","Lising you requested for does  not exit");
      res.redirected("/listings");
    }
    res.render("listings/show.ejs", { listing });
  }));
  
  //Create Route
  router.post("/",wrapAsync (async (req, res) => {
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    
    
  }));
  
  //Edit Route
  router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    req.flash("success"," Listing Edit!");
    res.render("listings/edit.ejs", { listing });
  }));
  
  
  
  //Update Route
  router.put("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing Updated !");
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  router.delete("/:id",wrapAsync (async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success"," Listing Deleted");
    console.log(deletedListing);
    res.redirect(`/listings/${id}`);
  }));

  module.exports = router;