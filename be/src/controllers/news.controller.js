const { NewsService } = require('../services/index');
const News = require('../models/news.models'); 

class NewsController {
    async getAllNews(req, res, next) {
        try {
            const newsList = await NewsService.getAllNews();
            res.status(200).json(newsList);
        } catch (err) {
            next(err);
        }
    }

    async getNewsById(req, res, next) {
        const { id } = req.params;
        try {
            const news = await NewsService.getNewsById(id);
            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }
            res.status(200).json(news);
        } catch (err) {
            next(err);
        }
    }

    async createNews(req, res, next) {
        try {
            const newsData = req.body;
            const createdNews = await NewsService.createNews(newsData);
            res.status(201).json(createdNews);
        } catch (err) {
            next(err);
        }
    }

    async updateNews(req, res, next) {
        const { id } = req.params;
        try {
            const updatedNews = await NewsService.updateNews(id, req.body);
            if (!updatedNews) {
                return res.status(404).json({ message: 'News not found' });
            }
            res.status(200).json(updatedNews);
        } catch (err) {
            next(err);
        }
    }

    async deleteNews(req, res, next) {
        const { id } = req.params;
        try {
            const deleted = await NewsService.deleteNews(id);
            if (!deleted) {
                return res.status(404).json({ message: 'News not found' });
            }
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new NewsController();