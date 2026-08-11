const hearts = document.querySelectorAll(".heart");
const bagCount = document.getElementById("bagCount");
const notification = document.getElementById("notification");

let wishlistCount = 0;

/* WISHLIST */

hearts.forEach((heart) => {

```
heart.addEventListener("click", () => {

    heart.classList.toggle("active");

    if (heart.classList.contains("active")) {

        heart.textContent = "♥";
        wishlistCount++;

        showNotification("♡ Added to your wishlist!");

    } else {

        heart.textContent = "♡";
        wishlistCount--;

        showNotification("Removed from your wishlist");

    }

    bagCount.textContent = wishlistCount;
});
```

});

/* NOTIFICATION */

function showNotification(message) {

```
notification.textContent = message;

notification.classList.add("show");

setTimeout(() => {
    notification.classList.remove("show");
}, 2000);
```

}

/* NAVBAR SCROLL EFFECT */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

```
if (window.scrollY > 30) {
    navbar.style.boxShadow = "0 8px 30px rgba(36, 28, 29, 0.06)";
} else {
    navbar.style.boxShadow = "none";
}
```

});

/* REVEAL ANIMATION */

const revealElements = document.querySelectorAll(
".product-card, .about-card, .about-decoration"
);

const observer = new IntersectionObserver(
(entries) => {

```
    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

            observer.unobserve(entry.target);
        }

    });

},
{
    threshold: 0.15
}
```

);

revealElements.forEach((element) => {

```
element.style.opacity = "0";
element.style.transform = "translateY(30px)";
element.style.transition = "all 0.7s ease";

observer.observe(element);
```

});
