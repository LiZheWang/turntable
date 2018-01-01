(function($) {
var supportedCSS,styles=document.getElementsByTagName("head")[0].style,toCheck="transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
for (var a=0;a<toCheck.length;a++) if (styles[toCheck[a]] !== undefined) supportedCSS = toCheck[a];
// Bad eval to preven google closure to remove it from code o_O
// After compresion replace it back to var IE = 'v' == '\v'
var IE = eval('"v"=="\v"');

jQuery.fn.extend({
    rotate:function(parameters)
    {
        if (this.length===0||typeof parameters=="undefined") return;
            if (typeof parameters=="number") parameters={angle:parameters};
        var returned=[];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {

                    var paramClone = $.extend(true, {}, parameters); 
                    var newRotObject = new Wilq32.PhotoEffect(element,paramClone)._rootObj;

                    returned.push($(newRotObject));
                }
                else {
                    element.Wilq32.PhotoEffect._handleRotation(parameters);
                }
            }
            return returned;
    },
    getRotateAngle: function(){
        var ret = [];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    ret[i] = element.Wilq32.PhotoEffect._angle;
                }
            }
            return ret;
    },
    stopRotate: function(){
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    clearTimeout(element.Wilq32.PhotoEffect._timer);
                }
            }
    }
});

// Library agnostic interface

Wilq32=window.Wilq32||{};
Wilq32.PhotoEffect=(function(){

	if (supportedCSS) {
		return function(img,parameters){
			img.Wilq32 = {
				PhotoEffect: this
			};
            
            this._img = this._rootObj = this._eventObj = img;
            this._handleRotation(parameters);
		}
	} else {
		return function(img,parameters) {
			// Make sure that class and id are also copied - just in case you would like to refeer to an newly created object
            this._img = img;

			this._rootObj=document.createElement('span');
			this._rootObj.style.display="inline-block";
			this._rootObj.Wilq32 = 
				{
					PhotoEffect: this
				};
			img.parentNode.insertBefore(this._rootObj,img);
			
			if (img.complete) {
				this._Loader(parameters);
			} else {
				var self=this;
				// TODO: Remove jQuery dependency
				jQuery(this._img).bind("load", function()
				{
					self._Loader(parameters);
				});
			}
		}
	}
})();

