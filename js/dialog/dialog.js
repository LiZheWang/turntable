function loading(type){
	var html = '<div class="loadingBox">'+
					'<div class="line-scale">'+
				      	'<div></div>'+
				      	'<div></div>'+
				      	'<div></div>'+
				     	'<div></div>'+
				     	'<div></div>'+
				    '</div>'+
				'</div>';
	type == "show" ? ( $(".loadingBox").length == 0 && $("body").append(html)) : $(".loadingBox").remove();
	if($(".loadingBox")[0]){
		$(".loadingBox")[0].addEventListener("touchstart",function(e){
			e.preventDefault();
		});
	}
	stopPreventDefault(".loadingBox");
}
function alertBox(txt,time,type,callback){
	
	var imgHtml = '<img src="images/zj_1.png" />' ;
	if( type == "error" ){
		imgHtml = '<img src="images/zj_2.png" />' ;
	}
	var html =  '<div class="modal-box dialogNewBox">'+
					'<div class="modalBoxCon">'+
					'<div class="modal-con">'+
						'<div class="showImage">'+imgHtml+'</div>' +
						txt+
					'</div></div>'+
				'</div>';
	time = time || 1000 ;
	$("body").append(html);
	
	var con = $(".modal-box .modal-con") ;
	$(".modal-box").show();
	
	var rem = 0.67  * 75;
	
	con.css({
		//marginLeft:-((con.width()+rem) / 2),
		//marginTop : -con.height()/2
	}).addClass("modal-con-show");
	
	setTimeout(function(){
		$(".modal-con-show").addClass("modal-con-hide");
		setTimeout(function(){
			$(".modal-box").remove();
			callback && callback();
			if( typeof type == "function" ){
				type && type() ;
			}
		},400);
	},time);
	stopPreventDefault(".modal-box");
}

function stopPreventDefault(elem){
	$(elem).on("touchmove",function(e){
		e.preventDefault();
	})
}