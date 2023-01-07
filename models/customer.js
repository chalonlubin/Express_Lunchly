"use strict";

/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  //** getter for notes. */
  get notes() {
    return this._notes
  }
  //** setter for notes. */
  set notes(content) {
    if (!content) {
      content = ""
    } else {
      this._notes = content;
    }
  };

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`
    );
    return results.rows.map((c) => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }


  /** search a customer by search bar input. */

  static async search(term) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
              FROM customers as "c"
              WHERE c.first_name ILIKE $1
              OR c.last_name ILIKE $1`,
      [`%${term}%`]
    );

    return results.rows.map((c) => new Customer(c));
  }

  /** Gets top 10 customers with most reservations */
  static async topTen() {
    const results = await db.query(
      `SELECT c.id,
        first_name AS "firstName",
        last_name  AS "lastName"
      FROM customers as c
      JOIN reservations as r
      ON c.id = r.customer_id
      GROUP BY c.id
      ORDER BY COUNT(*) DESC
      LIMIT 10;`
    )

    return results.rows.map((c) => new Customer(c));
  }


  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** returns full customer name */
  fullName(prefix, middleName) {
    //TODO: implement prefix and middlename

    return `${this.firstName} ${this.lastName}`
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
