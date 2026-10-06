/**
 * Internationalization (i18n) Engine for Matcha Tcih
 * Supports instant bilingual toggling: English (Default) <-> Bahasa Indonesia
 */

export const TRANSLATIONS = {
    en: {
        // Navigation
        nav_menu: "Menu",
        nav_home: "Home",
        nav_simulation: "Simulation",
        cart_btn_text: "Cart",
        hint_menu: "Drag / Swipe → Menu",
        hint_sim: "Simulation ← Swipe",

        // Menu Page
        menu_back: "Back to 3D Showcase (Swipe ←)",
        menu_badge: "Koleksi Kurasi • Panen Pertama Uji",
        menu_title: "The Matcha Standard.",
        menu_subtitle: "Handcrafted ceremonial profiles, slow-steeped and micro-carbonated for pure calm and lasting focus.",
        c1_tag: "Signature Cold",
        c1_desc: "Cold-brewed pure Uji matcha layered with silky vanilla cloud foam and rich ceremonial matcha dust.",
        c2_tag: "Citrus Botanical",
        c2_desc: "Crisp Japanese mountain Yuzu citrus combined with micro-carbonation and ceremonial matcha.",
        c3_tag: "Floral Fusion",
        c3_desc: "Kyoto Sakura blossom infusion paired with silky oat milk and ceremonial grade matcha.",
        c4_tag: "Roasted Blend",
        c4_desc: "Dual-layer nutty roasted Hojicha and deep green ceremonial matcha blended with oat milk.",

        // Landing Page
        hero_title_1: "Craft",
        hero_title_2: "Your",
        hero_title_3: "Ritual",
        hero_side_1: "Pure",
        hero_side_2: "Zen",
        hero_desc: "Craft your perfect state of calm. <br> Layer premium first-harvest matcha with your favorite toppings. Rotate and explode each layer to engineer your personal ritual.",
        hero_cta: "Order Ceremonial",
        hero_award_title: "GLOBAL TEA AWARDS",
        hero_award_sub: "PREMIUM BOTANICAL SODA 2025",

        // Layer Annotations
        annotation_topping_title: "Matcha Foam & Dust",
        annotation_topping_desc: "Silky ceremonial foam rich in umami aroma, dusted with fine matcha micro-powder.",
        annotation_isi_title: "First-Harvest Uji Extract",
        annotation_isi_desc: "Cold-brewed first-harvest Tencha tea leaves from Kyoto with zero sugar.",
        annotation_base_title: "Zen Mineral Soda Base",
        annotation_base_desc: "Artisan mountain spring mineral base infused with crisp, revitalizing micro-bubbles.",

        // Simulation HUD
        hud_split_btn: "Pinch / Split Layers",
        hud_assemble_btn: "Assemble",
        hud_explode_label: "Explode:",

        // Simulation Page
        sim_back: "Back to Showcase (Swipe →)",
        sim_badge: "Matcha Lab • Crafting Sandbox",
        sim_title: "Matcha Simulation",
        sim_subtitle: "Engineer your personal matcha ritual. Customize Uji tea concentration, milk foam texture, and botanical notes while tracking umami and antioxidant metrics in real time.",
        sim_step1_label: "1. Matcha Tea Base",
        sim_step1_sub: "Select Profile",
        sim_step2_label: "2. Matcha Concentration",
        sim_step2_l1: "Usucha (Light / 1g)",
        sim_step2_l2: "Standard (2.5g)",
        sim_step2_l3: "Koicha (Intense / 4.5g)",
        sim_step3_label: "3. Milk & Foam Texture",
        sim_step3_sub: "Foam Style",
        sim_btn_add: "Add to Cart",
        sim_btn_added: "Added to Cart! ✔",
        sim_btn_reset: "Reset Recipe",
        sim_meter_umami: "Umami Richness",
        sim_meter_sweetness: "Sweetness Level",
        sim_meter_antioxidant: "EGCG Antioxidants",
        sim_meter_caffeine: "Estimated Caffeine",
        sim_summary_title: "Sensory Profile & Recipe Summary",

        // Cart Modal
        cart_title: "Your Cart",
        cart_empty_title: "Your cart is currently empty.",
        cart_empty_sub: "Craft a blend in the Simulation Lab or explore our Crafted Menu!",
        cart_total_label: "Estimated Total",
        cart_checkout_btn: "Proceed to Checkout",
        cart_alert_empty: "Your cart is currently empty. Please add a matcha blend first!",
        cart_alert_success: "Thank you! Your order of ${total} is now being prepared by our tea masters."
    },
    id: {
        // Navigation
        nav_menu: "Menu",
        nav_home: "Beranda",
        nav_simulation: "Simulasi",
        cart_btn_text: "Keranjang",
        hint_menu: "Geser / Drag → Menu",
        hint_sim: "Simulasi ← Geser",

        // Menu Page
        menu_back: "Kembali ke 3D Showcase (Geser ←)",
        menu_badge: "Koleksi Kurasi • Panen Pertama Uji",
        menu_title: "Menu Matcha Tchi",
        menu_subtitle: "Temukan profil racikan matcha otentik yang siap dinikmati, atau jadikan inspirasi untuk mensimulasikan dan meracik kreasimu sendiri.",
        c1_tag: "Dingin Khas",
        c1_desc: "Seduhan dingin matcha murni Uji dilapisi busa susu vanila lembut dan taburan bubuk matcha pekat.",
        c2_tag: "Sitrus Botani",
        c2_desc: "Kesegaran sari jeruk Yuzu pegunungan Jepang berpadu dengan karbonasi mikro dan matcha seremonial.",
        c3_tag: "Fusi Bunga",
        c3_desc: "Infusi kelopak bunga Sakura Kyoto dengan oat milk lembut dan ceremonial grade matcha.",
        c4_tag: "Paduan Panggang",
        c4_desc: "Lapisan ganda teh panggang Hojicha beraroma nutty dan matcha hijau pekat dengan susu gandum.",

        // Landing Page (ID)
        hero_title_1: "Racik",
        hero_title_2: "Seni",
        hero_title_3: "Ritualmu",
        hero_side_1: "Murni",
        hero_side_2: "Zen",
        hero_desc: "Ciptakan momen ketenangan sempurnamu. <br> Susun matcha seremonial pilihan dengan topping favoritmu. Putar dan belah setiap layernya untuk merancang ritual personalmu.",
        hero_cta: "Pesan Seremonial",
        hero_award_title: "PENGHARGAAN TEH GLOBAL",
        hero_award_sub: "SODA BOTANI PREMIUM 2025",

        // Layer Annotations
        annotation_topping_title: "Busa Matcha & Bubuk",
        annotation_topping_desc: "Busa seremonial lembut beraroma umami pekat dengan taburan micro-powder.",
        annotation_isi_title: "Ekstrak Panen Pertama Uji",
        annotation_isi_desc: "Seduhan dingin daun teh Tencha pilihan Kyoto dengan zero sugar.",
        annotation_base_title: "Fondasi Soda Mineral Zen",
        annotation_base_desc: "Air mata air pegunungan dengan gelembung mikro-karbonasi penyegar.",

        // Simulation HUD
        hud_split_btn: "Cubit / Pisah Layer",
        hud_assemble_btn: "Satukan Kembali",
        hud_explode_label: "Pemisahan:",

        // Simulation Page
        sim_back: "Kembali ke Showcase (Geser →)",
        sim_badge: "Lab Matcha • Sandbox Kreasi",
        sim_title: "Simulasi Racikan Matcha",
        sim_subtitle: "Eksperimen racikan matcha personal Anda. Sesuaikan konsentrasi bubuk teh Uji, busa susu, serta aksen botani alami, dan pantau profil umami serta antioksidan secara real-time.",
        sim_step1_label: "1. Base Teh Matcha",
        sim_step1_sub: "Pilih Karakter",
        sim_step2_label: "2. Konsentrasi Matcha",
        sim_step2_l1: "Usucha (Halus / 1g)",
        sim_step2_l2: "Standar (2.5g)",
        sim_step2_l3: "Koicha (Pekat / 4.5g)",
        sim_step3_label: "3. Susu & Tekstur Foam",
        sim_step3_sub: "Tipe Busa",
        sim_btn_add: "Masukkan Keranjang",
        sim_btn_added: "Ditambahkan ke Keranjang! ✔",
        sim_btn_reset: "Reset Racikan",
        sim_meter_umami: "Kepekatan Umami",
        sim_meter_sweetness: "Tingkat Manis",
        sim_meter_antioxidant: "Antioksidan EGCG",
        sim_meter_caffeine: "Estimasi Kafein",
        sim_summary_title: "Profil Sensorik & Ringkasan Racikan",

        // Cart Modal
        cart_title: "Keranjang Pesanan",
        cart_empty_title: "Keranjang masih kosong.",
        cart_empty_sub: "Pilih racikan di Simulation Page atau Menu Racikan!",
        cart_total_label: "Total Estimasi",
        cart_checkout_btn: "Checkout Pesanan",
        cart_alert_empty: "Keranjang Anda masih kosong. Silakan tambahkan menu racikan terlebih dahulu!",
        cart_alert_success: "Terima kasih! Pesanan Anda senilai ${total} sedang disiapkan oleh tea master kami."
    }
};

