const axios = require('axios');

async function Log(stack, level, pkg, message, token) {
    const payload = {
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: pkg.toLowerCase(),
        message: message
    };

    try {
        const response = await axios.post("http://4.224.186.213/evaluation-service/logs", payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`[Server Log Sync] ${level.toUpperCase()}: ${message}`);
        return response.data;
    } catch (error) {
        // This fallback ensures that even if the logging token fails, 
        // it still prints out locally in your terminal so your program doesn't halt!
        console.log(`[Local Fallback View] ${level.toUpperCase()} | ${pkg.toUpperCase()}: ${message}`);
    }
}

module.exports = { Log };