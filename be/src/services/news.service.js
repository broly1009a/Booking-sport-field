const NewsModels = require("../models/news.models");

class NewsService {
    async createNews(newsData) {
        const news = new NewsModels(newsData);
        return await news.save();

    }

    async getAllNews() {
        return await NewsModels.find().sort({ createdAt: -1 });
    }

    async getNewsById(id) {
        return await NewsModels.findById(id);
    }

    async updateNews(id, data) {
        return await NewsModels.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteNews(id) {
        return await NewsModels.findByIdAndDelete(id);
    }
}

module.exports = new NewsService();