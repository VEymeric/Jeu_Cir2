var animation = function(sprite){
    sprite.animations.add('right',[8,9,10,11],10,true);
    sprite.animations.add('left',[4,5,6,7],10,true);
    sprite.animations.add('up',[12,13,14,15],10,true);
    sprite.animations.add('down',[0,1,2,3],10,true);
}

var NPC = function(skin){
    //création du sprite a une position aléatoire
    this.Sprite = game.add.sprite(game.rnd.between(30, game.width-30), game.rnd.between(30, game.height-30), skin);
    this.Sprite.name = skin;
    //les differents mouvement du sprite
    animation(this.Sprite);

    //collision
    game.physics.arcade.enable(this.Sprite,true);
    
    this.Sprite.body.setSize(18, 40, 1, 12);
    this.Sprite.body.collideWorldBounds = true;

    //caracteristique du sprite
    this.Sprite.anchor.setTo(0.5, 0.5);
    //this.Sprite.scale.setTo(0.5);

    //temps d'attente de base
    this.wait = game.rnd.between(0, 50);

    //point d'arrivé
    this.arriveex = game.rnd.between(50, game.width-50);
    this.arriveey = game.rnd.between(50, game.height-50);
    this.Sprite.alive = true;
    this.detected = false;
    this.out = false;
    this.Sprite.mistake = false;
    this.target = -1;
    //Comportement du personnage
    this.aiType = game.rnd.between(0, 3);
    this.inPriorityMove = false;
    
    
};

NPC.prototype = Object.create(Phaser.Sprite.prototype);
NPC.prototype.constructor = NPC;
NPC.prototype.moveToXY = function(x, y){
    //si le point d'arrivée n'est pas en diagonale, on avance en ligne droite
    if((Math.abs(this.Sprite.x - this.arriveex) < 10) && (Math.abs(this.Sprite.y - this.arriveey) < 10)){
        return;
    }
    if(Math.abs(Math.abs(x-this.Sprite.x) - Math.abs(y - this.Sprite.y)) > v){
        if(Math.abs(x-this.Sprite.x) > Math.abs(y - this.Sprite.y)){
            if(x > this.Sprite.x){
                this.Sprite.x += Math.sqrt(2) * v;
                this.Sprite.animations.play('right');
                return;
            }else{
                this.Sprite.x -= Math.sqrt(2) * v;
                this.Sprite.animations.play('left');
                return;
            }
        }else{
            if(y > this.Sprite.y){
                this.Sprite.y += Math.sqrt(2) * v;
                this.Sprite.animations.play('down');
                return;
            }else{
                this.Sprite.y -= Math.sqrt(2) * v;
                this.Sprite.animations.play('up');
                return;
            }
        }
        //sinon on prend la diagonale
    }else{
        if(Math.abs(this.Sprite.x - x) > v){
            if( (this.Sprite.x > x)&&(this.Sprite.y > y) ){
                this.Sprite.x -=v; this.Sprite.y -= v;
                this.Sprite.animations.play('left');
                return;
            }
            if( (this.Sprite.x > x)&&(this.Sprite.y < y) ){
                this.Sprite.x -=v; this.Sprite.y += v;
                this.Sprite.animations.play('left');
                return;
            }
            if( (this.Sprite.x < x)&&(this.Sprite.y > y) ){
                this.Sprite.x +=v; this.Sprite.y -= v;
                this.Sprite.animations.play('right');
                return;
            }
            if( (this.Sprite.x < x)&&(this.Sprite.y < y) ){
                this.Sprite.x +=v; this.Sprite.y += v;
                this.Sprite.animations.play('right');
                return;
            }
        }
    }
}
NPC.prototype.iaEasy = function(myArray){
    this.target = game.rnd.between(0, myArray.length-1);
    this.arriveex = myArray[this.target].Sprite.x;
    this.arriveey = myArray[this.target].Sprite.y;
}

