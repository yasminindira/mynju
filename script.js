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
