
﻿
FlyClass=EntityClass.extend({id:"Fly",count_id:"Fly",speed:1,angle:0,zindex:30,rotation_dir:1,_killed:false,markForDeath:false,escaped:false,time_trapped:0,evil:false,physBody:null,init:function(x,y){this.parent(x,y);var startPos={x:x,y:y};var entityDef={id:"Fly",type:'dynamic',x:startPos.x,y:startPos.y,halfHeight:40,halfWidth:40,angle:0,userData:{"id":"Fly","ent":this}};this.physBody=gPhysicsEngine.addBody(entityDef);this.physBody.SetLinearVelocity(new Vec2(0,0));this.physBody.linearDamping=0;},kill:function(){gPhysicsEngine.removeBody(this.physBody);this.physBody=null;this._killed=true;},update:function(){if(this.markForDeath==true){this.kill();return;}
var angle_variation=Math.floor(Math.random()*360);if((this.pos.x>canvas.width+(this.size.width/2))||(this.pos.y>canvas.height-200)||(this.pos.x<-(this.size.width/2))||(this.pos.y<-(this.size.height/2))){if(this.escaped){if((this.pos.x>canvas.width+80)||(this.pos.y>canvas.height+80)||(this.pos.x<-80)||(this.pos.y<-80)||(((new Date()).getTime()/1000)-this.time_trapped>5)){this.markForDeath=true;console.log("Fly is out of screen and it's going to suicide!!! ID:"+this.count_id);}
angle_variation=0;}else{this.escaped=true;angle_variation=180;this.time_trapped=(new Date()).getTime()/1000;}}else{this.escaped=false;if((Math.floor(Math.random()*100)%97)!=0){angle_variation=angle_variation/30;}else if((angle_variation%7)==0){this.rotation_dir=-this.rotation_dir;}}
var radians=angle_variation*(Math.PI/180);var new_radians=(this.rotation_dir*radians)+this.angle;var new_degrees=(new_radians*(180/Math.PI))%360;new_radians=new_degrees*(Math.PI/180);this.physBody.SetAngle(new_radians);var move_dir=new Vec2(0,0);move_dir.x=this.speed*Math.cos(this.physBody.GetAngle());move_dir.y=this.speed*Math.sin(this.physBody.GetAngle());if(move_dir.LengthSquared()){move_dir.Normalize();move_dir.Multiply(this.speed);}
this.physBody.SetLinearVelocity(move_dir);if(this.size.width==0&&this.size.height==0){var sprite=getSprite(this.spritename+'.png');if((sprite.w!=null)&&(sprite.h!=null)){this.size.width=sprite.w;this.size.height=sprite.h;}}},updateCatch:function(fire_x,fire_y){if(!this.markForDeath){var fuzz=30;var tongue={left:fire_x-fuzz,right:fire_x+fuzz,top:fire_y-fuzz,bottom:fire_y+fuzz};var fly={left:this.pos.x-fuzz,right:this.pos.x+fuzz,top:this.pos.y-fuzz,bottom:this.pos.y+fuzz};if(!(tongue.left>fly.right||tongue.right<fly.left||tongue.top>fly.bottom||tongue.bottom<fly.top)){this.markForDeath=true;console.log("This fly has been captured and it's going to die!!! ID:"+this.count_id);return true;}}},draw:function(){if(this.spritename){if(this.evil){var grd=context.createRadialGradient(this.pos.x,this.pos.y,1,this.pos.x,this.pos.y,this.size.width);grd.addColorStop(1,'rgba(10,200,20,0)');grd.addColorStop(0,'rgba(0,0,0,1)');context.fillStyle=grd;context.fillRect(this.pos.x-this.size.width,this.pos.y-this.size.height,this.size.width*2,this.size.height*2);}
if(this.markForDeath){var grd=context.createRadialGradient(this.pos.x,this.pos.y,1,this.pos.x,this.pos.y,this.size.width);grd.addColorStop(1,'rgba(10,10,15,0)');grd.addColorStop(0,'rgba(0,0,0,1)');context.fillStyle=grd;context.fillRect(this.pos.x-this.size.width,this.pos.y-this.size.height,this.size.width*2,this.size.height*2);drawSprite('dead-fly.png',this.pos.x,this.pos.y,this.angle,context);}else{var real_spritename=this.spritename+'.png';drawSprite(real_spritename,this.pos.x,this.pos.y,this.angle,context);}}}});gEngine.factory['Fly']=FlyClass;