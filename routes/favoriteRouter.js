const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then(user_favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user_favorites);
    }, err => next(err))
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(user => {
        if(user != null) {
            for(var i = 0; i < req.body.length; i++)
            {
                if(user.dishes.indexOf(req.body[i]._id) === -1)
                    user.dishes.push(req.body[i]._id);
            }
            user.save()
            .then(favorites => {
                Favorites.findById(favorites._id)
                // .populate('user')
                .populate('dishes')
                .then(user_favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user_favorites);
                });
            }, err => next(err))
        }
        else {
            Favorites.create({'user': req.user._id, 'dishes': req.body})
            .then(favorites => {
                Favorites.findById(favorites._id)
                // .populate('user')
                .populate('dishes')
                .then(user_favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user_favorites);
                });
            }, err => next(err))
        }
    }, err => next(err))
    .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id})
    .then(resp => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, err => next(err))
    .catch(err => next(err));  
});

// .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
//     Favorite.findById(req.user._id)
//     .then((favorite) => {
//             for (var i = (favorite.dishes.length -1); i >= 0; i--) {
//                 favorite.dishes.id(favorite.dishes[i]._id).remove();
//             }
//             favorite.save()
//             .then((favorite) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorite);                
//             }, (err) => next(err));
        
//     }, (err) => next(err))
//     .catch((err) => next(err));     
// });


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(user => {
        if(user != null && user.dishes.indexOf(req.params._id) === -1) {
            user.dishes.push(req.params._id);
            user.save()
            .then(favorites => {
                Favorites.findById(favorites._id)
                // .populate('user')
                .populate('dishes')
                .then(user_favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user_favorites);
                });
            }, err => next(err))
        }
        else if (user == null) {
            Favorites.create({'user': req.user._id, 'dishes': [req.params.dishId]})
            .then(favorites => {
                Favorites.findById(favorites._id)
                // .populate('user')
                .populate('dishes')
                .then(user_favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user_favorites);
                });
            }, err => next(err))
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({'message': 'Already exists'});
        }
    }, err => next(err))
    .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(user => {
        if (user != null) {            
            dish_index = user.dishes.indexOf(req.params.dishId);
            if (dish_index >= 0) {
                user.dishes.splice(dish_index, 1);
                user.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, err => next(err));
            }
            else {
                err = new Error('Favorite dish with ' + req.params.dishId + 'id doesn\'t exist');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('User doesn\'t have favorite dishs section');
            err.status = 404;
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
});

// .delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
//     Favorites.updateOne({user: req.user._id}, { $pull: {dish: req.params.dishId } } )
//         .then(
//         (resp) => {
//             res.statusCode = 200;
//             res.setHeader("content-Type", "application/json");
//             res.json(resp);
//         },
//         (err) => next(err)
//         )
//         .catch((err) => next(err));
// });

// .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
//     Favorite.findById(req.user._id)
//     .then((favorite) => {
//             favorite.dishes.id(req.params.dishId).remove();
//             favorite.save()
//             .then((favorite) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorite);                
//             }, (err) => next(err));
        
//     }, (err) => next(err))
//     .catch((err) => next(err)); 
// });
  

module.exports = favoriteRouter;