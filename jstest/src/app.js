var HelloWorldLayer = cc.Layer.extend({
  sprite: null,

  ctor: function() {
    //////////////////////////////
    // 1. super init first
    this._super();

    /////////////////////////////
    // 2. add a menu item with "X" image, which is clicked to quit the program
    //    you may modify it.
    // ask the window size
    var size = cc.winSize;


    //画面周り出力してみる
    cc.log("cc.winSize " + cc.winSize.width + "," + cc.winSize.height)

    //framesize?
    var frameSize = cc.view.getFrameSize();
    cc.log("cc.view.getFrameSize " + frameSize.width + "," + frameSize.height)
    //canvas
    var canvasSize = cc.view.getCanvasSize();
    cc.log("cc.view.getCanvasSize " + canvasSize.width + "," + canvasSize.height)
    //winsize
    var winSize = cc.director.getWinSize();
    cc.log("cc.director.getWinSize " + winSize.width + "," + winSize.height)

    cc.eventManager.addListener(listener, this);

    var menuscale = 1.2;
    var menuy = -100;
    var menuadd = 100;

    var left = -200;

    var menu1 = new cc.MenuItemFont("Aタイプ", this.onMenu1, this);
    menu1.setColor(cc.color(255, 0, 0, 255));
    menu1.setScale(menuscale);
    menu1.setPosition(-size.width/2, menuy);
    menu1.setAnchorPoint(0,0.5);

    var menu1a = new cc.MenuItemFont("Aタイプ2", this.onMenu1b, this);
    menu1a.setColor(cc.color(255, 0, 0, 255));
    menu1a.setScale(menuscale);
    menu1a.setAnchorPoint(1,0.5);
    menu1a.setPosition(size.width/2, menuy);

    menuy += menuadd;

    var menu2 = new cc.MenuItemFont("B1タイプ", this.onMenu2, this);
    menu2.setColor(cc.color(255, 0, 0, 255));
    menu2.setScale(menuscale);
    menu2.setPosition(0, menuy);
    menuy += menuadd;

    var menu3 = new cc.MenuItemFont("B2タイプ", this.onMenu3, this);
    menu3.setColor(cc.color(255, 0, 0, 255));
    menu3.setScale(menuscale);
    menu3.setPosition(0, menuy);
    menuy += menuadd;

    var menu4 = new cc.MenuItemFont("B3タイプ", this.onMenu4, this);
    menu4.setColor(cc.color(255, 0, 0, 255));
    menu4.setScale(menuscale);
    menu4.setPosition(0, menuy);
    menuy += menuadd;

    var m = new cc.Menu(menu1, menu2,menu3,menu4,menu1a);
    this.addChild(m);

    //ローカルストレージテスト
    var saveval = cc.sys.localStorage.getItem("game_score");
    if (saveval == null)
      saveval = 0;
    var locallabel = new cc.LabelTTF("消した数 " + saveval, "Arial", 38);
    // position the label on the center of the screen
    locallabel.x = size.width / 2;
    locallabel.y = size.height / 2 - 250;
    // add the label as a child to this layer
    this.addChild(locallabel, 5);


    return true;
  },

  onMenu1: function(sender) {
    cc.log("menu1");

    PZG_RULE_TYPE = 0;

    cc.director.runScene(new PuzzleMainScene());

  },
  onMenu1b: function(sender) {
    cc.log("menu1b");

    PZG_RULE_TYPE = 4;

    cc.director.runScene(new PuzzleMainScene());

  },
  onMenu2: function(sender) {
    cc.log("menu2");

    PZG_RULE_TYPE = 1;

    cc.director.runScene(new PuzzleMainScene());

  },
  onMenu3: function(sender) {
    cc.log("menu2");

    PZG_RULE_TYPE = 2;

    cc.director.runScene(new PuzzleMainScene());

  },
  onMenu4: function(sender) {

    PZG_RULE_TYPE = 3;

    cc.director.runScene(new PuzzleMainScene());

  }




});

var HelloWorldScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    var layer = new HelloWorldLayer();
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
