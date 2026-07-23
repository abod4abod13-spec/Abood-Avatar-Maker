// ==========================================================================
// Abood Avatar Maker - Canvas Engine (2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. إخفاء Splash Screen
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

    // 3. المحرك المباشر للرسم وتعديل الصور على الـ Canvas
    const canvas = document.getElementById("avatarCanvas");
    const ctx = canvas.getContext("2d");

    const imageInput = document.getElementById("imageInput");
    const borderStyleSelect = document.getElementById("borderStyleSelect");
    const borderColor1 = document.getElementById("borderColor1");
    const borderColor2 = document.getElementById("borderColor2");
    const borderWidth = document.getElementById("borderWidth");
    const borderWidthVal = document.getElementById("borderWidthVal");
    const zoomLevel = document.getElementById("zoomLevel");
    const zoomVal = document.getElementById("zoomVal");
    const badgeSelect = document.getElementById("badgeSelect");
    const filterSelect = document.getElementById("filterSelect");
    const downloadBtn = document.getElementById("downloadBtn");
    const resetBtn = document.getElementById("resetBtn");

    let userImage = new Image();
    let hasLoadedImage = false;

    // صورة افتراضية عند فتح الموقع
    userImage.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";
    userImage.onload = () => {
        hasLoadedImage = true;
        renderCanvas();
    };

    // قراءة الصورة المرفوعة
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

    // دالة الرسم الرئيسية وإعادة التحديث
    function renderCanvas() {
        if (!hasLoadedImage) return;

        const size = canvas.width;
        const center = size / 2;
        const bWidth = parseInt(borderWidth.value);
        const zoom = parseInt(zoomLevel.value) / 100;

        ctx.clearRect(0, 0, size, size);

        // أ. تطبيق الفلاتر
        ctx.filter = "none";
        if (filterSelect.value === "grayscale") ctx.filter = "grayscale(100%)";
        if (filterSelect.value === "contrast") ctx.filter = "contrast(140%) brightness(110%)";
        if (filterSelect.value === "cyberpunk") ctx.filter = "hue-rotate(180deg) contrast(130%)";
        if (filterSelect.value === "vintage") ctx.filter = "sepia(50%) contrast(110%)";

        // ب. قص القناع الدائري للأساس
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, center - bWidth, 0, Math.PI * 2);
        ctx.clip();

        // رسم الصورة مع التكبير
        const imgW = size * zoom;
        const imgH = size * zoom;
        const imgX = center - (imgW / 2);
        const imgY = center - (imgH / 2);
        ctx.drawImage(userImage, imgX, imgY, imgW, imgH);
        ctx.restore();

        // إعادة الضبط للفلاتر قبل الإطار
        ctx.filter = "none";

        // ج. رسم الإطارات
        if (bWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, center - (bWidth / 2), 0, Math.PI * 2);

            const color1 = borderColor1.value;
            const color2 = borderColor2.value;

            if (borderStyleSelect.value === "neon") {
                ctx.strokeStyle = color1;
                ctx.lineWidth = bWidth;
                ctx.shadowColor = color1;
                ctx.shadowBlur = 15;
                ctx.stroke();
            } else if (borderStyleSelect.value === "gradient") {
                const grad = ctx.createLinearGradient(0, 0, size, size);
                grad.addColorStop(0, color1);
                grad.addColorStop(1, color2);
                ctx.strokeStyle = grad;
                ctx.lineWidth = bWidth;
                ctx.stroke();
            } else if (borderStyleSelect.value === "dashed") {
                ctx.strokeStyle = color1;
                ctx.lineWidth = bWidth;
                ctx.setLineDash([15, 10]);
                ctx.stroke();
            } else {
                ctx.strokeStyle = color1;
                ctx.lineWidth = bWidth;
                ctx.stroke();
            }
            ctx.restore();
        }

        // د. رسم الشارات
        drawBadge(center, size);
    }

    function drawBadge(center, size) {
        const badge = badgeSelect.value;
        if (badge === "none") return;

        ctx.save();
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const badgeX = size - 50;
        const badgeY = size - 50;

        if (badge === "verified_blue") ctx.fillText("✔️", badgeX, badgeY);
        if (badge === "verified_gold") ctx.fillText("⭐", badgeX, badgeY);
        if (badge === "pro") ctx.fillText("🔥", badgeX, badgeY);
        if (badge === "crown") ctx.fillText("👑", center, 35);
        if (badge === "gaming") ctx.fillText("🎮", badgeX, badgeY);

        ctx.restore();
    }

    // ربط الأحداث للتحديث المباشر
    [borderStyleSelect, borderColor1, borderColor2, filterSelect, badgeSelect].forEach(el => {
        el.addEventListener("change", renderCanvas);
    });

    borderWidth.addEventListener("input", () => {
        borderWidthVal.textContent = borderWidth.value;
        renderCanvas();
    });

    zoomLevel.addEventListener("input", () => {
        zoomVal.textContent = zoomLevel.value;
        renderCanvas();
    });

    // إعادة ضبط
    resetBtn.addEventListener("click", () => {
        borderWidth.value = 10;
        borderWidthVal.textContent = 10;
        zoomLevel.value = 100;
        zoomVal.textContent = 100;
        borderStyleSelect.value = "solid";
        filterSelect.value = "none";
        badgeSelect.value = "none";
        renderCanvas();
    });

    // تحميل الصورة بجودة 4K عالية
    downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "Abood-Avatar-Profile.png";
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
    });
});

