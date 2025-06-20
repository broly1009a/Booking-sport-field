import api from './index'
import { handleApiCall } from '../utils/handleApi';

const GuestService = {
    insertGuest: async (filter) => {
        const { name, phoneNumber, email } = filter;
        return handleApiCall(() =>
            api.post("/guest/insert-guest", {
                name, phoneNumber, email
            })
        )
    }
}

export default GuestService;
