const { Guest } = require('../models/index');

class GuestService {
    /**
    * author: XXX
    */
    getAllGuests = async () => {
        return await Guest.find();
    }

    /**
    * author: XXX
    */
    insertGuest = async (name, phoneNumber, email) => {
        const newGuest = new Guest({ name, phoneNumber, email });
        await newGuest.save();
        return {
            data: newGuest
        }
    }
}

module.exports = new GuestService;
