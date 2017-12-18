
//var puzzle = puzzle || {};
//var puzzleLogic = new PuzzleLogic();


var PuzzleMainLayer = cc.Layer.extend({

  ctor: function() {
    //////////////////////////////
    // 1. super init first
    this._super();

    //init
    this.limitLabel = null;
    this.scoreLabel = null;
    this.feverLabel = null;

    //ルール管理など
    puzzleLogic = new PuzzleLogic();
    var board = puzzleLogic.createBoard();

    //start
    this.gameState = PZG_GAME_STATE_PLAY;


    /////////////////////////////
    // 2. add a menu item with "X" image, which is clicked to quit the program
    //    you may modify it.
    // ask the window size
    var size = cc.winSize;



    cc.log("ctor:function rule="+PZG_RULE_TYPE)
    cc.log("cc.winSize " + cc.winSize.width + "," + cc.winSize.height)

//    cc.eventManager.addListener(listener, this);

    //盤面
    var layer = new PuzzleLayer(puzzleLogic.getPuzzleWidthCount(),puzzleLogic.getPuzzleHeightCount());
    layer.setLaunchBoard(board);
    layer.setName("puzzle_layer");
    this.addChild(layer,0);

    //操作中表示テスト用
    if(1) {
      var lb = new cc.LabelTTF("操作中", "Arial", 26);
      lb.setAnchorPoint(0,0.5);
      lb.setPosition(0,layer.getContentSize().height+20);
      lb.setColor( cc.color(255,255,0,255) );
      lb.setVisible(false);
      this.addChild(lb);

      this.oplb = lb;
    }

    //適当にゲージ設置
    if( puzzleLogic.enableControlTime() == true ) {
      var gw = size.width * 0.5;
      var gh = 12;
      var gv = new GaugeLayer(gw,gh);
      var ph = layer.getContentSize().height;
      gv.setPosition(size.width/2-(gw/2),ph);
      this.addChild(gv);

      this.gauge = gv;
    }


    /*
    var gw = size.width * 0.5;
    var gh = 12;
    var gv = new GaugeLayer(gw,gh);
    gv.setPosition(200,500);
    this.addChild(gv);
    */


    //テスト操作盤
    if(1) {

      var list = [];
      var it;

      var size = cc.winSize;

      it = new cc.MenuItemFont("TOPに戻る",this.onMenu1,this);
      it.setColor( cc.color(255,0,0,255) );
      it.setScale(1.5);
      it.setPosition(size.width/2,size.height*0.78);
      it.setAnchorPoint(0.5,0.5);
      list.push(it);

      var m = new cc.Menu(list);
      m.ignoreAnchorPointForPosition(false);
      this.addChild(m);


    }

    var fs = 19;
    //リミット時間表示
    if( puzzleLogic.getLimitTime() > 0 ) {

      var lb = new cc.LabelTTF("残り時間 ", "Arial", fs);
      lb.setColor(cc.color(0, 0, 255, 255));
      lb.setAnchorPoint(0,0.5);
      lb.setPosition(size.width*0.05,size.height*0.9);
      this.addChild(lb);

      this.limitLabel = lb;

    }

    var c = cc.color(0, 255, 0, 255);

    //スコア
    if(1) {
      var lb = new cc.LabelTTF("", "Arial", fs);
      lb.setColor(c);
      lb.setAnchorPoint(0,0.5);
      lb.setPosition(size.width*0.4,size.height*0.9);
      this.addChild(lb);

      this.scoreLabel = lb;

    }

    //フィーバー
    if( puzzleLogic.enableFeverTime() == true ) {
      var lb = new cc.LabelTTF("フィーバーまで残り ", "Arial", fs);
      lb.setColor(cc.color(0, 0, 255, 255));
      lb.setAnchorPoint(0,0.5);
      lb.setPosition(size.width*0.05,size.height*0.85);
      this.addChild(lb);

      this.feverLabel = lb;
    }

    this.updateView();

    //毎フレーム更新する
    this.scheduleUpdate();

    return true;
  },

  onExit: function() {
    this._super();

    cc.log("PuzzleMainLayer::onExit");

    this.limitLabel = null;

  },

  //表示更新
  updateView: function() {

    //時間
    if( this.limitLabel != null ) {
      var sec = puzzleLogic.getLimitTime();
      var text = "残り時間 "+ sec.toFixed(2);

      if( this.gameState == PZG_GAME_STATE_END ) {
        text = "タイムアップ"
        this.limitLabel.setColor( cc.color(255,0,0,255) );
      }

      this.limitLabel.setString(text);


    }
    //スコア
    if( this.scoreLabel != null ) {
      var sec = puzzleLogic.getCurrentScore();
      var text = "スコア "+ sec.toFixed(0);

      this.scoreLabel.setString(text);


    }

    //フィーバー
    if( this.feverLabel != null ) {

      if( puzzleLogic.isFeverTime() == false ) {
        var cnt = puzzleLogic.feverMatchCount();
        var text = "フィーバーまで残り"+cnt+"個";

        this.feverLabel.setString(text);
      }
      else {
        var sec = puzzleLogic.feverLimitTime();
        var text = "フィーバー中！　あと"+ sec.toFixed(2)+"秒";

        this.feverLabel.setString(text);
      }
    }

    //操作中
    var opflag = puzzleLogic.isBallOperationNow();
    this.oplb.setVisible(opflag);

    //操作残り時間
    if( puzzleLogic.enableControlTime() == true ) {
      var max = PZG_CONTROL_TIME_MAX;
      var t = puzzleLogic.getControlTimeLimit();

      this.gauge.setGauge(max,t);
//      this.gauge = gv;

    }


  },

  // 周期処理
	update:function(dt){


      //制限時間
      puzzleLogic.advanceLimit(dt);

      //制限時間オーバー
      if( this.gameState == PZG_GAME_STATE_PLAY ) {
        if( puzzleLogic.isLimitOver() == true ) {
          //時間切れ
          this.onGameEnd();
        }
      }


      //ビュー更新
      this.updateView();

  },

  //時間切れしました
  onGameEnd:function() {
    cc.log("puzzle::onGameEnd");

    this.gameState = PZG_GAME_STATE_END;

    var pl = this.getChildByName("puzzle_layer");
    pl.onGameEnd();

  },

  onMenu1: function(sender) {
//    cc.log("menu1");
    cc.director.runScene(new HelloWorldScene());
  }

});

var PuzzleMainScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    var layer = new PuzzleMainLayer();
    this.addChild(layer);
  }
});

var listener = cc.EventListener.create({
  event: cc.EventListener.TOUCH_ONE_BY_ONE,
  onTouchBegan: function(touch, event) {
    cc.log("onTouchBegan");
    return true;
  },

  onTouchMoved: function(touch, event) {
    cc.log("onTouchMoved");
  },

  onTouchEnded: function(touch, event) {
    cc.log("onTouchEnded");
  },

  onTouchCancelled: function(touch, event) {
    cc.log("onTouchCancelled");
  }

});


//ゲージ
var GaugeLayer = cc.Layer.extend({

  ctor: function(w, h) {
    //////////////////////////////
    // 1. super init first
    this._super();

    //bg
    var lc = new cc.LayerColor(cc.color(0, 0, 0, 255), w, h);
    this.addChild(lc, 0);

    //nakami
    var b = 2;
    var w2 = w - (b*2);
    var h2 = h - (b*2);
    var lc = new cc.LayerColor(cc.color(255, 0, 0, 255), w2, h2);
    lc.setPosition(b,b);
    lc.setAnchorPoint(0,0.5);
    this.addChild(lc, 0);
    this.gauge = lc;

    return true;
  },

  setGauge:function(max,value) {

    var p = value / max
    if( p < 0 ) p = 0;
    if( p > 1 ) p = 1;

    this.gauge.setScale(p,1);

  }


});
