# 🛠️ ZTE MC7010 / MC7010D Toolkit

Repository dedicated to **reverse engineering**, **modding**, and **recovery** of **ZTE MC7010** and **MC7010D** 5G outdoor routers (Qualcomm SDX55 Platform).

This project collects tools, scripts, and technical documentation to manage memory dumps, debrand devices, and recover lost administrative access without knowing the password.

---

## ⚠️ Disclaimer & Warnings

> [!IMPORTANT]
> **READ CAREFULLY BEFORE PROCEEDING**

> [!WARNING]
> **BRICK RISK**
> The procedures described here (EDL, Repack, Flash) involve significant risks. A single mistake can render the device unusable (brick).

> [!NOTE]
> **LIABILITY**
> The author assumes no responsibility for hardware damage, data loss, or voiding of the warranty. Use at your own risk.

---

## 📚 Guides & Documentation


### 🔓 1. Login Bypass (Pass-the-Hash)
**Lost your router's label, forgot the credentials, or bought a locked unit?**

This technique allows you to **regain administrative access** to the Web Interface and reset the password without knowing the original one.
It works by using the **SHA256 Hash** of the password, which can be recovered from a system dump, bypassing the need for the plain-text password.

📖 **[Read full guide: Login Bypass](guides/login_bypass.md)**

### 2. Restore & RAW Dump Cleaning (EDL)
> **[TODO] Work in Progress**
> This guide is currently being finalized.

*Planned content:*
* **Dump Cleaning:** How to remove trailing padding (`EE`) from raw `.bin` dumps using the provided Python script.
* **UBI Rebuilding:** Correctly extracting and reconstructing UBI partitions (`system`, `modem`, `zterw`, `recoveryfs`) to prevent bootloops.
* **Flashing Guide:** Step-by-step instructions for properly flashing firmware using **QFIL** (Qualcomm Flash Image Loader) and **EDL** tools.
* **Device Configs:** Specific configurations, Firehose programmers, and partition tables (`rawprogram.xml`) for **MC7010** and **MC7010D** variants.

### 3. Custom Firmware (MC7010D)
> ⚡ *Coming Soon*
Release of a **pre-modified, ready-to-flash firmware** for the **MC7010D** variant. Includes unlocked features and optimizations.
---

## 🧰 Required Tools

* **[EDL Tool](https://github.com/bkerler/edl)** (bkerler/edl): For low-level memory reading/writing.
* **[Ubidump](https://github.com/nlitsme/ubidump)** (nlitsme/ubidump): To extract content from UBI partitions.
* **mtd-utils** (Linux): To regenerate UBI images (`mkfs.ubifs`, `ubinize`).
* **Python 3**: Required to execute the cleaning scripts.

---

## 📂 Repository Structure

```text
/
├── guides/                          # Step-by-step technical documentation
│   └── login_bypass.md
├── tools/                           # Helper scripts
│   └── clean_padding.py             # Removes trailing 0xEE/0xFF bytes from raw dumps
│   └── login_with_hash.js           # Removes trailing 0xEE/0xFF bytes from raw dumps
│   └── password_change_with_hash.js # Removes trailing 0xEE/0xFF bytes from raw dumps
└── firmware/                        # Space for releases
