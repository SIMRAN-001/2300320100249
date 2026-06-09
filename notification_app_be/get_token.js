const axios = require('axios');

async function getAuthToken() {
    const authData = {
        email: "simran.23b0101251@abes.ac.in", 
        name: "Simran",                         
        rollNo: "2300320100249",     
        accessCode: "cXuqht",    
        clientID: "27e256ec-c205-4e9a-a019-7f41c0f6f5e9",     
        clientSecret: "uPSpJVecPqVPqkVE" 
    };

    try {
        const response = await axios.post("http://4.224.186.213/evaluation-service/auth", authData);
        console.log("================= YOUR ACCESS TOKEN =================");
        console.log(response.data.access_token);
        console.log("=====================================================");
    } catch (error) {
        console.error("Authentication failed:", error.response ? error.response.data : error.message);
    }
}

getAuthToken();