"use strict";

/** Routes for Lunchly */

const express = require("express");

const { BadRequestError } = require("./expressError");
const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  if (req.query.search) {
    const term = req.query.search;
    const customers =  await Customer.search(term);
    return res.render("search.html", { customers })
  } else {

  const customers = await Customer.all();
  return res.render("customer_list.html", { customers });
}});


//** Handle route to search for customers. */

// router.get("/search/", async function(req,res,next){
//   //TODO: how did the query string end up in the url?
//   if (req.query === undefined) {
//     throw new BadRequestError();
//   }
//   ;
// });

/** Handle route that displays 10 customers with most reservations */

router.get("/top-ten/", async function (req, res, next) {
  const customers = await Customer.topTen();
  return res.render("top-ten.html", { customers });
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});


/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  console.log("NOTES HERE",customer.notes = "Hello")
  console.log("NOTES HERE",customer.notes)
  const reservations = await customer.getReservations();
  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  console.log('customer',customer);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});


/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

module.exports = router;
