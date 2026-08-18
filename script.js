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


/* MYNJU AUTO SCROLL + KARAOKE READER */
document.addEventListener("DOMContentLoaded", () => {
  const AUTO_SCROLL_DELAY = 2000;
  const AUTO_SCROLL_SPEED = 1.3; // 2x faster
  const BOTTOM_THRESHOLD = 4;

  let idleTimer = null;
  let autoScrollFrame = null;
  let autoScrolling = false;
  let activityLocked = false;
  let speechEnabled = true;
  let currentUtterance = null;
  let speechToken = 0;
  let readingIndex = -1;

  // Content that can be read aloud. Navigation/buttons are intentionally excluded.
  const readSelector = [
    ".hero .eyebrow", ".hero h1", ".hero .lead",
    ".hero .actions a", "#collection h2", "#collection .section-sub",
    "#collection .product-card", "#about h2", "#about p", "#about .about-card",
    "footer p", "footer a"
  ].join(",");

  const readingEls = [...document.querySelectorAll(readSelector)]
    .filter(el => el.textContent.trim())
    .filter((el, i, arr) => !arr.some((other, j) => j < i && other.contains(el)));

  // Wrap words so the active spoken word can be highlighted.
  const prepareKaraoke = () => {
    readingEls.forEach(el => {
      if (el.dataset.karaokeReady) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeValue.trim()) nodes.push(node);
      }
      nodes.forEach(node => {
        const frag = document.createDocumentFragment();
        const parts = node.nodeValue.split(/(\s+)/);
        parts.forEach(part => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part) {
            const span = document.createElement("span");
            span.className = "karaoke-word";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      });
      el.dataset.karaokeReady = "true";
    });
  };

  const clearHighlights = () => {
    document.querySelectorAll(".karaoke-word.active").forEach(w => w.classList.remove("active"));
  };

  const stopSpeech = () => {
    speechToken++;
    window.speechSynthesis?.cancel();
    currentUtterance = null;
    clearHighlights();
  };

  const getWords = el => [...el.querySelectorAll(".karaoke-word")];

  const speakElement = (el, token) => {
    if (!speechEnabled || !("speechSynthesis" in window) || token !== speechToken) return;
    const words = getWords(el);
    const text = words.map(w => w.textContent).join(" ").trim();
    if (!text) return;

    clearHighlights();
    el.classList.add("karaoke-reading");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang === "id" ? "id-ID" : "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Chrome/Edge usually provide word boundaries. We use the character index
    // to synchronize the visual highlight with the spoken word.
    utterance.onboundary = event => {
      if (token !== speechToken || event.name !== "word") return;
      let cursor = 0;
      let active = -1;
      for (let i = 0; i < words.length; i++) {
        const start = cursor;
        const end = start + words[i].textContent.length;
        if (event.charIndex >= start && event.charIndex < end) {
          active = i;
          break;
        }
        cursor = end + 1;
      }
      words.forEach((w, i) => w.classList.toggle("active", i === active));
    };

    utterance.onend = () => {
      if (token !== speechToken) return;
      el.classList.remove("karaoke-reading");
      clearHighlights();
      currentUtterance = null;
    };

    utterance.onerror = () => {
      if (token === speechToken) {
        el.classList.remove("karaoke-reading");
        clearHighlights();
        currentUtterance = null;
      }
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopAutoScroll = () => {
    if (autoScrollFrame !== null) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
    autoScrolling = false;
    stopSpeech();
    readingIndex = -1;
  };

  const isAtBottom = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    return scrollTop + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_THRESHOLD;
  };

  const getVisibleReadingIndex = () => {
    const viewportLine = window.innerHeight * 0.42;
    let best = -1;
    let bestDistance = Infinity;

    readingEls.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      if (r.bottom > 50 && r.top < window.innerHeight - 30) {
        const distance = Math.abs(center - viewportLine);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
    });
    return best;
  };

  const syncReader = () => {
    if (!autoScrolling || !speechEnabled) return;
    const idx = getVisibleReadingIndex();
    if (idx === -1 || idx === readingIndex) return;

    readingIndex = idx;
    stopSpeech();
    const token = speechToken;
    speakElement(readingEls[idx], token);
  };

  const runAutoScroll = () => {
    if (!autoScrolling) return;

    if (isAtBottom()) {
      stopSpeech();
      readingIndex = -1;
      window.scrollTo({ top: 0, behavior: "instant" });
      // Let the browser paint the new position before restarting the reader.
      requestAnimationFrame(() => {
        if (autoScrolling) syncReader();
      });
    } else {
      window.scrollBy(0, AUTO_SCROLL_SPEED);
      syncReader();
    }

    autoScrollFrame = requestAnimationFrame(runAutoScroll);
  };

  const startAutoScroll = () => {
    if (autoScrolling || activityLocked) return;
    autoScrolling = true;
    syncReader();
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

  const userActivity = event => {
    if (event.type === "scroll" && autoScrolling) return;
    resetIdleTimer();
  };

  ["mousemove", "mousedown", "touchstart", "touchmove", "keydown", "click", "wheel"].forEach(name => {
    window.addEventListener(name, userActivity, { passive: true });
  });

  window.addEventListener("scroll", () => {
    if (!autoScrolling) resetIdleTimer();
  }, { passive: true });

  // Small floating reader control.
  const readerButton = document.createElement("button");
  readerButton.className = "karaoke-toggle";
  readerButton.type = "button";
  readerButton.setAttribute("aria-label", "Toggle karaoke voice");
  readerButton.innerHTML = '<span>🔊</span><b>VOICE ON</b>';
  document.body.appendChild(readerButton);

  readerButton.addEventListener("click", e => {
    e.stopPropagation();
    speechEnabled = !speechEnabled;
    readerButton.classList.toggle("off", !speechEnabled);
    readerButton.innerHTML = speechEnabled
      ? '<span>🔊</span><b>VOICE ON</b>'
      : '<span>🔇</span><b>VOICE OFF</b>';

    if (!speechEnabled) stopSpeech();
    else if (autoScrolling) {
      readingIndex = -1;
      syncReader();
    }
  });

  prepareKaraoke();
  resetIdleTimer();
});
