const generateRandomPassword = (length = 12) => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_-+=<>?";

    const passwordArray = [
        lowercase[Math.floor(Math.random() * lowercase.length)],
        uppercase[Math.floor(Math.random() * uppercase.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];

    const allChars = lowercase + uppercase + numbers + specialChars;
    for (let i = passwordArray.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        passwordArray.push(allChars[randomIndex]);
    }

    const shuffledPassword = passwordArray.sort(() => 0.5 - Math.random()).join('');

    return shuffledPassword;
};

module.exports = {
    generateRandomPassword
}