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
