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

    // 4. Client Testimonial Slider / Rotator (with clickable dot navigation)
    const testimonials = document.querySelectorAll(".testimonial-card");
    const testimonialDots = document.querySelectorAll(".testimonial-dot");
    let currentTestimonial = 0;
    let testimonialTimer = null;

    function showTestimonial(index) {
        testimonials[currentTestimonial].classList.remove("active");
        testimonialDots[currentTestimonial]?.classList.remove("active");

        currentTestimonial = index;

        testimonials[currentTestimonial].classList.add("active");
        testimonialDots[currentTestimonial]?.classList.add("active");
    }

    function startTestimonialRotation() {
        testimonialTimer = setInterval(() => {
            showTestimonial((currentTestimonial + 1) % testimonials.length);
        }, 6000);
    }

    if (testimonials.length > 1) {
        testimonials[currentTestimonial].classList.add("active");
        testimonialDots[currentTestimonial]?.classList.add("active");

        startTestimonialRotation();

        testimonialDots.forEach(dot => {
            dot.addEventListener("click", () => {
                const index = parseInt(dot.getAttribute("data-index"), 10);
                showTestimonial(index);
                // Reset the auto-rotate timer so it doesn't jump right after a manual click
                clearInterval(testimonialTimer);
                startTestimonialRotation();
            });
        });
    }

    // 5. Service scope flashcards — "letter opening" reading experience
    const serviceCards = document.querySelectorAll(".svcflash-card");

    if (serviceCards.length > 0) {
        const serviceGrid = document.querySelector(".svcflash-grid");
        const backdrop = document.getElementById("svcflash-letter-backdrop");
        const scopeTitle = document.getElementById("service-scope-title");
        const scopeSubtitle = document.getElementById("service-scope-subtitle");
        const defaultTitle = scopeTitle?.textContent || "Service Scope & Capabilities";
        const defaultSubtitle = scopeSubtitle?.textContent || "Every discipline we estimate, broken down by what's covered, what you receive, and where it applies.";

        let currentlyOpenCard = null;

        const openLetter = (card, updateUrl = true) => {
            if (currentlyOpenCard === card) return;

            serviceGrid?.classList.add("has-letter-open");
            document.body.classList.add("has-letter-open");
            backdrop?.classList.add("is-visible");

            card.classList.add("is-letter-open", "is-expanded");
            currentlyOpenCard = card;

            // "Unroll" open: starts as a thin, small sealed rectangle at
            // center screen, unfurls to full size with a settling ease —
            // reads like a letter/scroll being opened, not a generic popup.
            gsap.fromTo(card,
                { xPercent: -50, yPercent: -50, scaleX: 0.55, scaleY: 0.045, opacity: 0 },
                { xPercent: -50, yPercent: -50, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.75, ease: "back.out(1.4)" }
            );

            // Inner content fades in slightly after the unroll starts
            const innerContent = card.querySelectorAll(".svcflash-title, .svcflash-overview, .svcflash-expand, .svcflash-footer");
            gsap.fromTo(innerContent,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.25, stagger: 0.05, ease: "power2.out" }
            );

            if (scopeTitle) scopeTitle.textContent = card.dataset.serviceName || "Selected Service";
            if (scopeSubtitle) {
                const csi = card.dataset.serviceCsi || "";
                scopeSubtitle.textContent = csi
                    ? `${csi} · Detailed scope, deliverables, applications, and relevant sample.`
                    : "Detailed scope, deliverables, applications, and relevant sample.";
            }

            if (updateUrl) {
                const newHash = `#${card.id}`;
                if (window.location.hash !== newHash) {
                    history.pushState(null, "", newHash);
                }
            }
        };

        const closeLetter = (updateUrl = true) => {
            if (!currentlyOpenCard) return;
            const card = currentlyOpenCard;

            gsap.to(card, {
                scaleX: 0.55,
                scaleY: 0.045,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    card.classList.remove("is-letter-open", "is-expanded");
                    gsap.set(card, { clearProps: "transform,opacity" });
                    serviceGrid?.classList.remove("has-letter-open");
                    document.body.classList.remove("has-letter-open");
                    backdrop?.classList.remove("is-visible");
                    currentlyOpenCard = null;

                    if (scopeTitle) scopeTitle.textContent = defaultTitle;
                    if (scopeSubtitle) scopeSubtitle.textContent = defaultSubtitle;
                }
            });

            if (updateUrl && window.location.hash) {
                history.pushState(null, "", window.location.pathname + window.location.search);
            }
        };

        serviceCards.forEach(card => {
            const toggle = card.querySelector(".svcflash-toggle");
            toggle?.addEventListener("click", event => {
                event.preventDefault();
                openLetter(card);
            });

            card.querySelector(".svcflash-letter-close")?.addEventListener("click", () => closeLetter());
        });

        backdrop?.addEventListener("click", () => closeLetter());

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && currentlyOpenCard) closeLetter();
        });

        const openLinkedService = () => {
            const rawHash = window.location.hash;

            if (!rawHash || !rawHash.startsWith("#svc-")) {
                if (currentlyOpenCard) closeLetter(false);
                return;
            }

            let targetId;
            try {
                targetId = decodeURIComponent(rawHash.substring(1));
            } catch {
                targetId = rawHash.substring(1);
            }

            const targetCard = document.getElementById(targetId);

            if (!targetCard || !targetCard.classList.contains("svcflash-card")) {
                if (currentlyOpenCard) closeLetter(false);
                return;
            }

            openLetter(targetCard, false);
        };

        window.setTimeout(openLinkedService, 180);
        window.addEventListener("hashchange", openLinkedService);
        window.addEventListener("popstate", openLinkedService);
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