NPC.prototype.iaEasy2 = function(myArray){
    if(this.detected){
        this.target = game.rnd.between(0, myArray.length-1);
        this.arriveex = myArray[this.target].Sprite.x;
        this.arriveey = myArray[this.target].Sprite.y;
        game.physics.arcade.overlap(this.Sprite, myArray[this.target].Sprite, this.PkillNPC);
        this.moveToXY(this.arriveex,this.arriveey);
    }else{
        for(var i=0 ; i<myArray.length-1 ; i++){
        	game.physics.arcade.overlap(this.Sprite, myArray[i].Sprite, this.PkillNPC);
        }
        if((Math.abs(this.Sprite.x - this.arriveex) < 10) && (Math.abs(this.Sprite.y - this.arriveey) < 10))
            this.findClosePoint();
        this.moveToXY(this.arriveex, this.arriveey);
    }
}
NPC.prototype.iaMedium = function(myArray, nbIA){
    if(this.target == -1){
        this.target = game.rnd.between(0, npcs-1);
        return;
    }
    if(!myArray[this.target].Sprite.alive){
        this.Sprite.animations.stop();
        this.target = -1;
        return;
    }
    game.physics.arcade.overlap(this.Sprite, myArray[this.target].Sprite, this.PkillNPC);
    this.arriveex = myArray[this.target].Sprite.x;
    this.arriveey = myArray[this.target].Sprite.y;
    this.moveToXY(this.arriveex, this.arriveey);
}

NPC.prototype.iaHard = function(myArray, nbIA){
    if(this.target != this.closiestIAalive(myArray)){
        this.target = this.closiestIAalive(myArray);

    }
    if(!myArray[this.target].Sprite.alive){
        this.randomMove();
    }
    if((game.physics.arcade.distanceToPointer(this.Sprite) > 200)) {
        this.arriveex = myArray[this.target].Sprite.x;
        this.arriveey = myArray[this.target].Sprite.y;
        game.physics.arcade.overlap(this.Sprite, myArray[this.target].Sprite, this.PkillNPC);
    }
    if((Math.abs(this.Sprite.x - this.arriveex) < 10) && (Math.abs(this.Sprite.y - this.arriveey) < 10)){
        this.randomMove();
    }
    this.moveToXY(this.arriveex, this.arriveey);
}

NPC.prototype.closiestIAalive = function(myArray){
    var ia = 1;
    while(!myArray[ia].Sprite.alive){ia++;} //on veut une ia en vie pour commencer (il en existe au moins une)
    var range = Math.sqrt(Math.pow(this.Sprite.x-myArray[ia].Sprite.x)+Math.pow(this.Sprite.y-myArray[ia].Sprite.y));
    for(var i=1; i<myArray.length ; i++){
        if(myArray[i].Sprite.alive && Math.sqrt(Math.pow(this.Sprite.x-myArray[i].Sprite.x)+Math.pow(this.Sprite.y-myArray[i].Sprite.y)) < range) {
            ia = i;
            range =Math.sqrt(Math.pow(this.Sprite.x-myArray[i].Sprite.x)+Math.pow(this.Sprite.y-myArray[i].Sprite.y));
        }
    }
    return ia;
}

NPC.prototype.PkillNPC = function (me, Ennemi) {
    if(Ennemi.alive == true){
        sons['coller'].play();
        Ennemi.alive = false;
        npcsLeft--;
        npcDisp.setText('Npcs:'+npcsLeft+'/'+npcs);
        this.target =-1;
    }
}

NPC.prototype.randomMove = function(){
    if(this.wait>0){    // si je suis sensé attendre, je réduis ce temps
        this.wait--;
        return;
    }
    this.arriveex = this.Sprite.x;
    this.arriveey = this.Sprite.y;
    this.Sprite.animations.stop();
    var choix = game.rnd.between(0, 100);
    if(choix < 50){
        this.wait = game.rnd.between(0, 50);
        return;
    }
    else if(choix < 80){
        this.findClosePoint();
        this.moveToXY(this.arriveex, this.arriveey);
    }
    else{
        this.findDistantPoint();
        this.moveToXY(this.arriveex, this.arriveey);
    }
}

NPC.prototype.AI0 = function(){
    if((Math.abs(this.Sprite.x - this.arriveex) < 50) && (Math.abs(this.Sprite.y - this.arriveey) < 50)){
        this.randomMove();
    }else{
      this.moveToXY(this.arriveex, this.arriveey);
    }
}

