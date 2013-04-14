
Array.prototype.erase=function(item){for(var i=this.length;i--;i){if(this[i]===item)this.splice(i,1);}
return this;};Function.prototype.bind=function(bind){var self=this;return function(){var args=Array.prototype.slice.call(arguments);return self.apply(bind||null,args);};};merge=function(original,extended){for(var key in extended){var ext=extended[key];if(typeof(ext)!='object'||ext instanceof Class){original[key]=ext;}else{if(!original[key]||typeof(original[key])!='object'){original[key]={};}
merge(original[key],ext);}}
return original;};function copy(object){if(!object||typeof(object)!='object'||object instanceof Class){return object;}else if(object instanceof Array){var c=[];for(var i=0,l=object.length;i<l;i++){c[i]=copy(object[i]);}
return c;}else{var c={};for(var i in object){c[i]=copy(object[i]);}
return c;}}
function ksort(obj){if(!obj||typeof(obj)!='object'){return[];}
var keys=[],values=[];for(var i in obj){keys.push(i);}
keys.sort();for(var i=0;i<keys.length;i++){values.push(obj[keys[i]]);}
return values;}
(function(){var initializing=false,fnTest=/xyz/.test(function(){xyz;})?/\bparent\b/:/.*/;this.Class=function(){};var inject=function(prop){var proto=this.prototype;var parent={};for(var name in prop){if(typeof(prop[name])=="function"&&typeof(proto[name])=="function"&&fnTest.test(prop[name])){parent[name]=proto[name];proto[name]=(function(name,fn){return function(){var tmp=this.parent;this.parent=parent[name];var ret=fn.apply(this,arguments);this.parent=tmp;return ret;};})(name,prop[name]);}else{proto[name]=prop[name];}}};this.Class.extend=function(prop){var parent=this.prototype;initializing=true;var prototype=new this();initializing=false;for(var name in prop){if(typeof(prop[name])=="function"&&typeof(parent[name])=="function"&&fnTest.test(prop[name])){prototype[name]=(function(name,fn){return function(){var tmp=this.parent;this.parent=parent[name];var ret=fn.apply(this,arguments);this.parent=tmp;return ret;};})(name,prop[name]);}else{prototype[name]=prop[name];}}
function Class(){if(!initializing){if(this.staticInstantiate){var obj=this.staticInstantiate.apply(this,arguments);if(obj){return obj;}}
for(var p in this){if(typeof(this[p])=='object'){this[p]=copy(this[p]);}}
if(this.init){this.init.apply(this,arguments);}}
return this;}
Class.prototype=prototype;Class.constructor=Class;Class.extend=arguments.callee;Class.inject=inject;return Class;};})();newGuid_short=function(){var S4=function(){return(((1+Math.random())*0x10000)|0).toString(16).substring(1);};return(S4()).toString();};var xhrGet=function(reqUri,callback,object,type){var caller=xhrGet.caller;var myRequest=new XMLHttpRequest();myRequest.open("GET",reqUri,true);if(type){myRequest.responseType=type;}
myRequest.onload=function(){if(callback){try{callback(myRequest,object);}catch(e){throw'xhrGet failed:\n'+reqUri+'\nException: '+e+'\nresponseText: '+myRequest.responseText+'\ncaller: '+caller;}}};myRequest.send();};var findPos=function(obj){var curleft=0,curtop=0;if(obj.offsetParent){do{curleft+=obj.offsetLeft;curtop+=obj.offsetTop;}while(obj=obj.offsetParent);return{x:curleft,y:curtop};}
return undefined;};var setup=function(){player_canvas=document.getElementById('PlayerCanvas');player_context=player_canvas.getContext('2d');player_canvas.focus();canvas=document.getElementById('PlaygroundCanvas');context=canvas.getContext('2d');dynamic_background_canvas=document.getElementById('DynamicBackground');dynamic_background_context=dynamic_background_canvas.getContext('2d');static_background_canvas=document.getElementById('StaticBackground');static_background_context=static_background_canvas.getContext('2d');background_image=new Image();background_image.onload=function(){background_loaded=true;static_background_context.beginPath();static_background_context.rect(0,0,static_background_canvas.width,static_background_canvas.height);static_background_context.fillStyle='LightCyan';static_background_context.fill();static_background_context.drawImage(background_image,0,0,static_background_canvas.width,static_background_canvas.height);var grd=static_background_context.createRadialGradient(1420,170,150,1420,270,400);grd.addColorStop(1,'rgba(250,250,255,0)');grd.addColorStop(0,'rgba(250,250,120,1)');static_background_context.fillStyle=grd;static_background_context.fillRect(0,0,canvas.width,canvas.height);requestAnimationFrame(animateBackground);}
background_image.src='resources/images/mountains.png';var spriteSheet=new SpriteSheetClass();spriteSheet.load('resources/images/sprites.png');xhrGet('resources/images/sprites.json',spriteSheet.parseAtlasDefinition,spriteSheet,null);gEngine.setup();var entityCloud=gEngine.spawnEntity("Cloud");entityCloud.spritename='nube-001';entityCloud.speed=Math.floor(Math.random()*30)+1;entityCloud.zindex=Math.floor(Math.random()*10)+1;entityCloud.pos.x+=Math.floor(Math.random()*1800);entityCloud.pos.y+=Math.floor(Math.random()*100);entityCloud=gEngine.spawnEntity("Cloud");entityCloud.spritename='nube-002';entityCloud.speed=Math.floor(Math.random()*30)+1;entityCloud.zindex=Math.floor(Math.random()*10)+1;entityCloud.pos.x+=Math.floor(Math.random()*1200)+200;entityCloud.pos.y+=Math.floor(Math.random()*100);entityCloud=gEngine.spawnEntity("Cloud");entityCloud.spritename='nube-003';entityCloud.speed=Math.floor(Math.random()*30)+1;entityCloud.zindex=Math.floor(Math.random()*10)+1;entityCloud.pos.x+=Math.floor(Math.random()*800)+100;entityCloud.pos.y+=Math.floor(Math.random()*100);entityCloud=gEngine.spawnEntity("Cloud");entityCloud.spritename='nube-004';entityCloud.speed=Math.floor(Math.random()*30)+1;entityCloud.zindex=Math.floor(Math.random()*10)+1;entityCloud.pos.x+=Math.floor(Math.random()*400);entityCloud.pos.y+=Math.floor(Math.random()*100);if(BrowserDetect.browser!="Chrome"){window.alert("Oops! The game is designed to run in Chrome web browser, playing in this browser may be slow and buggy :(");}
if(BrowserDetect.OS!="Linux"){game_font='Helvetica';}
drawLoadingScreen();requestAnimationFrame(animate);var oHead=document.getElementsByTagName('head').item(0);var boxScript=document.createElement("script");boxScript.type="text/javascript";boxScript.onload=function(){var pHead=document.getElementsByTagName('head').item(0);var pScript=document.createElement("script");pScript.type="text/javascript";pScript.onload=function(){gPhysicsEngine.create();gEngine.player0.physBody=gPhysicsEngine.addBody(gEngine.player0.entityDef);gEngine.player0.physBody.SetLinearVelocity(new Vec2(0,0));gEngine.player0.physBody.linearDamping=0;};pScript.src="pyshics.js";pHead.appendChild(pScript);};boxScript.src="box2D-min.js";oHead.appendChild(boxScript);var fireworksScript=document.createElement("script");fireworksScript.type="text/javascript";fireworksScript.onload=function(){Canvas.canvas=document.getElementById('FireworksCanvas');Canvas.context=Canvas.canvas.getContext('2d');};fireworksScript.src="fireworks.js";oHead.appendChild(fireworksScript);};requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||setTimeout;var player_canvas=null;var player_context=null;var canvas=null;var context=null;var dynamic_background_canvas=null;var dynamic_background_context=null;var static_background_canvas=null;var static_background_context=null;var evil_fly_halo_canvas=null;var dead_fly_halo_canvas=null;var background_image=null;var FPS=14;var introFrame=0;var introSeconds=6;var play_game_intro=true;var sun_angle=0;var background_loaded=false;var game_music_active=false;var sound_atmos_active=false;var victory=false;var end=false;var end_of_game_points=50;var game_font='Verdana';var loading_bars=0;var disable_sound=false;var cheating=false;