const Joi = require("joi");

module.exports.ListingSchema = Joi.object({
      listing:Joi.object({
      title:Joi.string().required(),
      description:Joi.string().required(),
      location:Joi.string().required(),
      country:Joi.string().required(),
      price:Joi.number().required().min(0),
      image:Joi.string().allow("",null),
      category:Joi.string().allow("new","room","iconic","artic","castle","mountain","water","farm","dome","camping","other"),
    }).required()
});



module.exports.reviewSchema = Joi.object({
  review:Joi.object({
  rating:Joi.number().required().min(1).max(5),
  comment:Joi.string().required(),
}).required()
});