//Runner v1
NPC.prototype.AI1 = function(){
    //Light to close 
    if(Phaser.Math.roundTo(Phaser.Math.distance(this.Sprite.x, this.Sprite.y, game.input.x, game.input.y), 0) < viseur.radius/1.5 && this.inPriorityMove == false){
        this.inPriorityMove = true;
        //If stuck in a corner, head to the center
        //Else move in the opposite direction of the light
        if (this.Sprite.x < game.input.x && this.Sprite.y < game.input.y){
            if(this.Sprite.x < 40 && this.Sprite.y < 40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.max(30, this.Sprite.x - viseur.radius/1.5), Phaser.Math.max(40, this.Sprite.x - viseur.radius / 2));
                this.arriveey = game.rnd.between(Phaser.Math.max(30, this.Sprite.y - viseur.radius/1.5), Phaser.Math.max(40, this.Sprite.y - viseur.radius / 2));
            }
        }

        if (this.Sprite.x < game.input.x && this.Sprite.y > game.input.y){
            if(this.Sprite.x < 40 && this.Sprite.y > game.height-40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.max(30, this.Sprite.x - viseur.radius/2), Phaser.Math.max(40, this.Sprite.x - viseur.radius/2));
                this.arriveey = game.rnd.between(Phaser.Math.min(game.height-40, this.Sprite.y + viseur.radius/2), Phaser.Math.min(game.height-30, this.Sprite.y + viseur.radius/2));
            }                
        }

        if (this.Sprite.x > game.input.x && this.Sprite.y < game.input.y){
            if(this.Sprite.x > game.width-40 && this.Sprite.y < 40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.min(game.width-40, this.Sprite.x + viseur.radius/2), Phaser.Math.min(game.width-30, this.Sprite.x + viseur.radius/2));
                this.arriveey = game.rnd.between(Phaser.Math.max(30, this.Sprite.y - viseur.radius/2), Phaser.Math.max(40, this.Sprite.y - viseur.radius/2));
            }
        }

        if (this.Sprite.x > game.input.x && this.Sprite.y > game.input.y){
            if(this.Sprite.x > game.width-40 && this.Sprite.y > game.height-40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.min(game.width-40, this.Sprite.x + viseur.radius/2), Phaser.Math.min(game.width-30, this.Sprite.x + viseur.radius/2));
                this.arriveey = game.rnd.between(Phaser.Math.min(game.height-40, this.Sprite.y + viseur.radius/2), Phaser.Math.min(game.height-30, this.Sprite.y + viseur.radius/2));
            }
        }

        
        this.moveToXY(this.arriveex, this.arriveey);
    //Else don't consider light and move somewhere else
    }else{
        if( (Math.abs(this.Sprite.x - this.arriveex) > 50) && (Math.abs(this.Sprite.y - this.arriveey) > 50) ){
            this.moveToXY(this.arriveex, this.arriveey);
        }else{
            this.inPriorityMove = false;
            if((Math.abs(this.Sprite.x - this.arriveex) < 50) && (Math.abs(this.Sprite.y - this.arriveey) < 50)){
                this.randomMove();
            }else{
              this.moveToXY(this.arriveex, this.arriveey);
            }
        }
    }
}


