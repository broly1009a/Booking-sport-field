import api from "../index";
import { handleApiCall } from "../../utils/handleApi";

export const categoryPolicyService = {
    createCategory: (data) => 
        handleApiCall(() => api.post("/category-policy", data)),

    getCategories: () => 
        handleApiCall(() => api.get("/category-policy")),

    getCategoryById: (id) => 
        handleApiCall(() => api.get(`/category-policy/${id}`)),

    updateCategory: (id, data) => 
        handleApiCall(() => api.put(`/category-policy/${id}`, data)),

    deleteCategory: (id) => 
        handleApiCall(() => api.delete(`/category-policy/${id}`)),
};