const { GuestService } = require('../services/index');

class GuestController {
    /**
    * method: POST
    * router(/api/v1/guest/get-current-user)
    * author: XXX
    */
    insertGuest = async (req, res, next) => {
        try {
            const { name, phoneNumber, email } = req.body;
            const guest = await GuestService.insertGuest(name, phoneNumber, email);
            return res.status(200).json(guest);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new GuestController;
