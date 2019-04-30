var game;
var mainmenuSound;
var agonySound;
var eventDispatcher = new Phaser.Signal();
var model;
var controller;


var gameOptions = {
    gameHeight: 1334,
    backgroundColor: "#0b7e1e"
}

var facebookStuff = {
    name: "",
    picture: ""
}

function Question(id,title,answer1,answer2,answer3,answer4){
    this.id = id,
    this.title = title,
    this.answer1 = answer1,
    this.answer2 = answer2,
    this.answer3 = answer3,
    this.answer4 = answer4
}

var question1 = new Question(0,"Διάλεξε την σωστή απάντηση",{context:"πείθω",correct:true},{context:"πύθω",correct:false},{context:"πήθω",correct:false},{context:"ποίθω",correct:false}) 

 
FBInstant.initializeAsync().then(function() {
    FBInstant.setLoadingProgress(100);
    FBInstant.startGameAsync().then(function() {
        facebookStuff.name = FBInstant.player.getName();
        facebookStuff.picture = FBInstant.player.getPhoto();
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        if(windowWidth > windowHeight){
            windowWidth = windowHeight / 1.8;
        }
        var gameWidth = windowWidth * gameOptions.gameHeight / windowHeight;
        game = new Phaser.Game(gameWidth, gameOptions.gameHeight, Phaser.CANVAS);
        game.state.add("Boot", boot);
        game.state.add("Preload", preload);
        game.state.add("TitleScreen", titleScreen);
        game.state.add("PlayGame", playGame);
        game.state.start("Boot");
    })
})
 
var boot = function(){};
boot.prototype = {
     preload: function(){
        game.load.image("loading", "assets/sprites/loading.png");
     },
    create: function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = gameOptions.backgroundColor;
        this.game.add.text(0, 0, "hack", {font:"1px greek_main", fill:"#FFFFFF"});
        model = new Model();
        
        game.state.start("Preload");
    }
}


var preload = function(){};
preload.prototype = {
    preload: function(){
        var loadingBar = this.add.sprite(game.width / 2, game.height / 2, "loading");
        loadingBar.anchor.setTo(0.5);
        game.load.setPreloadSprite(loadingBar);
        game.load.image("playbutton", "assets/sprites/playbutton.png");
        game.load.image("profilepicture", facebookStuff.picture);
        game.load.image("background","assets/sprites/background.jpg")
        game.load.image("homebutton", "assets/sprites/homebutton.png");
        game.load.image("logo", "assets/sprites/logo.png");
        game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
        game.load.bitmapFont("whitefont", "assets/fonts/whitefont.png", "assets/fonts/whitefont.fnt");
        //game.load.audio("failsound", ["assets/sounds/fail.mp3", "assets/sounds/fail.ogg"]);
        game.load.audio("mainmenu", ["assets/sounds/mainmenu.mp3", "assets/sounds/mainmenu.mp3"]);
        game.load.audio("agony", ["assets/sounds/agony.mp3", "assets/sounds/agony.mp3"]);
        game.load.audio("correct", ["assets/sounds/correct.mp3", "assets/sounds/correct.mp3"]);
        // game.load.audio("hit2sound", ["assets/sounds/hit2.mp3", "assets/sounds/hit2.ogg"]);
    },
    create: function(){
        game.state.start("TitleScreen");
    }
}

var titleScreen = function(){};
 
titleScreen.prototype = {
    create: function(){
        // savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));
        var background = new Background("background");
        var logo = game.add.image(game.width / 2, 0, "logo");
        logo.anchor.set(0.5, 0);
        logo.width = 500;
        logo.height=500;
        mainmenuSound = game.add.audio("mainmenu");
        mainmenuSound.loopFull();
        var playButton = game.add.button(game.width / 2, (game.height / 2)+100, "playbutton", this.startGame);
        playButton.anchor.set(0.5);
        var tween = game.add.tween(playButton.scale).to({
            x: 0.8,
            y: 0.8
        }, 500, Phaser.Easing.Linear.None, true, 0, -1);
        tween.yoyo(true);
        // var logoButton = game.add.button(game.width / 2, game.height - 40, "logo", function(){
 
        // }, this);
        // logoButton.anchor.set(0.5, 1);
        game.add.bitmapText(game.width / 2, 430, "font", "Γειά σου " + facebookStuff.name, 48).anchor.set(0.5, 1);
        game.add.bitmapText(game.width / 2, 470, "font", "Ανάδειξε τις γνώσεις σου!" , 32).anchor.set(0.5, 1);
        game.add.bitmapText(game.width / 2, 540, "font", "Ορθογραφία, Συνώνυμα, Αντώνυμα" , 28).anchor.set(0.5, 1);
        // game.add.bitmapText(game.width / 2, 380, "font", "BEST SCORE", 48).anchor.set(0.5, 1);
        // game.add.bitmapText(game.width / 2, 440, "whitefont", savedData.score.toString(), 60).anchor.set(0.5, 1);
        var profileImage = game.add.image(game.width / 2, playButton.y + 250, "profilepicture");
        profileImage.anchor.set(0.5);
        profileImage.width = 200;
        profileImage.height = 200;
 
    },
    startGame: function(){
        mainmenuSound.destroy();
        game.state.start("PlayGame");
    }
}


var playGame = function(game){};

playGame.prototype = {
    create: function(){
        var background = new Background("background");
        var style = { 
            font: "38px greek_main",
            align: "left",
            fill: "#fff",
            wordWrap: { width: 450, useAdvancedWrap: true }
        }
        
        agonySound = game.add.audio("agony");
        agonySound.play();
        var title = this.game.add.text(game.width/3, 320,question1.title, style).anchor.set(0, 1);
        var answer1 = new GButton(question1.answer1.context,"checkAnswer",1,game.width-80,"#ffffff",32,"#303030");
        
        answer1.x=10;
        answer1.y=game.height/2+50;
        var answer2;
        var answer3;
        var answer4;
        //game.input.onDown.add(this.changeBall, this);
        
        this.homeButton = game.add.button(game.width / 2, game.height, "homebutton", function(){
            agonySound.destroy();
            game.state.start("TitleScreen");
        });
        this.homeButton.anchor.set(0.5, 1);
    },
    checkAnswer:function(key){
        correctSound = game.add.audio("agony");
        console.log("pressed");
        if (key==1){
            agonySound.destroy();
            correctSound.play();
            answer1.buttonBack.beginFill(0x00FF00, 1);
        }
    },
    update: function(){
        
    },
    
}
