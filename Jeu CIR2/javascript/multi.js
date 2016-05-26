//var meDisplay;
var displayLabel;
var enter;
var change;
var Ready;
var journalist;
var bdeMember;
//---------------------

//var socket;

var updateOk;
var key;
var KeyA
var fin;

var killers;
var killersLeft;
var killersDisp;

var film;
var filmLeft;
var filmDisp;

var npcs;
var npcsLeft;
var npcDisp;

var gameLength;
var timerDisplay;

var multiState = {

    create: function(){
        //socket = io.connect('localhost:3000');
     //----------------------------------   
        $('#Login').show();
        displayLabel = game.add.text(0, 100, 'Connection Page',{font: '30px Arial', fill: '#ffffff'});
        //meDisplay = game.add.text(game.width/3, 100, '',{font: '30px Arial', fill: '#ffffff'});
        //Déclaration des boutons du menu
        enter = game.add.button(game.width/2 +50, game.height/2, 'ready', this.start, this, 1, 0);
        change = game.add.button(game.width/3 -69, game.height/2, 'changeRole', this.chooseRole, this, 1, 0);
        Ready = game.add.button(2*game.width/3 -40, game.height/2, 'play', this.waiting, this, 1, 0);
        journalist = game.add.button(game.width/3 -69, game.height/2, 'journalist', this.journalistChoice, this, 1, 0);
        bdeMember = game.add.button(2*game.width/3 -85, game.height/2, 'bdeMember', this.bdeChoice, this, 1, 0);

        change.visible = false;
        Ready.visible = false;
        journalist.visible = false;
        bdeMember.visible = false;
        //----------------------------------------------------------
        npcs = 10;
        killers = 0;
        killersLeft = 0;
        film = 0;
        filmLeft = 0;
        npcsLeft = 0;
        SpriteArray = {};
        ViseurArray = {};
        maskArray = {};
        PlayerArray = {};
        NpcArray = [];
        cursors = game.input.keyboard.createCursorKeys();
        killspace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        gameLength = timeinit;
        Display = false;
        KeyA = false;
        fin = false;
        updateOk = false;
        timer = game.time.create(false);
        key = game.input.keyboard.addKey(Phaser.Keyboard.A);

        var skindark = ['player1dark', 'player2dark', 'player3dark'];

        socket.on('data', function(){
            socket.emit('data', {
                nb_npc : npcs,
                width : game.width,
                height : game.height
            });
        });

        
        socket.on('logged', function(user){
            //console.log(user);
            me = user;
        });

        socket.on('typped', function(role){
            me.role = role;
            me.found = false;
            //console.log(me);
        });

        var txt = []; 
        socket.on('connected',function(user){
            if(user.role == ''){
                if(!user.ready){
                    console.log(user.pseudo + ' connected' + ' (no role chosen)' + user.id);
                    txt.push(game.add.text(game.width/3, 150+50*user.id, user.pseudo,{font: '30px Arial', fill: '#ffffff'}));
                }   
            }else{
                if(user.ready){
                    console.log(user.pseudo + ' connected as ' + user.role + ' et pret ' + user.id );
                    txt.push(game.add.text(game.width/3, 150+50*user.id, user.pseudo+' est '+user.role+' et est pret',{font: '30px Arial', fill: '#ffffff'}));

                }else{
                    console.log(user.pseudo + ' connected as ' + user.role + ' mais pas pret '+user.id);
                    txt.push(game.add.text(game.width/3, 150+50*user.id, user.pseudo+' est '+user.role,{font: '30px Arial', fill: '#ffffff'}));

                }
            }
        });

        socket.on('newrole', function(user){
            console.log(user.pseudo + ' is a ' + user.role);
            txt[user.id].setText(user.pseudo+' est '+user.role);

        });

        socket.on('pret', function(user){
            console.log(user.pseudo + ' est prêt.');
            txt[user.id].setText(user.pseudo+' est '+user.role+' et est pret');
        });

        socket.on('Paspret', function(user){
            console.log(user.pseudo + " n'est pas prêt.");
          //  txt[user.id].setText(user.pseudo);

        });

        socket.on('MissingBDE', function(){
            console.log('il faut au moins un BDE pour lancer la partie');
            /*socket.emit('Paspret');
            $('#changerole').show();
            $('#ready').show();
            $('#unready').hide();*/
        });

        socket.on('MissingJournalist', function(){
            console.log('il faut au moins un Journalist pour lancer la partie');
            /*socket.emit('Paspret');
            $('#changerole').show();
            $('#ready').show();
            $('#unready').hide();*/
        });

        socket.on('tsPret', function(){//-------------------------------------------------------------------------------------------
            console.log('tout les joueurs sont prêt');
            
            $('#Login').hide();
            displayLabel.visible = false;
            enter.visible = false;
            Ready.visible = false;
            change.visible = false;
            journalist.visible = false;
            bdeMember.visible = false;

            game.add.tileSprite(0, 0, game.width, game.height, 'background');
            backgroundS = game.add.sprite(0, 0, 'background');
            backgroundS = game.add.sprite(0, 0, 'filtreSombre');

        });

        socket.on('GlobalData', function(data){
            npcsLeft = data.nb_npc;
            npcs = data.nb_npc;
            killersLeft = data.killers;
            killers = data.killers;
            filmLeft = data.film;
            film = data.film;
            Display = true;
        })

        socket.on('createNPC', function(data){
            NpcArray.push(new NPCServer(game, skindark[data.skin],data.x, data.y));
        });

        socket.on('createBDE', function(data){
            PlayerArray[data.pseudo] = new PlayerServer(game, skindark[data.skin],data.x, data.y);
            updateOk = true;
        });

        socket.on('createViseur', function(viseur){
            SpriteArray[viseur.pseudo] = game.add.sprite(0, 0, 'background');
            ViseurArray[viseur.pseudo] = new ViseurServer(viseur.radius, viseur.pseudo);
            ViseurArray[viseur.pseudo].eclairage();
            //film = viseur.film;
            updateOk = true;
        });

        socket.on('collision', function(id){
            if(me.role == 'BDE'){
                game.physics.arcade.collide(PlayerArray[me.pseudo].Sprite, NpcArray[id].Sprite);
            }
        });

        socket.on('moveNPCToXY', function(NPC){
            NpcArray[NPC.id].Sprite.x += NPC.moveOnX;
            NpcArray[NPC.id].Sprite.y += NPC.moveOnY;
            if(NPC.animation == ''){
                NpcArray[NPC.id].Sprite.animations.stop();
            }else{
                NpcArray[NPC.id].Sprite.animations.play(NPC.animation);
            }
        });

        socket.on('disco', function(player){
            console.log(player.pseudo + ' disconnected');
        });

        socket.on('ActionBDE', function(){
            if( (me.role == 'BDE')&&(me.found == false) ){
                PlayerArray[me.pseudo].movePlayer();
                socket.emit('movePlayer',{
                    moveOnX : PlayerArray[me.pseudo].moveOnX,
                    moveOnY : PlayerArray[me.pseudo].moveOnY,
                    animation : PlayerArray[me.pseudo].animation,
                    pseudo : me.pseudo
                });
            }
        });

        socket.on('PlayerFound', function(pseudo){
            if(me.pseudo == pseudo){
                me.found = true;
            }
            PlayerArray[pseudo].alive = false;
            killersLeft --;
            killersDisp.setText('Bde:'+killersLeft+'/'+killers);
            if(PlayerArray[pseudo].alreadyFound == false){
                PlayerArray[pseudo].changeSkin();
                PlayerArray[pseudo].alreadyFound = true;
            }
        });

        socket.on('ActionViseur', function(){
            if(me.role == 'Journalist'){
                ViseurArray[me.pseudo].moveViseur(game, socket);
            }
        });

        socket.on('IsNPCDetected', function(npc){
            //console.log(npc.detected);
            NpcArray[npc.id].IsDetected(npc.detected);
            if(me.role == 'Journalist'){
                if((npc.detected)&&(NpcArray[npc.id].Sprite.alive == false)&&(NpcArray[npc.id].Sprite.recentlyDead)){
                    socket.emit('willDie', {
                        type : 'npc',
                        id : npc.id,
                        out : true
                    });
                    NpcArray[npc.id].changeSkin();
                    NpcArray[npc.id].Sprite.recentlyDead = false;
                }
            }
        });

        socket.on('NpcDie', function(character){
            if(character.type == 'npc'){
                NpcArray[character.id].Sprite.kill();
            }else{
                PlayerArray[character.id].Sprite.kill();
            }
        });

        socket.on('IsBDEDetected', function(BDE){
            PlayerArray[BDE.id].IsDetected(BDE.detected);
        });

        socket.on('moveViseur', function(viseur){
            ViseurArray[viseur.pseudo].move(viseur);
        });

        socket.on('MistakeOnNpc', function(i){
            NpcArray[i].mistake();
            NpcArray[i].alive = false;
            someoneDied();
            console.log("someone died by Journalist");
        });

        socket.on('movePlayer', function(player){
            PlayerArray[player.pseudo].Sprite.x += player.moveOnX;
            PlayerArray[player.pseudo].Sprite.y += player.moveOnY;
            if(player.animation == ''){
                PlayerArray[player.pseudo].Sprite.animations.stop();
            }else{
                PlayerArray[player.pseudo].Sprite.animations.play(player.animation);
            }
        });

        socket.on('NPCdied', function(id){
            NpcArray[id].Sprite.alive = false;
            someoneDied();
            console.log("someone died by bde");
            if(me.role == 'BDE'){
                NpcArray[id].changeSkin();
            }else{
                NpcArray[id].Sprite.recentlyDead = true;
            }
        });

        socket.on('BdeWin', function(){
            console.log("Bde win");
            fin = true;
            //this.ecranFin();
        });

        socket.on('JournalistWin', function(){
            console.log("Journalist win");
            //this.ecranFin();
            fin = true;
        });

        socket.on('PhotoShot', function(){
            filmLeft --;
            filmDisp.setText( 'film:'+filmLeft+'/'+film);
        })


        var wkey = game.input.keyboard.addKey(Phaser.Keyboard.M);
        wkey.onDown.addOnce(this.restart, this);
    },
    waiting: function () {
        displayLabel.setText('Please Wait the others players');
        Ready.visible = false;
        socket.emit('pret');
    },

    chooseRole: function () {
        displayLabel.setText('Choose Your Role');
        socket.emit('Paspret');
        $('#Login').hide();
        enter.visible = false;
        Ready.visible = false;
        change.visible = false;
        journalist.visible = true;
        bdeMember.visible = true;
        //meDisplay.setText('');
    },

    start: function () {
        socket.emit('login',{
            pseudo: getLogin()});
        enter.visible = false;
        this.chooseRole();
    },

    journalistChoice: function () {
        displayLabel.setText('Confirm Your Role');
        journalist.visible = false;
        bdeMember.visible = false;
        change.visible = true;
        Ready.visible = true;
        socket.emit('role', 'Journalist');
        //meDisplay.setText(getLogin()+' est Journalist');
    },

    bdeChoice: function () {
        journalist.visible = false;
        bdeMember.visible = false;
        change.visible = true;
        Ready.visible = true;
        socket.emit('role', 'BDE');
        //meDisplay.setText(getLogin()+' est BDE');
    },

    update: function(){
        if(updateOk){
            if(fin){
                    this.ecranFin();
                    fin = false;
                }
                if(Display){
                    this.InitAffichage();
                    Display = false;
                    KeyA =true;
                }
                if(key.isDown){
                    this.showdisp();
                }else{
                    this.hidedisp();
                }
                    var win = false;
                    if((killspace.isDown)&&(me.role=='BDE')){
                        for(var i = 0; i < npcs; i++){
                            game.physics.arcade.overlap(PlayerArray[me.pseudo].Sprite, NpcArray[i].Sprite, this.collisionHandler);
                            if(NpcArray[i].Sprite.recentlyDead){
                                NpcArray[i].Sprite.recentlyDead = false;
                                socket.emit('NPCdied', i);
                            }
                        }
                    }
        
                    if( (game.input.activePointer.leftButton.isDown)&&(me.role == "Journalist") ){
                        ViseurArray[me.pseudo].tempShoot = true;
                        if(ViseurArray[me.pseudo].tempShoot == true){
                            ViseurArray[me.pseudo].tempShoot = false;
                            var findsomeone = false;
                            for(var i = 0; i < npcs; i++){
                                if(  ( (game.physics.arcade.distanceToPointer(NpcArray[i].Sprite) ) <= (ViseurArray[me.pseudo].radius/2 ) )&&(NpcArray[i].alive) ){
                                    NpcArray[i].alive = false;
                                    findsomeone = true;
                                    socket.emit('willDie', {
                                        type : 'npc',
                                        id : i,
                                        out : true
                                    });
                                    socket.emit('MistakeOnNpc', i);
                                }
                            }
                            for(var k in PlayerArray){
                                    if( (game.physics.arcade.distanceToPointer(PlayerArray[k].Sprite) ) <= (ViseurArray[me.pseudo].radius/2 ) ){
                                        findsomeone = true;
                                        socket.emit('willDie', {
                                            type : 'bde',
                                            id : k,
                                            out : true
                                        });
                                    }
                                    if(PlayerArray[k].alive == false){
                                        win = true;
                                    }
                            }
        
        
                            if(killersLeft == 0){
                                socket.emit('JournalistWin');
                            }
                            if((findsomeone)&&(!win)){
                                socket.emit('photo');
                            }
                        }
                    }
                }

    },

    InitAffichage: function() {
        //Insertion du timer
        if((gameLength/60)<10){
            if((gameLength%60)<10){
                timerDisplay = game.add.text(game.world.centerX, 20, '0'+ Math.floor(gameLength/60) + ':0' + gameLength%60, { font: "18px Arial", fill: "#ffffff", align: "center" });
            }else{
                timerDisplay = game.add.text(game.world.centerX, 20, '0'+ Math.floor(gameLength/60) + ':' + gameLength%60, { font: "18px Arial", fill: "#ffffff", align: "center" });
            }
        }else{
            if((gameLength%60)<10){
                timerDisplay = game.add.text(game.world.centerX, 20, Math.floor(gameLength/60) + ':0' + gameLength%60, { font: "18px Arial", fill: "#ffffff", align: "center" });
            }else{
                timerDisplay = game.add.text(game.world.centerX, 20, Math.floor(gameLength/60) + ':' + gameLength%60, { font: "18px Arial", fill: "#ffffff", align: "center" });
            }
        }
        timerDisplay.anchor.setTo(0.5, 0.5);
        timerDisplay.stroke = '#000000';
        timerDisplay.strokeThickness = 2;

        killersDisp = game.add.text(50,  10, 'Bde:'+killersLeft+'/'+killers, { font: "15px Arial", fill: "#ffffff", align: "center" });
        killersDisp.anchor.setTo(0.5, 0.5);
        killersDisp.stroke = '#000000';
        killersDisp.strokeThickness = 1;

        npcDisp = game.add.text(50,  40, 'Npcs:'+npcsLeft+'/'+npcs, { font: "15px Arial", fill: "#ffffff", align: "center" });
        npcDisp.anchor.setTo(0.5, 0.5);
        npcDisp.stroke = '#000000';
        npcDisp.strokeThickness = 1;

        filmDisp = game.add.text(50,  70, 'film:'+filmLeft+'/'+film, { font: "15px Arial", fill: "#ffffff", align: "center" });
        filmDisp.anchor.setTo(0.5, 0.5);
        filmDisp.stroke = '#000000';
        filmDisp.strokeThickness = 1;

        timer.loop(Phaser.Timer.SECOND, this.updateCounter, this);
        timer.start();
    },

    updateCounter: function() {
        gameLength--;
        sec = gameLength % 60;
        if ((gameLength/60)<10) {
            if(sec<10){
                timerDisplay.setText('0' + Math.floor(gameLength/60) + ':0' + sec);
            }else{
                timerDisplay.setText('0' + Math.floor(gameLength/60) + ':' + sec);
            }
        }else{
             if(sec<10){
                timerDisplay.setText(Math.floor(gameLength/60) + ':0' + sec);
            }else{
                timerDisplay.setText(Math.floor(gameLength/60) + ':' + sec);
            }
        }

    },

    hidedisp: function() {
        if(KeyA){
            killersDisp.visible = false;
            npcDisp.visible = false;
            filmDisp.visible = false;
        }
    },

    showdisp: function(){
        if(KeyA){
            npcDisp.visible = true;
            killersDisp.visible = true;
            filmDisp.visible = true;
        }
    },

    ecranFin: function() {
        endTime = game.add.text(game.world.centerX,  game.world.centerY, 'End of the game', { font: "1000% Arial", fill: "#ffffff", align: "center" });
        endTime.anchor.setTo(0.5, 0.5);
        endTime.stroke = '#000000';
        endTime.strokeThickness = 7;
        //timer.stop(false);

        var startLabel = game.add.text(game.width/2, game.height -40, 'Press SPACE', {font: '25px Arial', fill: '#ffffff'});
        var wkey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        wkey.onDown.addOnce(this.quit, this);
    },

    quit: function() {
        game.state.start('fin');
    },


    collisionHandler: function(player, Ennemi) {
        if(Ennemi.alive == true){
            Ennemi.alive = false;
            Ennemi.recentlyDead = true;
        }
    },

    restart: function() {
        $('#Login').hide();        
        game.state.start('menu');
    }

};
