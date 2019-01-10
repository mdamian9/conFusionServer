const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        console.log(req.user);
        Favorites.findOne({ user: req.user._id }).populate('dishes').then((result) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.findOne({ user: req.user._id }).then((favorite) => {
            if (favorite === null) {
                if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
                    favoriteBody = [];
                } else {
                    favoriteBody = req.body;
                };
                Favorites.create({ user: req.user, dishes: favoriteBody }).then((result) => {
                    console.log('New favorite created', result);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(result);
                }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                favorite.dishes.push(req.body);
                favorite.save();
                Favorites.findOne({ user: req.user._id }).populate('dishes').then((result) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(result);
                }, (err) => next(err))
                    .catch((err) => next(err));
            };
        });
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({}).then((result) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        }, (err) => next(err))
            .catch((err) => next(err));
    }
);

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        Favorites.findById(req.params.dishId).populate('dishes').then((result) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    Favorites.findOne({ user: req.user._id }).then((result) => {
                        if (result !== null) {
                            result.dishes.push(req.params.dishId);
                            result.save()
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate('dishes')
                                        .then((dish) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(dish);
                                        })
                                }, (err) => next(err));
                        } else {
                            err = new Error('Favorties list for user ' + req.user._id + ' not found');
                            err.status = 404;
                            return next(err);
                        }
                    }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findByIdAndRemove(req.params.dishId).then((result) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        }, (err) => next(err))
            .catch((err) => next(err));
    }
);

module.exports = favoriteRouter;
