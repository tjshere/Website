/* Supply Line - reveal-on-scroll + timeline progress
   Plain JS, no dependencies. Respects prefers-reduced-motion. */

(function () {
    "use strict";

    // Animations only apply when JS is running - without this class,
    // the CSS leaves everything visible (no-JS / print fallback).
    document.documentElement.classList.add("js");

    /* ── Graduation photo carousel ── */
    var carousel = document.getElementById("carousel");
    if (carousel) {
        var slides = carousel.querySelectorAll("img");
        var current = 0;

        var step = function (dir) {
            slides[current].classList.remove("active");
            current = (current + dir + slides.length) % slides.length;
            slides[current].classList.add("active");
        };

        document.querySelector(".car-prev").addEventListener("click", function () { step(-1); });
        document.querySelector(".car-next").addEventListener("click", function () { step(1); });
    }

    /* ── Theme toggle (initial theme is set inline in <head>) ── */
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
        toggle.addEventListener("click", function () {
            var root = document.documentElement;
            var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
        });
    }

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Reveal elements as they enter the viewport ── */
    var revealEls = document.querySelectorAll(".reveal");

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("visible"); });
    } else {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );
        revealEls.forEach(function (el) { observer.observe(el); });
    }

    /* ── Timeline: line fills as you scroll, dots light up ── */
    var timeline = document.getElementById("timeline");
    var progress = document.getElementById("timeline-progress");
    var entries = document.querySelectorAll(".entry");

    if (!timeline || !progress || reducedMotion) return;

    var ticking = false;

    function updateLine() {
        ticking = false;

        var rect = timeline.getBoundingClientRect();
        // The line's "pen" is a point 60% down the viewport.
        var pen = window.innerHeight * 0.6;
        var filled = pen - rect.top;
        var pct = Math.max(0, Math.min(1, filled / rect.height));

        progress.style.height = (pct * 100) + "%";

        // A dot lights up once the drawn line has passed it.
        entries.forEach(function (entry) {
            var dotTop = entry.getBoundingClientRect().top + 12;
            entry.classList.toggle("passed", dotTop <= rect.top + rect.height * pct);
        });
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(updateLine);
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateLine();
})();
