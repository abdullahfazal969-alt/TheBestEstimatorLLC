// ==========================================
// THE BEST ESTIMATOR - ANIMATIONS ENGINE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Entrance Reveal Animation (Hugo/Apple Style)
    const overlay = document.getElementById("entrance-overlay");
    const overlayLine = document.querySelector(".overlay-line");
    const overlayLogo = document.querySelector(".overlay-logo");

    if (overlay && overlayLine && overlayLogo) {
        // Step A: Expand line
        gsap.to(overlayLine, {
            width: "120px",
            duration: 0.8,
            ease: "power2.out",
        });

        // Step B: Slide up and fade out overlay
        gsap.to(overlay, {
            yPercent: -100,
            duration: 1,
            delay: 1,
            ease: "power4.inOut",
            onComplete: () => {
                overlay.style.display = "none";
                triggerHeroAnimations();
            }
        });
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
});
