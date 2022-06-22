const knex = require("./knex");

function createColor(color) {
    return knex("colors").insert(color);
}

function getAllColors() {
    return knex("colors").select("*");
}

function getColor(id) {
    return knex("colors").where("id", id);
}

function deleteColor(id) {
    return knex("colors").where("id", id).del();
}

function updateColor(id, color) {
    return knex("colors").where("id", id).update(color);
}

module.exports = {
    createColor,
    getAllColors,
    getColor,
    deleteColor,
    updateColor
}