//Move to the light
NPC.prototype.AI2 = function(){
    if(this.wait == 0){
        if(Phaser.Math.roundTo(Phaser.Math.distance(this.Sprite.x, this.Sprite.y, game.input.x, game.input.y), 0) < viseur.radius*1.5 && this.inPriorityMove==false){
            var rand = game.rnd.between(1,10);
            if(rand < 2){
                this.wait = game.rnd.between(0, 100);
            }else{
                if(rand < 7){
                    this.arriveex = game.rnd.between(Phaser.Math.max(30, game.input.x - viseur.radius/2), Phaser.Math.min(game.width-30, game.input.x + viseur.radius/2));
                    this.arriveey = game.rnd.between(Phaser.Math.max(30, game.input.y - viseur.radius/2), Phaser.Math.min(game.height-30, game.input.y + viseur.radius/2));
                    this.moveToXY(this.arriveex,this.arriveey);
                }else{
                    this.randomMove();
                }
            }
            this.inPriorityMove = true;
        }else{
            if ((Math.abs(this.Sprite.x - this.arriveex) > 50) && (Math.abs(this.Sprite.y - this.arriveey) > 50)) {
                this.moveToXY(this.arriveex,this.arriveey);
            }else{
                this.inPriorityMove = false;
                if((Math.abs(this.Sprite.x - this.arriveex) < 50) && (Math.abs(this.Sprite.y - this.arriveey) < 50)){
                    this.randomMove();
                }else{
                    this.moveToXY(this.arriveex, this.arriveey);
                }
            }
        }
    }else{
        this.wait --;
    }
}

//Run away from close action on NPC
NPC.prototype.AI3 = function(){
    if(this.inPriorityMove){
        if (this.Sprite.x < this.arriveex && this.Sprite.y < this.arriveey){
            if(this.Sprite.x < 40 && this.Sprite.y < 40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.max(30, this.arriveex - viseur.radius/1.5), Phaser.Math.max(40, this.arriveex - viseur.radius / 2));
                this.arriveey = game.rnd.between(Phaser.Math.max(30, this.arriveey - viseur.radius/1.5), Phaser.Math.max(40, this.arriveey - viseur.radius / 2));
            }
        }

        if (this.Sprite.x < this.arriveex && this.Sprite.y > this.arriveey){
            if(this.Sprite.x < 40 && this.Sprite.y > game.height-40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.max(30, this.arriveex - viseur.radius/2), Phaser.Math.max(40, this.arriveex - viseur.radius/2));
                this.arriveey = game.rnd.between(Phaser.Math.min(game.height-40, this.arriveey + viseur.radius/2), Phaser.Math.min(game.height-30, this.arriveey + viseur.radius/2));
            }                
        }

        if (this.Sprite.x > this.arriveex && this.Sprite.y < this.arriveey){
            if(this.Sprite.x > game.width-40 && this.Sprite.y < 40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.min(game.width-40, this.arriveex + viseur.radius/2), Phaser.Math.min(game.width-30, this.arriveex + viseur.radius/2));
                this.arriveey = game.rnd.between(Phaser.Math.max(30, this.arriveey - viseur.radius/2), Phaser.Math.max(40, this.arriveey - viseur.radius/2));
            }
        }

        if (this.Sprite.x > this.arriveex && this.Sprite.y > this.arriveey){
            if(this.Sprite.x > game.width-40 && this.Sprite.y > game.height-40){
                this.arriveex = game.world.centerX;
                this.arriveey = game.world.centerY;
            }else{
                this.arriveex = game.rnd.between(Phaser.Math.min(game.width-40, this.arriveex + viseur.radius/2), Phaser.Math.min(game.width-30, this.arriveex + viseur.radius/2));
                this.arriveey = game.rnd.between(Phaser.Math.min(game.height-40, this.arriveey + viseur.radius/2), Phaser.Math.min(game.height-30, this.arriveey + viseur.radius/2));
            }
        }
        this.moveToXY(this.arriveex, this.arriveey);
        this.inPriorityMove = false;
    }else{
        if ((Math.abs(this.Sprite.x - this.arriveex) > 50) && (Math.abs(this.Sprite.y - this.arriveey) > 50)) {
            this.moveToXY(this.arriveex,this.arriveey);
        }else{
            if((Math.abs(this.Sprite.x - this.arriveex) < 50) && (Math.abs(this.Sprite.y - this.arriveey) < 50)){
                this.randomMove();
            }else{
              this.moveToXY(this.arriveex, this.arriveey);
            }
        }
    }
}

