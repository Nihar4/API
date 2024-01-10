function isEmpty(value) {
    return value === undefined || value === null || value === '';
}

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}

function checkLength(value, length) {
    return value.length == length;
}

module.exports = {
    isEmpty,
    validateEmail,
    checkLength,
};