Wilq32.PhotoEffect.prototype={
    _setupParameters : function (parameters){
		this._parameters = this._parameters || {};
        if (typeof this._angle !== "number") this._angle = 0 ;
        if (typeof parameters.angle==="number") this._angle = parameters.angle;
        this._parameters.animateTo = (typeof parameters.animateTo==="number") ? (parameters.animateTo) : (this._angle); 

        this._parameters.step = parameters.step || this._parameters.step || null;
		this._parameters.easing = parameters.easing || this._parameters.easing || function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; }
		this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
        this._parameters.callback = parameters.callback || this._parameters.callback || function(){};
        if (parameters.bind && parameters.bind != this._parameters.bind) this._BindEvents(parameters.bind); 
	},
	_handleRotation : function(parameters){
          this._setupParameters(parameters);
          if (this._angle==this._parameters.animateTo) {
              this._rotate(this._angle);
          }
          else { 
              this._animateStart();          
          }
	},

	_BindEvents:function(events){
		if (events && this._eventObj) 
		{
            // Unbinding previous Events
            if (this._parameters.bind){
                var oldEvents = this._parameters.bind;
                for (var a in oldEvents) if (oldEvents.hasOwnProperty(a)) 
                        // TODO: Remove jQuery dependency
                        jQuery(this._eventObj).unbind(a,oldEvents[a]);
            }

            this._parameters.bind = events;
			for (var a in events) if (events.hasOwnProperty(a)) 
				// TODO: Remove jQuery dependency
					jQuery(this._eventObj).bind(a,events[a]);
		}
	},

	_Loader:(function()
	{
		if (IE)
		return function(parameters)
		{
			var width=this._img.width;
			var height=this._img.height;
			this._img.parentNode.removeChild(this._img);
							
			this._vimage = this.createVMLNode('image');
			this._vimage.src=this._img.src;
			this._vimage.style.height=height+"px";
			this._vimage.style.width=width+"px";
			this._vimage.style.position="absolute"; // FIXES IE PROBLEM - its only rendered if its on absolute position!
			this._vimage.style.top = "0px";
			this._vimage.style.left = "0px";

			/* Group minifying a small 1px precision problem when rotating object */
			this._container =  this.createVMLNode('group');
			this._container.style.width=width;
			this._container.style.height=height;
			this._container.style.position="absolute";
			this._container.setAttribute('coordsize',width-1+','+(height-1)); // This -1, -1 trying to fix ugly problem with small displacement on IE
			this._container.appendChild(this._vimage);
			
			this._rootObj.appendChild(this._container);
			this._rootObj.style.position="relative"; // FIXES IE PROBLEM
			this._rootObj.style.width=width+"px";
			this._rootObj.style.height=height+"px";
			this._rootObj.setAttribute('id',this._img.getAttribute('id'));
			this._rootObj.className=this._img.className;			
		    this._eventObj = this._rootObj;	
		    this._handleRotation(parameters);	
		}
		else
		return function (parameters)
		{
			this._rootObj.setAttribute('id',this._img.getAttribute('id'));
			this._rootObj.className=this._img.className;
			
			this._width=this._img.width;
			this._height=this._img.height;
			this._widthHalf=this._width/2; // used for optimisation
			this._heightHalf=this._height/2;// used for optimisation
			
			var _widthMax=Math.sqrt((this._height)*(this._height) + (this._width) * (this._width));

			this._widthAdd = _widthMax - this._width;
			this._heightAdd = _widthMax - this._height;	// widthMax because maxWidth=maxHeight
			this._widthAddHalf=this._widthAdd/2; // used for optimisation
			this._heightAddHalf=this._heightAdd/2;// used for optimisation
			
			this._img.parentNode.removeChild(this._img);	
			
			this._aspectW = ((parseInt(this._img.style.width,10)) || this._width)/this._img.width;
			this._aspectH = ((parseInt(this._img.style.height,10)) || this._height)/this._img.height;
			
			this._canvas=document.createElement('canvas');
			this._canvas.setAttribute('width',this._width);
			this._canvas.style.position="relative";
			this._canvas.style.left = -this._widthAddHalf + "px";
			this._canvas.style.top = -this._heightAddHalf + "px";
			this._canvas.Wilq32 = this._rootObj.Wilq32;
			
			this._rootObj.appendChild(this._canvas);
			this._rootObj.style.width=this._width+"px";
			this._rootObj.style.height=this._height+"px";
            this._eventObj = this._canvas;
			
			this._cnv=this._canvas.getContext('2d');
            this._handleRotation(parameters);
		}
	})(),

	_animateStart:function()
	{	
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this._animateStartTime = +new Date;
		this._animateStartAngle = this._angle;
		this._animate();
	},
    _animate:function()
    {
         var actualTime = +new Date;
         var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;

         // TODO: Bug for animatedGif for static rotation ? (to test)
         if (checkEnd && !this._parameters.animatedGif) 
         {
             clearTimeout(this._timer);
         }
         else 
         {
             if (this._canvas||this._vimage||this._img) {
                 var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
                 this._rotate((~~(angle*10))/10);
             }
             if (this._parameters.step) {
                this._parameters.step(this._angle);
             }
             var self = this;
             this._timer = setTimeout(function()
                     {
                     self._animate.call(self);
                     }, 10);
         }

         // To fix Bug that prevents using recursive function in callback I moved this function to back
         if (this._parameters.callback && checkEnd){
             this._angle = this._parameters.animateTo;
             this._rotate(this._angle);
             this._parameters.callback.call(this._rootObj);
         }
     },

	_rotate : (function()
	{
		var rad = Math.PI/180;
		if (IE)
		return function(angle)
		{
            this._angle = angle;
			this._container.style.rotation=(angle%360)+"deg";
		}
		else if (supportedCSS)
		return function(angle){
            this._angle = angle;
			this._img.style[supportedCSS]="rotate("+(angle%360)+"deg)";
		}
		else 
		return function(angle)
		{
            this._angle = angle;
			angle=(angle%360)* rad;
			// clear canvas	
			this._canvas.width = this._width+this._widthAdd;
			this._canvas.height = this._height+this._heightAdd;
						
			// REMEMBER: all drawings are read from backwards.. so first function is translate, then rotate, then translate, translate..
			this._cnv.translate(this._widthAddHalf,this._heightAddHalf);	// at least center image on screen
			this._cnv.translate(this._widthHalf,this._heightHalf);			// we move image back to its orginal 
			this._cnv.rotate(angle);										// rotate image
			this._cnv.translate(-this._widthHalf,-this._heightHalf);		// move image to its center, so we can rotate around its center
			this._cnv.scale(this._aspectW,this._aspectH); // SCALE - if needed ;)
			this._cnv.drawImage(this._img, 0, 0);							// First - we draw image
		}

	})()
}

