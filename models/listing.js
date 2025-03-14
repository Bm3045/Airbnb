const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review.js");
const { ListingSchema } = require("../schema");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default: "https://images.pexels.com/photos/670720/pexels-photo-670720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    },
  ],
});

listingSchema.post("findOneAndDelete",async(listing)=> {
  if (listing) {
    await Review.deleteMany({reviews:{$in: listing.reviews}})
  }
  
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
