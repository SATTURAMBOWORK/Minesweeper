function loadLandingScreen(){
  document.querySelector('body').innerHTML=` <img src="images/Gemini_Generated_Image_gzwwrcgzwwrcgzww.png" class="loadingpage">`;
}


function loadGameScreen(){
  
}

loadLandingScreen();
setTimeout(loadGameScreen, 3000);