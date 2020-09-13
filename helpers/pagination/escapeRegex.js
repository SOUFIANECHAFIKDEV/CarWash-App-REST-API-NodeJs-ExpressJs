function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = (SearchQuery) => {
    return new RegExp(escapeRegex(SearchQuery), 'gi');
};