export class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('matcha_lang') || 'en';
        this.langBtn = document.querySelector('#lang-toggle-btn');
        this.langText = document.querySelector('#lang-text');
        this.init();
    }

    init() {
        if (this.langBtn) {
            this.langBtn.addEventListener('click', () => this.toggleLanguage());
        }
        // Apply default language on load
        this.applyLanguage(this.currentLang);
    }

    toggleLanguage() {
        const nextLang = this.currentLang === 'en' ? 'id' : 'en';
        this.setLanguage(nextLang);
    }

    setLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        this.currentLang = lang;
        try {
            localStorage.setItem('matcha_lang', lang);
        } catch {}

        this.applyLanguage(lang);
    }

    applyLanguage(lang) {
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
        document.documentElement.lang = lang;

        // Update Button text (displays the current active language or toggler hint)
        if (this.langText) {
            this.langText.textContent = lang.toUpperCase();
        }

        // 1. Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.dataset.i18n;
            if (dict[key]) {
                elem.innerHTML = dict[key];
            }
        });

        // 2. Update attributes with data-i18n-attr (e.g. "title:key" or "aria-label:key")
        document.querySelectorAll('[data-i18n-attr]').forEach(elem => {
            const rules = elem.dataset.i18nAttr.split(';');
            rules.forEach(rule => {
                const [attr, key] = rule.split(':');
                if (attr && key && dict[key]) {
                    elem.setAttribute(attr.trim(), dict[key]);
                }
            });
        });

        // Dispatch event for components that generate dynamic text
        document.dispatchEvent(new CustomEvent('matcha:lang-changed', {
            detail: { lang, dict }
        }));
    }

    t(key) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
        return dict[key] || key;
    }
}
