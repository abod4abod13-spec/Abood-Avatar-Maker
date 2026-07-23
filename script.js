// ==========================================================================
// Abood Avatar Maker - Direct Link & Fallback Download Engine (2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. إخفاء شاشة التحميل (Splash Screen)
    window.addEventListener("load", () => {
        const splash = document.getElementById("splash");
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = "0";
                setTimeout(() => splash.remove(), 800);
            }, 1200);
        }
    });

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. زر العودة للأعلى وشريط التقدم
    const topBtn = document.getElementById("topBtn");
    const progress = document.getElementById("scrollProgress");

    window.addEventListener("scroll", () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0 && progress) {
            progress.style.width = (winScroll / height) * 100 + "%";
        }
        if (topBtn) {
            topBtn.style.display = window.scrollY > 300 ? "block" : "none";
        }
    });

    if (topBtn) {
        topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    // 3. البروفايل والتنبيهات
    const userNameInput = document.getElementById("userNameInput");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const genderBtns = document.querySelectorAll(".gender-btn");
    const liveToastContainer = document.getElementById("liveToastContainer");

    let savedUser = JSON.parse(localStorage.getItem("abood_avatar_user")) || {
        name: "عبدالله",
        gender: "male"
    };

    if (userNameInput) userNameInput.value = savedUser.name;

    genderBtns.forEach(btn => {
        if (btn.dataset.gender === savedUser.gender) {
            genderBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
        btn.addEventListener("click", () => {
            genderBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            savedUser.gender = btn.dataset.gender;
        });
    });

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", () => {
            const val = userNameInput.value.trim();
            if (val) {
                savedUser.name = val;
                localStorage.setItem("abood_avatar_user", JSON.stringify(savedUser));
                const gIcon = savedUser.gender === "male" ? "♂️" : "♀️";
                showToast(`✅ تم حفظ البروفايل باسم ${savedUser.name} (${gIcon})`);
            }
        });
    }

    function showToast(text) {
        if (!liveToastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast-message";
        toast.innerHTML = text;
        liveToastContainer.appendChild(toast);

        setTimeout(() => { toast.remove(); }, 4000);
    }

    // 4. محرك الـ Canvas
    const canvas = document.getElementById("avatarCanvas");
    const ctx = canvas.getContext("2d");

    const imageInput = document.getElementById("imageInput");
    const borderStyleSelect = document.getElementById("borderStyleSelect");
    const borderColor1 = document.getElementById("borderColor1");
    const borderColor2 = document.getElementById("borderColor2");
    const bgColorInput = document.getElementById("bgColorInput");
    const borderWidth = document.getElementById("borderWidth");
    const borderWidthVal = document.getElementById("borderWidthVal");
    const zoomLevel = document.getElementById("zoomLevel");
    const zoomVal = document.getElementById("zoomVal");
    const filterSelect = document.getElementById("filterSelect");
    const badgeSelect = document.getElementById("badgeSelect");
    const downloadBtn = document.getElementById("downloadBtn");
    const resetBtn = document.getElementById("resetBtn");

    const rotateLeftBtn = document.getElementById("rotateLeftBtn");
    const rotateRightBtn = document.getElementById("rotateRightBtn");
    const flipHBtn = document.getElementById("flipHBtn");
    const flipVBtn = document.getElementById("flipVBtn");

    let rotationAngle = 0;
    let flipH = 1;
    let flipV = 1;
    let activeStickers = [];

    let userImage = new Image();
    let hasLoadedImage = false;

    // رسم صورة افتراضية ملائمة محلياً
    function createDefaultImage() {
        const dummyCanvas = document.createElement("canvas");
        dummyCanvas.width = 400;
        dummyCanvas.height = 400;
        const dCtx = dummyCanvas.getContext("2d");

        dCtx.fillStyle = "#1e293b";
        dCtx.fillRect(0, 0, 400, 400);

        dCtx.fillStyle = "#3b82f6";
        dCtx.font = "bold 100px sans-serif";
        dCtx.textAlign = "center";
        dCtx.textBaseline = "middle";
        dCtx.fillText("🚀", 200, 200);

        userImage = new Image();
        userImage.onload = () => {
            hasLoadedImage = true;
            renderCanvas();
        };
        userImage.src = dummyCanvas.toDataURL("image/png");
    }

    createDefaultImage();

    if (imageInput) {
        imageInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    userImage = new Image();
                    userImage.onload = () => {
                        hasLoadedImage = true;
                        renderCanvas();
                    };
                    userImage.src = event.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // بناء قائمة الملصقات
    const stickersBox = document.getElementById("stickersBox");
    const stickersList = ["👑", "⭐", "🔥", "⚡", "🎮", "😎", "🚀", "💎", "❤️", "🎯", "🛡️", "⚔️", "✨", "🎉", "🎈"];

    if (stickersBox) {
        stickersList.forEach(stk => {
            const item = document.createElement("span");
            item.className = "sticker-item";
            item.textContent = stk;
            item.onclick = () => {
                activeStickers.push({
                    char: stk,
                    x: Math.random() * (canvas.width - 100) + 50,
                    y: Math.random() * (canvas.height - 100) + 50
                });
                renderCanvas();
            };
            stickersBox.appendChild(item);
        });
    }

    // دالة الرسم الرئيسية
    function renderCanvas() {
        if (!hasLoadedImage) return;

        const size = canvas.width;
        const center = size / 2;
        const bWidth = parseInt(borderWidth.value);
        const zoom = parseInt(zoomLevel.value) / 100;

        ctx.clearRect(0, 0, size, size);

        // خلفية القناع
        ctx.save();
        ctx.fillStyle = bgColorInput.value;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();

        // الفلاتر
        ctx.save();
        ctx.filter = getFilterString(filterSelect.value);

        ctx.beginPath();
        if (borderStyleSelect.value === "square") {
            ctx.roundRect(bWidth, bWidth, size - (bWidth * 2), size - (bWidth * 2), 40);
        } else {
            ctx.arc(center, center, center - bWidth, 0, Math.PI * 2);
        }
        ctx.clip();

        ctx.translate(center, center);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.scale(flipH, flipV);

        const imgW = size * zoom;
        const imgH = size * zoom;
        ctx.drawImage(userImage, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();

        drawBorder(size, center, bWidth);
        drawBadgesAndStickers(size, center);

        // تحديث الرابط المباشر
        updateFallbackBox();
    }

    function getFilterString(filter) {
        switch (filter) {
            case "contrast": return "contrast(150%) brightness(110%)";
            case "brightness": return "brightness(130%)";
            case "grayscale": return "grayscale(100%)";
            case "cyberpunk": return "hue-rotate(190deg) contrast(140%)";
            case "vintage": return "sepia(40%)";
            case "invert": return "invert(100%)";
            case "blur": return "blur(2px)";
            default: return "none";
        }
    }

    function drawBorder(size, center, bWidth) {
        if (bWidth <= 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, center - (bWidth / 2), 0, Math.PI * 2);

        const c1 = borderColor1.value;
        const c2 = borderColor2.value;

        if (borderStyleSelect.value === "neon") {
            ctx.strokeStyle = c1;
            ctx.lineWidth = bWidth;
            ctx.shadowColor = c1;
            ctx.shadowBlur = 20;
            ctx.stroke();
        } else if (borderStyleSelect.value === "gradient") {
            const grad = ctx.createLinearGradient(0, 0, size, size);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);
            ctx.strokeStyle = grad;
            ctx.lineWidth = bWidth;
            ctx.stroke();
        } else if (borderStyleSelect.value === "dashed") {
            ctx.strokeStyle = c1;
            ctx.lineWidth = bWidth;
            ctx.setLineDash([20, 12]);
            ctx.stroke();
        } else {
            ctx.strokeStyle = c1;
            ctx.lineWidth = bWidth;
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawBadgesAndStickers(size, center) {
        const badge = badgeSelect.value;
        ctx.save();
        ctx.font = "38px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const badgeX = size - 60;
        const badgeY = size - 60;

        if (badge === "verified_blue") ctx.fillText("✔️", badgeX, badgeY);
        if (badge === "verified_gold") ctx.fillText("⭐", badgeX, badgeY);
        if (badge === "pro") ctx.fillText("🔥", badgeX, badgeY);
        if (badge === "crown") ctx.fillText("👑", center, 45);
        if (badge === "gaming") ctx.fillText("🎮", badgeX, badgeY);

        activeStickers.forEach(s => {
            ctx.font = "40px sans-serif";
            ctx.fillText(s.char, s.x, s.y);
        });

        ctx.restore();
    }

    // أحداث التحكم
    if (rotateLeftBtn) rotateLeftBtn.onclick = () => { rotationAngle -= 90; renderCanvas(); };
    if (rotateRightBtn) rotateRightBtn.onclick = () => { rotationAngle += 90; renderCanvas(); };
    if (flipHBtn) flipHBtn.onclick = () => { flipH *= -1; renderCanvas(); };
    if (flipVBtn) flipVBtn.onclick = () => { flipV *= -1; renderCanvas(); };

    [borderStyleSelect, borderColor1, borderColor2, bgColorInput, filterSelect, badgeSelect].forEach(el => {
        if (el) el.addEventListener("change", renderCanvas);
    });

    if (borderWidth) {
        borderWidth.addEventListener("input", () => {
            borderWidthVal.textContent = borderWidth.value;
            renderCanvas();
        });
    }

    if (zoomLevel) {
        zoomLevel.addEventListener("input", () => {
            zoomVal.textContent = zoomLevel.value;
            renderCanvas();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            rotationAngle = 0;
            flipH = 1;
            flipV = 1;
            activeStickers = [];
            borderWidth.value = 12;
            borderWidthVal.textContent = 12;
            zoomLevel.value = 100;
            zoomVal.textContent = 100;
            borderStyleSelect.value = "solid";
            filterSelect.value = "none";
            badgeSelect.value = "none";
            createDefaultImage();
        });
    }

    // ==========================================================================
    // 5. إنشاء وتحديث صندوق الرابط المباشر للحل المضمون (Direct Download Link)
    // ==========================================================================
    const previewCard = document.querySelector(".preview-card");
    let fallbackBox = document.getElementById("fallbackDownloadBox");

    if (!fallbackBox && previewCard) {
        fallbackBox = document.createElement("div");
        fallbackBox.id = "fallbackDownloadBox";
        fallbackBox.style.marginTop = "20px";
        fallbackBox.style.padding = "15px";
        fallbackBox.style.background = "rgba(0,0,0,0.4)";
        fallbackBox.style.border = "1px solid rgba(255,255,255,0.1)";
        fallbackBox.style.borderRadius = "14px";
        fallbackBox.style.width = "100%";
        fallbackBox.style.textAlign = "center";

        fallbackBox.innerHTML = `
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">
                ⚠️ إذا لم يبدأ التنزيل تلقائياً، افتح الرابط المباشر أو انقر عليه لحفظ الصورة:
            </p>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button id="openImgBtn" class="btn-primary" style="padding: 8px 15px; font-size: 13px;">👁️ فتح الصورة بصفحة جديدة</button>
                <button id="copyImgUrlBtn" class="btn-secondary" style="padding: 8px 15px; font-size: 13px;">📋 نسخ رابط الصورة</button>
            </div>
        `;
        previewCard.appendChild(fallbackBox);
    }

    function updateFallbackBox() {
        const dataUrl = canvas.toDataURL("image/png");

        const openImgBtn = document.getElementById("openImgBtn");
        const copyImgUrlBtn = document.getElementById("copyImgUrlBtn");

        if (openImgBtn) {
            openImgBtn.onclick = () => {
                const newWin = window.open();
                if (newWin) {
                    newWin.document.write(`<img src="${dataUrl}" style="max-width:100%; height:auto;" />`);
                } else {
                    alert("يرجى السماح بالنوافذ المنبثقة من إعدادات المتصفح!");
                }
            };
        }

        if (copyImgUrlBtn) {
            copyImgUrlBtn.onclick = () => {
                navigator.clipboard.writeText(dataUrl);
                showToast("📋 تم نسخ بيانات الصورة إلى الحافظة!");
            };
        }
    }

    // زر التنزيل الأساسي
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const dataUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = dataUrl;
            downloadLink.download = `Abood-Avatar-${Date.now()}.png`;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            const genderIcon = savedUser.gender === "male" ? "♂️" : "♀️";
            showToast(`🎉 تم بدء تنزيل الصورة لـ ${savedUser.name} (${genderIcon})!`);
        });
    }
});

