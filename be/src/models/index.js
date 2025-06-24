const Guest = require('./guest.model');
const User = require('./user.model');
const Type = require('./type.model');
const SportField = require('./sportField.model');
const Equipment = require('./equipment.model'); 
const Consumable = require('./consumable.model');
const Booking = require('./booking.model');
const Maintenance = require('./maintenance.model');
const ConsumablePurchase = require('./consumablePurchase.model');
const EquipmentRental = require('./equipmentRental.model');
const Blacklist = require('./blacklist.model');
module.exports = {
    Guest,
    User,
    Type,
    SportField,
    Equipment,
    Consumable,
    Booking,
    Maintenance,
    ConsumablePurchase,
    EquipmentRental,
    Blacklist
};
