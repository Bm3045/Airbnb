const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const passport = require('passport');
const expresserror = require("./utils/expresserror.js");
const { listingSchema,reviewSchema }=require("./schema.js");
const Review = require("./models/review.js");
const flash = require('connect-flash');
const session = require('express-session');

const LocalStrategy = require('passport-local');


const ListingsRouter = require('./routes/listing.js');
const userRouter = require('./routes/user.js');


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
const sessionOption = 
{ 
  secret: "mysupersecrectcode" ,
 resave : false , 
 saveUninitialized :true,
 cookie :{
  expires : Date.now() * 7 * 24 * 60 * 60 * 1000,
  maxAge :  7 * 24 * 60 * 60 * 1000,
  httpOnly : true,
}

};

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curUser = req.user;
  next();  
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
app.use("/",userRouter);

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
 req.flash("success"," Review Deleted!");
 

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