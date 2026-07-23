// ==========================================================================
// Abood Avatar Maker - Fixed Instant Download & Canvas Engine (2026)
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
                const gIcon = savedUser.gender === "male" ? "👨‍✈️ ♂️" : "👩‍✈️ ♀️";
                showToast(`✅ مرحباً بك ${savedUser.name} (${gIcon})! تم حفظ البروفايل.`);
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

    // 4. محرك الـ Canvas المباشر
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
    userImage.crossOrigin = "anonymous"; // تفعيل السماح المباشر بالقص بدون قيود أمان

    userImage.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500";
    userImage.onload = () => {
        hasLoadedImage = true;
        renderCanvas();
    };

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

    // بناء مكتبة الملصقات
    const stickersBox = document.getElementById("stickersBox");
    const stickersList = [
        "👓", "🧣", "🥽", "👕", "🧦", "🧤", "👠", "🎒", "🥾", "👢", 
        "👒", "🩻", "🪮", "🪩", "🪭","
