const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const expresserror = require("./utils/expresserror.js");
const { listingSchema,reviewSchema }=require("./schema.js");
const Review = require("./models/review.js");
//const flash = require('connect-flash');

const ListingsRouter = require('./routes/listing.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});



const validateReview= (req,res,next) => {
  let{error}= reviewSchema.validate(req.body);
  if (error) {
    let errmsg=error.details.map((el)=> el.message).join(",")
    throw new expresserror(400,errmsg);
  }else{
    next();
  }
};

app.use("/Listings" , ListingsRouter);


//reviews

app.post("/listings/:id/review", validateReview,wrapAsync(async( req, res) => {
   let listing = await Listing.findById(req.params.id);
   let newReview =new Review(req.body.review);

   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();
   req.flash("success","New Review Added!");

   res.redirect(`/listings/${listing._id}`);
}));

//Delete Reviews
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req, res) => {
  let {id, reviewId}= req.params;
 await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
 await Review.findByIdAndDelete(reviewId);
 //req.flash("success","New Review Deleted!");
 

 res.redirect(`/listings/${id}`);
}

));

app. all("*",(req,res,next) => {
  next(new expresserror(404, "page not found"));
});
app.use((err , req, res, next) =>{
  let { statusCode = 500 ,  message = "Something went wrong" } = err;
  res.status(statusCode).render("Error.ejs" , { message });
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
}); 