const Joi = require('joi');

module.exports = (body) => {
    const schema = {
        SearchQuery: Joi.string().required().allow('').min(0),
        paginationParameters: {
            PageNumber: Joi.number().min(0).required(),
            PageSize: Joi.number().min(0).required()
        },
        SortingParameters: {
            SortDirection: Joi.string().required().valid('desc', 'asc'),
            OrderBy: Joi.string().required()
        }
    };
    return Joi.validate(body, schema);
};