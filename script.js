const count=document.getElementById("count"),toast=document.getElementById("toast");let n=0;document.querySelectorAll(".heart").forEach(b=>b.onclick=()=>{b.classList.toggle("active");b.textContent=b.classList.contains("active")?"♥":"♡";n+=b.classList.contains("active")?1:-1;count.textContent=n;toast.textContent=b.classList.contains("active")?"♡ Added to your wishlist!":"Removed from your wishlist";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)});
const contactMain=document.getElementById("contactMain");
const contactFloat=document.querySelector(".contact-float");
if(contactMain&&contactFloat){
  contactMain.addEventListener("click",()=>{
    const open=contactFloat.classList.toggle("open");
    contactMain.setAttribute("aria-expanded",open);
    contactMain.textContent=open?"×":"💬";
  });
  document.addEventListener("click",(e)=>{
    if(!contactFloat.contains(e.target)){
      contactFloat.classList.remove("open");
      contactMain.setAttribute("aria-expanded","false");
      contactMain.textContent="💬";
    }
  });
}

/* MYNJU SHOP CATEGORY FILTER */
document.addEventListener("DOMContentLoaded",()=>{
  const filters=[...document.querySelectorAll(".shop-filter")];
  if(!filters.length) return;
  const cards=[...document.querySelectorAll("[data-category]")];
  const runFilter=(value)=>{
    cards.forEach(card=>{
      const cat=card.dataset.category;
      const show=value==="all" || cat===value || (value==="new" && card.dataset.new==="true");
      card.classList.toggle("is-hidden",!show);
    });
  };
  filters.forEach(btn=>{
    btn.addEventListener("click",()=>{
      filters.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      runFilter(btn.dataset.filter);
    });
  });
});

/* MYNJU CART */
document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("cartToggle"),d=document.getElementById("cartDrawer"),c=document.getElementById("cartClose"),b=document.getElementById("cartBackdrop"),items=document.getElementById("cartItems"),count=document.getElementById("cartCount"),hc=document.getElementById("cartHeaderCount"),total=document.getElementById("cartTotal"),wa=document.getElementById("cartWhatsApp");if(!d)return;let cart=[];const money=n=>"Rp"+Number(n).toLocaleString("id-ID");const render=()=>{let n=cart.reduce((s,i)=>s+i.qty,0),tot=cart.reduce((s,i)=>s+i.price*i.qty,0);count.textContent=n;hc.textContent="("+n+")";total.textContent=money(tot);items.innerHTML=cart.length?cart.map((i,k)=>`<div class="cart-item"><div><div class="cart-item-name">${i.name}</div><div class="cart-item-price">${money(i.price)}</div><div class="qty-controls"><button data-a="m" data-i="${k}">−</button><span>${i.qty}</span><button data-a="p" data-i="${k}">＋</button></div><button class="remove-item" data-a="r" data-i="${k}">Remove</button></div><strong>${money(i.price*i.qty)}</strong></div>`).join(""):'<div class="cart-empty">Your MYNJU bag is waiting for something cute 🎀</div>'};const open=()=>{d.classList.add("open");d.setAttribute("aria-hidden","false")},close=()=>{d.classList.remove("open");d.setAttribute("aria-hidden","true")};t?.addEventListener("click",open);c?.addEventListener("click",close);b?.addEventListener("click",close);document.querySelectorAll(".add-to-cart").forEach(x=>x.addEventListener("click",()=>{let f=cart.find(i=>i.name===x.dataset.name);f?f.qty++:cart.push({name:x.dataset.name,price:+x.dataset.price,qty:1});render();open()}));items.addEventListener("click",e=>{let x=e.target.closest("button");if(!x)return;let i=+x.dataset.i,a=x.dataset.a;if(a==="p")cart[i].qty++;if(a==="m")cart[i].qty--;if(a==="r")cart.splice(i,1);cart=cart.filter(x=>x.qty>0);render()});wa?.addEventListener("click",()=>{if(!cart.length)return;let lines=cart.map(i=>`${i.name} x${i.qty} - ${money(i.price*i.qty)}`).join("%0A"),tot=cart.reduce((s,i)=>s+i.price*i.qty,0);window.open("https://wa.me/6289516258263?text=Halo%20kak%20Dira%20aku%20cek%20di%20website%20kamu%20keren%2C%20mau%20dong%20pesan%3A%0A"+lines+"%0ATotal%3A%20"+money(tot),"_blank")});render()});

document.addEventListener("DOMContentLoaded",()=>{
 document.querySelectorAll(".add-to-cart").forEach(btn=>{
   btn.addEventListener("click",()=>{
     btn.classList.add("added");
     setTimeout(()=>btn.classList.remove("added"),1200);
   });
 });
 const main=document.getElementById("contactMain"), wrap=document.querySelector(".contact-float");
 if(main&&wrap){
   main.addEventListener("click",e=>{
     e.stopPropagation();
     const open=wrap.classList.toggle("open");
     main.setAttribute("aria-expanded",open);
     main.querySelector(".contact-main-icon").textContent=open?"×":"♡";
   });
 }
});


/* MYNJU AUTO SCROLL
   - Starts after 2 seconds without user activity.
   - Scrolls slowly toward the bottom.
   - At the bottom, jumps quickly back to the top.
   - Continues until the user interacts again.
*/
document.addEventListener("DOMContentLoaded", () => {
  const AUTO_SCROLL_DELAY = 2000; // 2 seconds
  const AUTO_SCROLL_SPEED = 0.65; // pixels per animation frame (~39 px/sec at 60fps)
  const BOTTOM_THRESHOLD = 4;

  let idleTimer = null;
  let autoScrollFrame = null;
  let autoScrolling = false;
  let activityLocked = false;

  const stopAutoScroll = () => {
    if (autoScrollFrame !== null) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
    autoScrolling = false;
  };

  const isAtBottom = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const viewportBottom = scrollTop + window.innerHeight;
    return viewportBottom >= document.documentElement.scrollHeight - BOTTOM_THRESHOLD;
  };

  const runAutoScroll = () => {
    if (!autoScrolling) return;

    if (isAtBottom()) {
      // Fast reset to the very top, then immediately continue slowly downward.
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.scrollBy(0, AUTO_SCROLL_SPEED);
    }

    autoScrollFrame = requestAnimationFrame(runAutoScroll);
  };

  const startAutoScroll = () => {
    if (autoScrolling || activityLocked) return;
    autoScrolling = true;
    runAutoScroll();
  };

  const resetIdleTimer = () => {
    activityLocked = true;
    stopAutoScroll();

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      activityLocked = false;
      startAutoScroll();
    }, AUTO_SCROLL_DELAY);
  };

  // Real user interactions pause auto-scroll and restart the 2-second countdown.
  const userActivity = (event) => {
    if (event.type === "scroll" && autoScrolling) return;
    resetIdleTimer();
  };

  ["mousemove", "mousedown", "touchstart", "touchmove", "keydown", "click", "wheel"].forEach((eventName) => {
    window.addEventListener(eventName, userActivity, { passive: true });
  });

  // A normal user scroll should also count as activity.
  window.addEventListener("scroll", (event) => {
    if (!autoScrolling) resetIdleTimer();
  }, { passive: true });

  // Start the first idle countdown when the page is loaded.
  resetIdleTimer();
});