if (IE)
{
Wilq32.PhotoEffect.prototype.createVMLNode=(function(){
document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
		try {
			!document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
			return function (tagName) {
				return document.createElement('<rvml:' + tagName + ' class="rvml">');
			};
		} catch (e) {
			return function (tagName) {
				return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
			};
		}		
})();
}
})(jQuery);




//大转盘
(function($, win, doc) {

	var Turnplate = function(elem, options) {
		return this.__init(elem, options || {});
	}

	var turnplate = {
		restaraunts: [], //大转盘奖品名称
		colors: [], //大转盘奖品区块对应背景颜色
		outsideRadius: 192, //大转盘外圆的半径
		textRadius: 155, //大转盘奖品位置距离圆心的距离
		insideRadius: 68, //大转盘内圆的半径
		startAngle: 0, //开始角度
		bRotate: false, //false:停止;ture:旋转

		//奖项配置
		items: [],
		//背景音乐配置
		music: {
			src: "",
			loop: true,
			autoplay: true
		},

		//背景颜色
		bodybg: '#e62d2d',
		//转盘背景图
		bgimg: "",
		//指针图片
		pointerImage: '' ,
		//抽奖完成回调
		complete : null ,
		//是否开启概率 , 开启的话概率和必须是100
		isProbability : true

	};
	
	Turnplate.prototype = {
		__init: function(elem, options) {
			if($(elem).length == 0) {
				console.log("请传入容器对象");
				return false;
			}
			this.html = document.documentElement;
			this.elem = $(elem);
			this.ops = $.extend(true, turnplate, options);
			this.turnplate = this.ops ;

			
			//倒计时处理
			this._timer = null ;
			//qrcode配置
			this.qrcode = null ;
			//概率集合
			this.probability = [];
			
			
			var probabilityValue = 0 ;
			if(this.ops.items && this.ops.items.length) {
				$.each(this.ops.items, function(i, item) {
					turnplate.restaraunts.push(item.txt);
					turnplate.colors.push(item.bgcolor);
					var val = parseFloat(item.val);
					probabilityValue += val ;
					item.item_id = i + 1 ;
				});
			}
			
			if( this.ops.isProbability ){
				if( probabilityValue == 100 ){
					this.__setProbability();
					this.__createUI();
					this.__bindEvent();
				}else{
					console.error("配置错误,items的概率(val)之和必须等于100.当前是：" + probabilityValue);
				}
			}else{
				this.__createUI();
				this.__bindEvent();
			}
			
			this.__setBoxDir() ;
			
			$(window).on("resize",this.__setBoxDir);
			$(window).on("orientationchange",this.__setBoxDir);

			return this;
		},
		
		__setBoxDir:function(){
			var w = $(window).width() , h = $(window).height() , dif = w*0.02 ;
			if( w < h ){h = w ;}else{w = h ;}
			$("#turnplate").css({
				opacity:1 ,
				width:w - dif,
				height : h - dif
			})
		},
		
		__createUI: function() {
			this.__createAudio();
			this.__createCanvas();
			this.__createQrcode();
			this.__setCss();
			this.__drawRouletteWheel();
		},
		
		__bindEvent :function(){
			var _this = this ;
			$(this.showIconBox).on("click",function (){
				_this.start.call(_this) ;
			});
		},
		
		__rnd :function(n,m){
			if( this.ops.isProbability ){
				// 程序控制概率  获取0-99之间的数
				var random = Math.floor( Math.random()*100 );
				var item_id = this.probability[random] ;
				if( item_id ){
					return this.__getCurrentItem(item_id);
				}
				return 0;
			}else{
				//自然随机数  程序不控制概率
				var random = Math.floor(Math.random()*(m-n+1)+n);
				return random;
			}
		},
		
		//获取中奖产品的列表
		__getCurrentItem:function(item_id){
			var result = 0 ;
			if(this.ops.items && this.ops.items.length) {
				$.each(this.ops.items, function(i, item) {
					if( item.item_id == item_id ){
						result = i + 1 ;
						return false ;
					}
				});
			}
			return result ;
		},

		//背景音乐控制
		__createAudio: function() {
			var music = this.ops.music;
			if(music && music.src) {
				this.audioElem = document.createElement("audio");
				this.audioElem.src = music.src;
				this.audioElem.autoplay = music.autoplay;
				this.audioElem.loop = music.loop;
				this.audioElem.oncanplay = function() {
					
				}
			}
		},
		audioPlay:function(){
			this.audioElem.play();
		},
		audioStop:function(){
			this.audioElem.currentTime = 0 ;
			this.audioElem.pause();
		},
		
		__setProbability : function(){
			var _this = this ;
			if(this.ops.items && this.ops.items.length) {
				$.each(this.ops.items, function(index, item) {
					var val = parseInt(item.val);
					for( var i=0;i<val;i++ ){
						_this.probability.push(item.item_id);
					}
				});
			}
		},
	
		__createCanvas: function() {
			this.canvasHtml = '<canvas class="item" id="wheelcanvas" width="422px" height="422px" ></canvas>';
			this.elem.append(this.canvasHtml);
			this.canvas = $("#wheelcanvas");
			var showIconBox = '<div class="showIconBox" id="showIconBox"></div>' ;
			this.elem.append(showIconBox);
			
			var showQrcodeBox = '<div class="showIconBox" id="showQrcodeBox"></div>' ;
			this.elem.append(showQrcodeBox);
			
			
			this.showIconBox = $("#showIconBox") ;
			this.showQrcodeBox = $("#showQrcodeBox") ;
		},
		
		__createQrcode:function(){
			var _this = this ;
			try{
				if( QRCode && typeof QRCode == "function" ){
					var box = document.getElementById("showQrcodeBox");
					if( box ){
						_this.qrcode = new QRCode(box);
					}
				}
			}catch(e){
				console.warn("缺少qrcode.js，生成二维码功能将不可用");
			}
		},

		__setCss: function() {
			this.setBodyBg(this.ops.bodybg);
			this.setBgImage();
		},

		//旋转转盘 item:奖品位置; txt：提示语;
		__rotateFn: function(item, itemData) {
			var _this = this ;
			var angles = item * (360 / turnplate.restaraunts.length) - (360 / (turnplate.restaraunts.length * 2));
			if(angles < 270) {
				angles = 270 - angles;
			} else {
				angles = 360 - angles + 270;
			}
			this.rotateStop();
			this.canvas.rotate({
				angle: 0,
				animateTo: angles + 1800,
				duration: 8000,
				callback: function() {
					turnplate.bRotate = !turnplate.bRotate;
					if( typeof _this.ops.complete == "function" ){
						_this.ops.complete(itemData);
					}
				}
			});
		},

		__drawRouletteWheel: function() {
			var _this = this ;
			var canvas = document.getElementById("wheelcanvas");
			if(canvas.getContext) {
				//根据奖品个数计算圆周角度
				var arc = Math.PI / (turnplate.restaraunts.length / 2);
				var ctx = canvas.getContext("2d");
				//在给定矩形内清空一个矩形
				ctx.clearRect(0, 0, 422, 422);
				//strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
				ctx.strokeStyle = "#FFBE04";
				//font 属性设置或返回画布上文本内容的当前字体属性
				ctx.font = '16px Microsoft YaHei';
				for(var i = 0; i < turnplate.restaraunts.length; i++) {
					var angle = turnplate.startAngle + i * arc;
					ctx.fillStyle = turnplate.colors[i];
					ctx.beginPath();
					//arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）    
					ctx.arc(211, 211, turnplate.outsideRadius, angle, angle + arc, false);
					ctx.arc(211, 211, turnplate.insideRadius, angle + arc, angle, true);
					ctx.stroke();
					ctx.fill();
					//锁画布(为了保存之前的画布状态)
					ctx.save();

					//----绘制奖品开始----
					ctx.fillStyle = "#E5302F";
					var text = turnplate.restaraunts[i];
					var item = turnplate.items[i] ;
					var line_height = 17;
					//translate方法重新映射画布上的 (0,0) 位置
					ctx.translate(211 + Math.cos(angle + arc / 2) * turnplate.textRadius, 211 + Math.sin(angle + arc / 2) * turnplate.textRadius);

					//rotate方法旋转当前的绘图
					ctx.rotate(angle + arc / 2 + Math.PI / 2);

					// 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) 
					if(text.indexOf("M") > 0) { //流量包
						var texts = text.split("M");
						for(var j = 0; j < texts.length; j++) {
							ctx.font = j == 0 ? 'bold 20px Microsoft YaHei' : '16px Microsoft YaHei';
							if(j == 0) {
								ctx.fillText(texts[j] + "M", -ctx.measureText(texts[j] + "M").width / 2, j * line_height);
							} else {
								ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
							}
						}
					} else if(text.indexOf("M") == -1 && text.length > 6) { //奖品名称长度超过一定范围 
						text = text.substring(0, 6) + "||" + text.substring(6);
						var texts = text.split("||");
						for(var j = 0; j < texts.length; j++) {
							ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
						}
					} else {
						//在画布上绘制填色的文本。文本的默认颜色是黑色
						//measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
						ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
					}

					//添加对应图标
					if( item.icon ){
						var img = document.createElement("img") ;
						img.src = item.icon ;
						ctx.drawImage(img, -15, 10);
						img = null ;
					}
					ctx.restore();
				}
			}
		},

		//设置背景色
		setBodyBg: function(color) {
			document.body.style.backgroundColor = color;
		},
		//设置转盘的背景图
		setBgImage: function(options) {
			var ops = $.extend({
				backgroundImage: 'url(' + this.ops.bgimg + ')',
			}, options || {});
			this.elem.css(ops);
		},
		//设置指针位置的图片
		showPointerImage : function(){
			this.showQrcodeBox.css({opacity:0});
			this.pointerHtml = '<img class="pointerImage" src="'+this.ops.pointerImage+'"/>' ;
			$(this.showIconBox).html(this.pointerHtml).css({opacity:1});
		},
		//设置二维码图片
		showQrcodeImage :function(url,isImg,isRadius){
			var _this = this; 
			//this.showIconBox.css({opacity:0});
			if(isImg){
				setTimeout(function(){
					_this.showQrcodeBox.css({
						opacity:1 ,
						backgroundImage : 'url('+url+')'
					})
				},10);
			}else{
				if( this.qrcode != null){
					this.qrcode.makeCode(url) ;
					setTimeout(function(){
						_this.showQrcodeBox.css({opacity:1});
					},10);
				}
			}
			if( isRadius ){
				_this.showQrcodeBox.css({borderRadius:"50%"}) ;
			}
		},
		
		reload : function(){
			window.location.reload() ;
		},
		goBack : function(){
			window.history.goBack() ;
		},
		go : function(url){
			if(url) location.href = url ;
		},
		timeOut : function(time,complete,steping){
			if( typeof time != 'number' ) {console.log("time必须是数字"); return;}
			this.stopTimer();
			steping && steping(time);
			function run (){
				if( time >= 1 ){
					time-- ;
					steping && steping(time);
					this._timer = setTimeout(run, 1000);
				}else{
					complete && complete() ;
				}
			}
			run();
		},
		stopTimer : function() {
			this._timer && clearTimeout(this._timer);
		},
		//设置概率状态
		setProbabilityState : function(state){
			this.ops.isProbability = state ;
		},
		
		isWeiXin : function(){
		    var ua = window.navigator.userAgent.toLowerCase();
		    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
		        return true;
		    }else{
		        return false;
		    }
		},
		
		rotate: function() {
			this.rotateStop();
			this.canvas.rotate({
				angle: 0,
				animateTo: 36000,
				duration: 150000,
				callback: function() {
					turnplate.bRotate = !turnplate.bRotate;
					if( typeof _this.ops.complete == "function" ){
						_this.ops.complete(itemData);
					}
				}
			});
		},
		rotateStop : function(){
			this.canvas.stopRotate();
		},
		
		start : function(){
			if(turnplate.bRotate)return;
			turnplate.bRotate = !turnplate.bRotate;
			//获取随机数(奖品个数范围内)
			var item = this.__rnd(1,turnplate.restaraunts.length);
			//测试概率
			/*
			for( var i=0;i<200;i++ ){
				console.log(this.__rnd(1,turnplate.restaraunts.length));
			}
			*/
			//奖品数量等于10,指针落在对应奖品区域的中心角度[252, 216, 180, 144, 108, 72, 36, 360, 324, 288]
			var itemData = this.ops.items[item-1] ;
			this.__rotateFn(item, itemData);
		}

	}

	win.Turnplate = Turnplate;

})(jQuery, window, document);





