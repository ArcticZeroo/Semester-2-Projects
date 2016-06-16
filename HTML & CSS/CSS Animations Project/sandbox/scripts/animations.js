function hide(){
	$('.card').css('animation-name','hide').css('top','260px').css('opacity','0');
}
function show(){
	$('.card').css('animation-name','show').css('top','160px').css('opacity','1');
}
$(document).ready(function(){
	var shown = 0;
	$('#fab').click(function(){
		console.log(shown)
		/*if(!shown){
			$('#card').animate({
				opacity: 1,
				top: "-=100"
			}, 500, function(){shown = 1;});
			
		}
		else{
			$('#card').animate({
				opacity: 0,
				top: "+=100"
			}, 500, function(){shown = 0;});
			
		}*/
		if(shown){
			hide();
			shown = 0;
		}
		else{
			show();
			shown = 1;
		}
	
	})
});
//Loading animations
$(document).ready(function(){
	setTimeout(function(){
		$('#fab').css('height', '56px').css('width','56px').css('opacity','1');
	}, 700);
	setTimeout(function(){
		$('#topbar').css('opacity','1');
	}, 600);
	setTimeout(function(){
		$('#bottombar').css('opacity','1');
	}, 1100);
	setTimeout(function(){
		$('#title').css('opacity','1');
	}, 1900);
	setTimeout(function(){
		$('#subtitle').css('opacity','1');
	}, 2100);
	setTimeout(function(){
		$('#hamburger span').css('opacity','1');
	}, 2250);
});
	var menuOpen = 0;
$(document).ready(function(){
	$('#hamburger').click(function(){
		console.log("Hamburger clicked");
		menuOpen = 1;
		$('#hamburger').removeClass('menuStart').addClass('menu-open');
		$('#hamburgerMenu').css('animation-name','menuOpen').show().css('width','320px');;
		$('#screenCover').show().css('animation-name', 'fade-in-cover');
		$('#hamburgerContent').show().removeClass('leave').addClass('fade-in');
	});
	$('#screenCover').click(function(){
		if(menuOpen){
			$('#hamburger').removeClass('menu-open');
			$('#hamburgerMenu').css('animation-name', 'menuClose');
			$('#screenCover').show().css('animation-name', 'fade-out-cover');
			$('#hamburgerContent').removeClass('fade-in').addClass('leave');
			setTimeout(function(){
				$('#screenCover').hide();
				$('#hamburgerMenu').css('width','0px').hide();
			}, 675);
		}
	});
})