NPC.prototype.findClosePoint = function(){
    var x = game.rnd.between(30, game.width-30);
    var y = game.rnd.between(30, game.height-30);
    while(Math.sqrt(Math.pow(this.Sprite.x - x, 2) + Math.pow(this.Sprite.y - y, 2) ) >= 150){
        x = game.rnd.between(30, game.width-30);
        y = game.rnd.between(30, game.height-30);
    }
    this.arriveex = x;
    this.arriveey = y;
}
// procedure pour trouver un point éloigné
NPC.prototype.findDistantPoint = function(){
    var x = game.rnd.between(30, game.width-30);
    var y = game.rnd.between(30, game.height-30);
    while(Math.sqrt(Math.pow(this.Sprite.x - x, 2) + Math.pow(this.Sprite.y - y, 2) ) <= 250){
        x = game.rnd.between(30, game.width-30);
        y = game.rnd.between(30, game.height-30);
    }
    this.arriveex = x;
    this.arriveey = y;
}

NPC.prototype.IsDetected = function(viseur){
    if( (Phaser.Math.distance(this.Sprite.x, this.Sprite.y+15, game.input.x, game.input.y) <= viseur.radius/2) ){
        if(this.detected == false){
            this.detected = true;
            this.Sprite.name = this.Sprite.name.substring(0, this.Sprite.name.length - 4);
            var frame = this.Sprite.frame;
            this.Sprite.loadTexture(this.Sprite.name);
            this.Sprite.frame = frame;
            animation(this.Sprite);
        }
    }else{
        if(this.detected == true){
            this.detected = false;
            this.Sprite.name += 'dark';
            var frame = this.Sprite.frame;
            this.Sprite.loadTexture(this.Sprite.name);
            this.Sprite.frame = frame;
            animation(this.Sprite);
        }
    }
}


NPC.prototype.willDie = function(){
    if(this.Sprite.y > game.height - 40)  this.Sprite.kill();
    this.arriveex = game.width/2;
    this.arriveey = game.height-30;
    this.moveToXY(this.arriveex, this.arriveey);
}


NPC.prototype.movePlayer = function(mypad, myArray, npcs){
    var left =  (cursors.left.isDown || mypad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || mypad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.2);
    var right = (cursors.right.isDown || mypad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || mypad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.2);
    var up =    (cursors.up.isDown || mypad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || mypad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.2) ;
    var down =  (cursors.down.isDown || mypad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || mypad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.2) ;
    var action =(mypad.isDown(Phaser.Gamepad.XBOX360_A));
      
    // mouvements annulés
    //si opposés
    if(left == true && right == true){
        left = false;
        right = false;
    }
    if(up == true && down == true){
        up = false;
        down = false;
    }
    // ou si à la limite du terrain
    if(this.Sprite.x > game.width - 20)right = false;
    if(this.Sprite.x < 20) left = false;
    if(this.Sprite.y > game.height - 30)down = false;
    if(this.Sprite.y < 30)up = false;


    //actions:
    if(action){
        for(var i = 0; i < npcs; i++){
            game.physics.arcade.overlap(this.Sprite, myArray[i].Sprite, this.PkillNPC);
        }
    }
    //diagonales : 2 input non opposé
    if( left && up ){
        this.Sprite.x -= v;
        this.Sprite.y -= v;
        this.Sprite.animations.play('left');
        return;

    }
    if( left && down ){
        this.Sprite.x -= v;
        this.Sprite.y += v;
        this.Sprite.animations.play('left');
        return;
    }
    if( right && up ){
        this.Sprite.x += v;
        this.Sprite.y -= v;
        this.Sprite.animations.play('right');
        return;
    }
    if( right && down ){
        this.Sprite.x += v;
        this.Sprite.y += v;
        this.Sprite.animations.play('right');
        return;
    }
    //direction simple 1 ou 3 input
    if( left ){
        this.Sprite.x -= Math.sqrt(2) * v;
        this.Sprite.animations.play('left');
        return;
    }
    if( right ){
        this.Sprite.x += Math.sqrt(2) * v;
        this.Sprite.animations.play('right');
        return;
    }
    if(up){
        this.Sprite.y -= Math.sqrt(2) * v;
        this.Sprite.animations.play('up');
        return;
    }
    if( down ){
        this.Sprite.y += Math.sqrt(2) * v;
        this.Sprite.animations.play('down');
        return;
    }
    // si pas d'input ou input opposé
    this.Sprite.animations.stop();
}
