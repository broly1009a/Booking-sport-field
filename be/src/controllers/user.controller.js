const { UserService } = require('../services/index');
const { GuestService } = require('../services/index');
const { frontendUrl } = require('../utils/constants');


class UserController {
    /**
    * method: GET
    * router(/api/v1/user)
    * author: XXX
    */
    getAllUsers = async (req, res, next) => {
        try {
            const guests = await GuestService.getAllGuests();
            const users = await UserService.getAllUsers();
            res.status(200).json({
                data: {
                    users,
                    guests,
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: GET
    * router(/api/v1/user/authenticated)
    * author: XXX
    */
    getAllAuthenticatedUsers = async (req, res, next) => {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json({
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: GET
    * router(/api/v1/user/unauthenticated)
    * author: XXX
    */
    getAllUnauthenticatedUser = async (req, res, next) => {
        try {
            const guests = await GuestService.getAllGuests();
            res.status(200).json({
                data: guests,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: GET
    * router(/api/v1/user/get-current-user)
    * author: XXX
    */
    getCurrentUser = async (req, res, next) => {
        try {
            const user = req.user;
            return res.status(200).json({
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * method: POST
     * router(/api/v1/user/register-customer-account)
     * author: XXX
     */
    registerCustomerAccount = async (req, res, next) => {
        try {
            const { fname, lname, dob, phoneNumber, email, gender, password } = req.body;
            const role = "CUSTOMER";
            const newUser = await UserService.signUp(fname, lname, dob, phoneNumber, email,
                gender, role, password);
            return res.status(200).json({
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: POST
    * router(/api/v1/user/verify-email)
    * author: XXX
    */
    verifyEmail = async (req, res, next) => {
        try {
            const { uid } = req.query;
            await UserService.verifyEmail(uid);
            return res.redirect(`${frontendUrl}/verification-success`);
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: PATCH
    * router(/api/v1/user/update-customer-info)
    * author: XXX
    */
    updateCustomerInfo = async (req, res, next) => {
        try {
            const { fname, lname, dob, phoneNumber, gender } = req.body;
            const user = req.user;
            const data = await UserService.updateCustomerInfo(fname, lname, dob, phoneNumber, gender, user?.firebaseUID);
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: POST
    * router(/api/v1/user/send-email-verification)
     * author: XXX
     */
    sendEmailVerification = async (req, res, next) => {
        try {
            const { email } = req.body;
            const data = await UserService.sendEmailVerification(email);
            return res.status(200).json(data);;
        } catch (error) {
            next(error);
        }
    }

    /**
    * method: POST
    * router(/api/v1/user/reset-password)
    * author: XXX
    */
    resetPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const data = await UserService.resetPassword(email);
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    getPaginatedUsers = async (req, res, next) => {
        try {
            const { page, limit, search, role } = req.query;
            const users = await UserService.getPaginatedUsers(page, limit, search, role);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }
    registerAndVerifyAccount = async (req, res, next) => {
        try {
            const { fname, lname, dob, phoneNumber, email, gender, password,role } = req.body;
            const newUser = await UserService.signUpAndVerify(fname, lname, dob, phoneNumber, email, gender, role, password);
            return res.status(200).json({
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    }
    updateAccountInfo = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { fname, lname, dob, phoneNumber, gender, role } = req.body;
            const data = await UserService.updateAccountInfo(id, fname, lname, dob, phoneNumber, gender, role);
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    getEmailByFirebaseUID = async (req, res, next) => {
        try {
            const { firebaseUID } = req.params;
            const email = await UserService.getEmailByFirebaseUID(firebaseUID);
            res.status(200).json({ email });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController;
