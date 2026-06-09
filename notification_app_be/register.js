const axios = require('axios');

async function registerMe() {
    const registrationData = {
        email: "simran.23b0101251@abes.ac.in", 
        name: "Simran",                         
        mobileNo: "8851768995",         
        githubUsername: "SIMRAN-001", 
        rollNo: "2300320100249",     
        accessCode: "cXuqht"    
    };

    try {
        const response = await axios.post("http://4.224.186.213/evaluation-service/register", registrationData);
        console.log("================ REGISTRATION SUCCESS ================");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("======================================================");
        console.log("⚠️ COPY AND SAVE THE CLIENT_ID AND CLIENT_SECRET NOW!");
    } catch (error) {
        console.error("Registration failed:", error.response ? error.response.data : error.message);
    }
}

registerMe();