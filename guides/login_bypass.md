# 🔓 ZTE Login Bypass (Pass-the-Hash)

This guide allows you to access the router's web interface (WebUI) when you possess a dump of the data partition (`zterw`) but do not know the plaintext password.

The method exploits ZTE's authentication logic, which uses a SHA256 Hash of the password. If you know the hash, you can calculate the correct answer to the login challenge (Challenge-Response) without ever knowing the original password.

---

## ✅ Prerequisites

1.  **Partition Dump:** You must have the `zterw.bin` file (Data partition).
2.  **Web Browser:** Chrome, Edge, or Firefox (Developer Console required).
3.  **Extraction Tool:** [ubidump](https://github.com/nlitsme/ubidump) (to extract the filesystem from the `.bin` file).

---

## 🚀 Procedure

### Phase 1: Retrieve Credentials from the Dump

1.  Extract `zterw.bin` using the `ubidump` tool.
2.  Navigate to the extracted path:  
    `etcrwfs/ztembb/configs/`
3.  Open the file named **`2860`** with a text editor.
4.  **Locate User/Pass Parameters (Priority Order):**
    Check for the following keys. **If "Priority 1" keys exist, use them and ignore the others.**

    * **Priority 1: ISP/Branded Keys (e.g., Vodafone)**
        * *Check these first. If present, they replace the standard admin credentials.*
        * **Username:** `web_username1` (or `web_username2`, etc.)
        * **Password Hash:** `web_password1` (or `web_password2`, etc.)

    * **Priority 2: Standard Keys (Generic/Stock)**
        * *Use these only if the "web_" keys are missing.*
        * **Username:** `admin_User`
        * **Password Hash:** `admin_Password`

5.  **Copy the Password Hash:**
    * Copy the alphanumeric string value associated with the identified key (this is the **SHA256 Hash**).

> [!TIP]
> **Example Data:**
> * **Username:** `admin` (found in `web_username1`)
> * **Hash:** `26D4C3A79414890AE8F40FFD89527671B436E1AF26E647DDC38A5770741235BB` (found in `web_password1`)


---

### Phase 2: Login via Console (JavaScript)

1.  Open the router's login page (e.g., `192.168.254.1` or `192.168.192.1`).
2.  Press **F12** to open the Developer Tools and go to the **Console** tab.
3.  Copy the content of the **[Login Bypass Script](../tools/login_with_hash.js)**.
4.  Paste it into the console and press **Enter**.
5.  Follow the prompts:
    * **Username:** Enter the Username retrieved in Phase 1.
    * **Hash:** Paste the SHA256 Hash retrieved in Phase 1.

---

### Phase 3: Permanently Change Password (Forced or Voluntary)

You will need to perform this step in two scenarios:
* **Forced Change:** The router blocks access immediately after login ("Security Risk" page) and forces a password update.
* **Voluntary Change:** You want to set a known password to avoid using the Console Script for every future login.

**The Problem:**
The standard "Change Password" form requires the **"Old Password"** in plain text, which you do not know.

**The Solution:**
Use the following script to bypass the check by sending the *Old Hash* instead of the *Old Password*.

1.  Navigate to the **Change Password** page (if not already there).
2.  Open the **Console (F12)**.
3.  Copy the content of the **[Change Password Script](../tools/change_password_with_hash.js)**.
4.  Paste it into the console and press **Enter**.
5.  Follow the prompts:
    * **Old Hash:** Paste the SHA256 Hash from Phase 1.
    * **New Password:** Enter your desired new password.

The script sends a crafted request using the *Old Hash* to validate the session and sets your *New Password*.

---

## 🧠 Technical Explanation

ZTE routers use a **Challenge-Response** mechanism to avoid sending passwords in plain text:

1.  The Client (Browser) requests a random Salt (**LD**) from the Router.
2.  The Client calculates the signature:  
    `Signature = SHA256( Stored_Hash + Salt )`
    *(Where `Stored_Hash` is usually SHA256(Password))*
3.  The Server compares the received signature with its own calculation.

**The Exploit:**
Since the database on the router stores the `admin_Password` as `SHA256(Password)`, the "Stored Hash" **IS** the secret key required for the calculation.
By injecting the hash directly into the calculation chain (skipping the first SHA256 of the plain text), we can generate a valid signature that the router accepts as a legitimate login.
