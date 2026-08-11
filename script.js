const hearts=document.querySelectorAll(".heart");
const bagCount=document.getElementById("bagCount");
const notification=document.getElementById("notification");
let wishlistCount=0;

hearts.forEach(heart=>{
  heart.addEventListener("click",()=>{
    heart.classList.toggle("active");
    if(heart.classList.contains("active")){
      heart.textContent="♥"; wishlistCount++; showNotification("♡ Added to your wishlist!");
    }else{
      heart.textContent="♡"; wishlistCount--; showNotification("Removed from your wishlist");
    }
    bagCount.textContent=wishlistCount;
  });
});

function showNotification(message){
  notification.textContent=message;
  notification.classList.add("show");
  setTimeout(()=>notification.classList.remove("show"),2000);
}

const navbar=document.querySelector(".navbar");
window.addEventListener("scroll",()=>{
  navbar.style.boxShadow=window.scrollY>30?"0 8px 30px rgba(36,28,29,.06)":"none";
});

const revealElements=document.querySelectorAll(".product-card,.about-card,.about-decoration");
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity="1";
      entry.target.style.transform="translateY(0)";
      observer.unobserve(entry.target);
    }
  });
},{threshold:.15});

revealElements.forEach(element=>{
  element.style.opacity="0";
  element.style.transform="translateY(30px)";
  element.style.transition="all .7s ease";
  observer.observe(element);
});
