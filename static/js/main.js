// ==========================================
// THE BEST ESTIMATOR - ANIMATIONS ENGINE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Entrance Reveal Animation (Hugo/Apple Style)
    const overlay = document.getElementById("entrance-overlay");
    const overlayLine = document.querySelector(".overlay-line");
    const overlayLogo = document.querySelector(".overlay-logo-img");

    if (overlay && overlayLine && overlayLogo) {
        const entranceTl = gsap.timeline();

        // Step A: Logo fades and scales in
        entranceTl.to(overlayLogo, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
        });

        // Step B: Gold line draws underneath
        entranceTl.to(overlayLine, {
            width: "120px",
            duration: 0.6,
            ease: "power2.out",
        }, "-=0.35");

        // Step C: Hold briefly, then slide up and fade out overlay
        entranceTl.to(overlay, {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
                overlay.style.display = "none";
                triggerHeroAnimations();
            }
        }, "+=0.5");
    } else {
        // Fallback if elements don't exist
        triggerHeroAnimations();
    }

    // 2. Hero Section Entrance Animations
    function triggerHeroAnimations() {
        gsap.from(".hero-headline", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        gsap.from(".hero-subtitle", {
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: "power3.out"
        });

        gsap.from(".hero-ctas", {
            y: 20,
            opacity: 0,
            duration: 1,
            delay: 0.5,
            ease: "power3.out"
        });
    }

    // 3. Scroll Reveal Animations (IntersectionObserver fallback + GSAP)
    const revealElements = document.querySelectorAll(".scroll-reveal");

    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // 3b. Eager Reveal (triggers before the section fully enters view, snappier)
    const eagerRevealElements = document.querySelectorAll(".scroll-reveal-eager");

    if (eagerRevealElements.length > 0) {
        const eagerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    eagerObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: "0px 0px 300px 0px" // fires ~300px before the section reaches the viewport
        });

        eagerRevealElements.forEach(el => eagerObserver.observe(el));
    }

    // 3c. Navbar Auto-Hide on Scroll Direction
    const siteHeader = document.getElementById("site-header");
    if (siteHeader) {
        let lastScrollY = window.scrollY;
        let ticking = false;
        const hideThreshold = 100; // don't hide until scrolled past this point

        function updateHeader() {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= hideThreshold) {
                siteHeader.classList.remove("nav-hidden");
            } else if (currentScrollY > lastScrollY) {
                // scrolling down
                siteHeader.classList.add("nav-hidden");
            } else if (currentScrollY < lastScrollY) {
                // scrolling up
                siteHeader.classList.remove("nav-hidden");
            }

            lastScrollY = currentScrollY;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }

    // 4. Client Testimonial Slider / Rotator (Simple & Elegant)
    const testimonials = document.querySelectorAll(".testimonial-card");
    let currentTestimonial = 0;

    if (testimonials.length > 1) {
        // Initialize first testimonial
        testimonials[currentTestimonial].classList.add("active");

        setInterval(() => {
            testimonials[currentTestimonial].classList.remove("active");
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].classList.add("active");
        }, 6000); // Rotate every 6 seconds
    }

    // 5. Capability Matrix — Spotlight-Expand Rows (pricing page only)
    const capabilityRows = document.querySelectorAll(".capability-row");
    const capabilityBackdrop = document.getElementById("capability-modal-backdrop");

    if (capabilityRows.length > 0 && capabilityBackdrop) {
        const capabilityModal = document.getElementById("capability-modal");
        const capabilityCloseBtn = document.getElementById("capability-modal-close");
        const modalNum = document.getElementById("capability-modal-num");
        const modalTitle = document.getElementById("capability-modal-title");
        const modalDesc = document.getElementById("capability-modal-desc");
        const modalItems = document.getElementById("capability-modal-items");

        function openCapability(row) {
            const division = row.dataset.division;
            const title = row.dataset.title;
            const desc = row.dataset.desc;
            const items = (row.dataset.items || "").split("|").filter(Boolean);

            modalNum.textContent = "DIVISION " + division;
            modalTitle.textContent = title;
            modalDesc.textContent = desc;
            modalItems.innerHTML = "";

            items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                modalItems.appendChild(li);
            });

            capabilityBackdrop.classList.add("is-open");
            document.body.classList.add("capability-modal-open");

            gsap.fromTo(capabilityModal,
                { opacity: 0, scale: 0.85, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
            );

            gsap.fromTo(modalItems.querySelectorAll("li"),
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.2, ease: "power2.out" }
            );
        }

        function closeCapability() {
            gsap.to(capabilityModal, {
                opacity: 0,
                scale: 0.85,
                y: 30,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    capabilityBackdrop.classList.remove("is-open");
                    document.body.classList.remove("capability-modal-open");
                }
            });
        }

        capabilityRows.forEach(row => {
            row.addEventListener("click", () => openCapability(row));
        });

        capabilityCloseBtn.addEventListener("click", closeCapability);

        capabilityBackdrop.addEventListener("click", (e) => {
            if (e.target === capabilityBackdrop) closeCapability();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && capabilityBackdrop.classList.contains("is-open")) {
                closeCapability();
            }
        });
    }

    // 6. FAQ Accordion — smooth expand/collapse
    const faqQuestions = document.querySelectorAll(".faq-question");

    if (faqQuestions.length > 0) {
        faqQuestions.forEach(btn => {
            btn.addEventListener("click", () => {
                const isOpen = btn.getAttribute("aria-expanded") === "true";
                btn.setAttribute("aria-expanded", String(!isOpen));
            });
        });
    }
});
