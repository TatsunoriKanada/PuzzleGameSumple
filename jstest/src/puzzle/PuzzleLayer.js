var PuzzleLayer = cc.Layer.extend({

  //グローバル
  _puzzleLayer: null,


  ctor: function(wcnt, hcnt) {
    //////////////////////////////
    // 1. super init first
    this._super();

    _puzzleLayer = this;

    this.widthCount = wcnt;
    this.heightCount = hcnt;
    cc.log("PuzzleLayer::init " + this.widthCount + "," + this.heightCount);

    var vorigin = cc.director.getVisibleOrigin();
    var vsize = cc.director.getVisibleSize();


    //各種state
    this.runningMatchAnime = false;

    var size = cc.winSize;

    //サイズ
    var w = vsize.width;
    var h = size.height * 0.5;
    this.layerSize = cc.size(w, h)

    //bg
    var lc = new cc.LayerColor(cc.color(200, 200, 200, 255), vsize.width, vsize.height);
    this.addChild(lc, 0);

    //一個あたりのサイズ
    //とりあえず等分
    var ballSize = w / wcnt;
    this.ballPixelSize = ballSize;





    cc.eventManager.addListener(puzzleLayerListener, this);

    /*
        var sp = this.createPuzzleBall(2);
        sp.getTexture()
        var scale = ballSize / sp.getContentSize().width;
        sp.setScale(scale);
        //    sp.attr({
        //      x: size.width / 2,
        //      y: size.height / 2
        //    });
        this.addChild(sp, 0)
    */

    this.mycharSprite = null;
    this.isGameEnd = false;

    this.setContentSize(cc.size(size.width, ballSize * hcnt));
    this.setPosition(vorigin.x, vorigin.y);

    this.isMatchRunning = false;

    return true;
  },

  onExit: function() {
    this._super();

    this.mycharSprite = null;

    cc.log("PuzzleLayer::onExit");
  },


  //盤面セット
  setLaunchBoard: function(board) {

    //横縦数
    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();

    var list = []

    var i, j;
    for (i = 0; i < hcnt; i++) {
      for (j = 0; j < wcnt; j++) {

        var idx = puzzleLogic.posToIndex(j, i);

        var c = board[idx];

        //        cc.log("idx "+idx+",c "+c);

        var sp = this.createPuzzleBall(c);
        var scale = this.ballPixelSize / sp.getContentSize().width;
        sp.setScale(scale);

        var z = 0;
        if (c == PZG_BALL_COLOR_MYCHAR) {
          z = 1;
        }
        this.addChild(sp, z);

        sp.setBallPosition(j, i);

        var pos = this.puzzlePosToScreen(j, i);
        sp.setPosition(pos);

        //マイキャラはすぐアクセスできるようにしておく
        if (c == PZG_BALL_COLOR_MYCHAR) {
          this.mycharSprite = sp;
        }



        list.push(sp);

      }
    }

    this.spriteList = list;

  },

  //画面座標からパズルindexに変換
  //該当なし=-1
  screenPosToIndex: function(x, y) {


    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();
    var pixel = this.ballPixelSize;

    var posx = Math.floor(x / pixel);
    var posy = Math.floor(y / pixel);

    var idx = -1;
    if (posx >= 0 && posx < wcnt) {
      if (posy >= 0 && posy < hcnt) {
        idx = posx + (posy * wcnt);

      }
    }

    //    cc.log("screenPosToIndex "+x+","+y+" -> "+posx+","+posy+" "+idx);

    return idx;

  },

  //盤面リフレッシュ
  //消えたパズルをリムーブする、各種リストの更新
  refreshBoard: function() {
    cc.log("refreshBoard");


    var list = this.spriteList;

    //消えたのを取り除く
    while (true) {
      var rem = false;

      var i;
      for (i = 0; i < list.length; i++) {
        var sp = list[i];
        var pos = sp.getBallPosition();

        //        cc.log("i "+i+",match "+sp.isMatch+","+pos.x+","+pos.y);

        //isMatchがtrueなら削除
        if (sp.isMatch == true) {
          this.spriteList.splice(i, 1);
          sp.removeFromParent();

          rem = true;
          break;
        }

      }

      if (rem == false) {
        break;
      }

    }



    //ボードの状況
    //    var collist = this.getBoardColorList();
    //    this.colorList = collist;
    //    this.boardList = this.getBoardBallList();


  },

  //色のスプライト生成
  createPuzzleBall: function(puzzleColor) {

    if (puzzleColor == PZG_BALL_COLOR_BLUE)
      return new PuzzleBallSprite(res.blue, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_RED)
      return new PuzzleBallSprite(res.red, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_BLACK)
      return new PuzzleBallSprite(res.black, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_YELLOW)
      return new PuzzleBallSprite(res.yellow, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_PURPLE)
      return new PuzzleBallSprite(res.purple, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_GREEN)
      return new PuzzleBallSprite(res.green, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_MYCHAR)
      return new PuzzleBallSprite(res.mychar, puzzleColor);
    if (puzzleColor == PZG_BALL_COLOR_LIGHTBLUE)
      return new PuzzleBallSprite(res.lblue, puzzleColor);

    cc.log("c? " + puzzleColor);
  },

  //パズルをランダムで一個生成
  createRandomPuzzleBall: function() {

    var cnt = puzzleLogic.getPuzzleColorNum();
    var r = Math.floor(Math.random() * cnt);

    return this.createPuzzleBall(r);

  },


  //入れ替え
  swapPuzzleBall: function(ball1, ball2) {

    var pos1 = ball1.getBallPosition();
    var pos2 = ball2.getBallPosition();

    var disp1 = _puzzleLayer.puzzlePosToScreen(pos1.x, pos1.y);
    var disp2 = _puzzleLayer.puzzlePosToScreen(pos2.x, pos2.y);
    //    var disp1 = ball1.getPosition();
    //    var disp2 = ball2.getPosition();

    //パズル位置更新
    ball1.setBallPosition(pos2);
    ball2.setBallPosition(pos1);

    //アニメは不安定
    var isAnime = true;


    if (isAnime == false) {
      //表示座標更新
      ball1.setPosition(disp2);
      ball2.setPosition(disp1);
    } else {

      //アニメテスト
      ball1.stopAllActions();
      ball2.stopAllActions();

      //移動中だった場合の考慮
      if (ball1._temppos != null) {
        ball1.setPosition(ball1._temppos)
      }
      if (ball2._temppos != null) {
        ball2.setPosition(ball2._temppos)
      }

      //移動中フラグ
      ball1.isMoving = true;
      ball2.isMoving = true;

      //操作中の玉の場合はフラグ消す
      if (ball1 == _puzzleLayer.currentBall) {
        ball1.isMoving = false;
      } else if (ball2 == _puzzleLayer.currentBall) {
        ball2.isMoving = false;
      }

      //移動するのがマイキャラの場合はフラグを消す
      if (ball1.isMyChar == true) {
        //        ball1.isMoving = false;
      } else if (ball2.isMyChar == true) {
        //        ball2.isMoving = false;
      }

      //一個目
      var a1 = this.createSwapBezier(disp1, disp2);
      var f1 = cc.callFunc(function() {

        this.setPosition(this._temppos);
        this._temppos = null;
        this.isMoving = false;

      }, ball1);
      var sq1 = cc.sequence(a1, f1);
      ball1._temppos = disp2; //アニメ後、微妙に位置ずれするので後で再生設定
      ball1.runAction(sq1);

      //二個目
      var a2 = this.createSwapBezier(disp2, disp1);
      var f2 = cc.callFunc(function() {

        this.setPosition(this._temppos);
        this._temppos = null;
        this.isMoving = false;

      }, ball2);
      var sq2 = cc.sequence(a2, f2);
      ball2._temppos = disp1; //アニメ後、微妙に位置ずれするので後で再生設定
      ball2.runAction(sq2);

    }




  },

  //複数入れ替え
  swapPuzzleBallMulti: function(swapDict) {

    var i;
    var keys = Object.keys(swapDict);
    var ballDict = {};

    for(i=0 ; i < keys.length ; i++) {
      var srcidx = keys[i];
      var pos1 = puzzleLogic.indexToPos(srcidx);
      var ball = this.getBallAtPosition(pos1.x,pos1.y);

      ballDict[srcidx] = ball;
    }

    for(i=0 ; i < keys.length ; i++) {
      var srcidx = keys[i];
      var dstidx = swapDict[srcidx];


      var pos1 = puzzleLogic.indexToPos(srcidx);
      var pos2 = puzzleLogic.indexToPos(dstidx);

      var disp1 = _puzzleLayer.puzzlePosToScreen(pos1.x, pos1.y);
      var disp2 = _puzzleLayer.puzzlePosToScreen(pos2.x, pos2.y);

      var ball = ballDict[srcidx];

      //パズル位置更新
      ball.setBallPosition(pos2);


      //アニメ実行
      ball.stopAllActions();

      //移動中だった場合の考慮
      if (ball._temppos != null) {
        ball.setPosition(ball._temppos)
      }

      //移動中フラグ
      ball.isMoving = true;

      //操作中の玉の場合はフラグ消す
      if (ball == _puzzleLayer.currentBall) {
        ball.isMoving = false;
      }

      //一個目
      var a1 = this.createSwapBezier(disp1, disp2);
      var f1 = cc.callFunc(function() {

        this.setPosition(this._temppos);
        this._temppos = null;
        this.isMoving = false;

      }, ball);
      var sq1 = cc.sequence(a1, f1);
      ball._temppos = disp2; //アニメ後、微妙に位置ずれするので後で再生設定
      ball.runAction(sq1);


    }



    /*
    var pos1 = ball1.getBallPosition();
    var pos2 = ball2.getBallPosition();

    var disp1 = _puzzleLayer.puzzlePosToScreen(pos1.x, pos1.y);
    var disp2 = _puzzleLayer.puzzlePosToScreen(pos2.x, pos2.y);
    //    var disp1 = ball1.getPosition();
    //    var disp2 = ball2.getPosition();

    //パズル位置更新
    ball1.setBallPosition(pos2);
    ball2.setBallPosition(pos1);

    //アニメは不安定
    var isAnime = true;


    if (isAnime == false) {
      //表示座標更新
      ball1.setPosition(disp2);
      ball2.setPosition(disp1);
    } else {

      //アニメテスト
      ball1.stopAllActions();
      ball2.stopAllActions();

      //移動中だった場合の考慮
      if (ball1._temppos != null) {
        ball1.setPosition(ball1._temppos)
      }
      if (ball2._temppos != null) {
        ball2.setPosition(ball2._temppos)
      }

      //移動中フラグ
      ball1.isMoving = true;
      ball2.isMoving = true;

      //操作中の玉の場合はフラグ消す
      if (ball1 == _puzzleLayer.currentBall) {
        ball1.isMoving = false;
      } else if (ball2 == _puzzleLayer.currentBall) {
        ball2.isMoving = false;
      }

      //移動するのがマイキャラの場合はフラグを消す
      if (ball1.isMyChar == true) {
        //        ball1.isMoving = false;
      } else if (ball2.isMyChar == true) {
        //        ball2.isMoving = false;
      }

      //一個目
      var a1 = this.createSwapBezier(disp1, disp2);
      var f1 = cc.callFunc(function() {

        this.setPosition(this._temppos);
        this._temppos = null;
        this.isMoving = false;

      }, ball1);
      var sq1 = cc.sequence(a1, f1);
      ball1._temppos = disp2; //アニメ後、微妙に位置ずれするので後で再生設定
      ball1.runAction(sq1);

      //二個目
      var a2 = this.createSwapBezier(disp2, disp1);
      var f2 = cc.callFunc(function() {

        this.setPosition(this._temppos);
        this._temppos = null;
        this.isMoving = false;

      }, ball2);
      var sq2 = cc.sequence(a2, f2);
      ball2._temppos = disp1; //アニメ後、微妙に位置ずれするので後で再生設定
      ball2.runAction(sq2);

    }
    */




  },

  //入れ替えアニメ生成
  //始点と終点を指定する
  createSwapBezier: function(disp1, disp2) {

    var list = [];

    //    cc.log("createSwapBezier ("+disp1.x+","+disp1.y+") ("+disp2.x+","+disp2.y);

    //始点
    list.push(cc.p(0, 0));

    //中間点
    var cx = 0;
    var cy = 0;

    if (disp1.x == disp2.x) {
      //縦入れ替え
      var diff = Math.abs(disp1.y - disp2.y);

      if (disp1.y > disp2.y) {
        cx = diff;
      } else {
        cx = -diff;
      }


    } else if (disp1.y == disp2.y) {
      //横入れ替え
      var diff = Math.abs(disp1.x - disp2.x);

      if (disp1.x > disp2.x) {
        cy = diff;
      } else {
        cy = -diff;
      }

    }

    list.push(cc.p(cx, cy));


    //終点
    var ex = disp2.x - disp1.x;
    var ey = disp2.y - disp1.y;
    list.push(cc.p(ex, ey));

    var a1 = cc.bezierBy(PZG_ANIME_DURATION_SWAP, list);

    return a1;


  },

  //positionからボール取得
  getBallAtPosition:function(x,y) {

    var list = this.spriteList
    var i;
    for (i = 0; i < list.length; i++) {
      var sp = list[i];

      var pos = sp.getBallPosition();

      if( pos.x == x && pos.y == y ) {
        return sp;
      }
    }

    return null;

  },

  //現在のボード色状態を配列で取得
  getBoardColorList: function() {

    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();
    var collist = new Array(wcnt * hcnt);

    var list = this.spriteList
    var i;
    for (i = 0; i < list.length; i++) {
      var sp = list[i];

      var pos = sp.getBallPosition();

      //左下が0,0,右上が一番でかい
      var idx = pos.x + (pos.y * wcnt);

      if (sp.isGrabBall() == true) {
        //掴まれてるやつは消せないようにする
        //        cc.log("つかまれ");
        collist[idx] = PZG_BALL_COLOR_MYCHAR;
      } else {
        collist[idx] = sp.puzzleColor;
      }


    }

    if (1) {
      //テスト出力
      var x, y;
      for (y = hcnt - 1; y >= 0; y--) {

        var text = "";
        for (x = 0; x < wcnt; x++) {

          var idx = x + (y * wcnt);
          text += collist[idx];

        }

        cc.log(text);
      }
    }

    return collist;

  },
  //オブジェクトをボード配列に入れる
  getBoardBallList: function() {

    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();
    var collist = new Array(wcnt * hcnt);

    var list = this.spriteList
    var i;
    for (i = 0; i < list.length; i++) {
      var sp = list[i];
      var pos = sp.getBallPosition();

      //左下が0,0,右上が一番でかい
      var idx = pos.x + (pos.y * wcnt);
      collist[idx] = sp;

    }

    return collist;

  },


  //消えるチェック＆スタート
  checkMatchPuzzle: function(removeCurrent) {

    cc.log("checkMatchPuzzle running="+this.isMatchRunning+",removeCurrent="+removeCurrent);

    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();

    //ボードの状況
    var collist = this.getBoardColorList();
    this.colorList = collist;
    this.boardList = this.getBoardBallList();

    //消えるところを格納
    this.matchList = null;
    var matchList = [];

    var list = this.spriteList
    var i;
    for (i = 0; i < list.length; i++) {
      var sp = list[i];
      var pos = sp.getBallPosition();

      //右
      if (pos.x < (wcnt - 2)) {
        var cnt = this.checkMatchPlace(pos, 0);

        if (cnt >= 3) {

          //起点、色、個数
          var dict = {};
          dict["pos"] = pos;
          dict["c"] = sp.puzzleColor;
          dict["cnt"] = cnt;
          dict["dir"] = 0;

          matchList.push(dict);

        }
      }

      //上
      if (pos.y < (hcnt - 2)) {
        var cnt = this.checkMatchPlace(pos, 1);

        if (cnt >= 3) {

          //起点、色、個数、方向
          var dict = {};
          dict["pos"] = pos;
          dict["c"] = sp.puzzleColor;
          dict["cnt"] = cnt;
          dict["dir"] = 1;

          matchList.push(dict);

        }

      }

      //      cc.log(pos.x + "," + pos.y);
    }

    //操作玉を消す
//    cc.log("removecurrent " + removeCurrent);
    if (removeCurrent == true && this.currentBall != null) {

      var dict = {};
      dict["pos"] = this.currentBall.getBallPosition();
      dict["c"] = this.currentBall.puzzleColor;
      dict["cnt"] = 1;
      dict["dir"] = 1;

      //      cc.log(dict);
      matchList.push(dict);

    }


    if (matchList.length > 0) {
      //消す処理へ
      cc.log("startMatchAnime");
      cc.log(matchList);

      this.isMatchRunning = true;

      this.runningMatchAnime = true;
      this.matchList = matchList;
      this.startMatchAnime();

      return true;

    }

    this.isMatchRunning = false;

    return false;

  },

  //マッチチェック
  //dirは右(0)か上(1)
  checkMatchPlace: function(pos, dir) {

    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();
    var collist = this.colorList;

    var idx = pos.x + (pos.y * wcnt);
    var c = collist[idx];

    //何個つながってるか
    var cnt = 1;

    if (dir == 0) {
      //右へ

      var i;
      for (i = 1; i < wcnt; i++) {
        var x = pos.x + i;
        var y = pos.y;
        var idx = x + (y * wcnt);

        if (c == collist[idx] && x < wcnt) {
          cnt++;
        } else {
          break;
        }

      }

    } else if (dir == 1) {
      //上へ

      var i;
      for (i = 1; i < hcnt; i++) {
        var x = pos.x;
        var y = pos.y + i;
        var idx = x + (y * wcnt);

        if (c == collist[idx] && x < wcnt) {
          cnt++;
        } else {
          break;
        }

      }

    }

    return cnt;

  },

  //マッチアニメ
  startMatchAnime: function() {


    //消す予定のオブジェクトにフラグを立てる
    var i;
    for (i = 0; i < puzzleLogic.getPuzzleColorNum(); i++) {
      //オブジェクト取得
      var dict = this.findMatchPuzzleBall(this.matchList, i);

      for (var key in dict) {

        var sp = dict[key];
        sp.onStartMatchAnime();

      }


    }

    //1色ずつ消してゆく(パズドラ風)
    this.currentMatchColor = 0;

    this.nextMatchAnime();

  },
  nextMatchAnime: function() {

    var color = this.currentMatchColor;

    cc.log("nextMatchAnime color=" + color);

    //消すカラーを検索
    var list = this.matchList;
    //オブジェクト取得
    var dict = this.findMatchPuzzleBall(list, color);

    if (Object.keys(dict).length > 0) {
      //アニメ
      this.currentMatchColor++;

      //スコア
      puzzleLogic.addPuzzleScore(Object.keys(dict).length);

      this.runMatchAnime(dict);
    } else {
      //ないなら即次の色
      this.currentMatchColor++;

      if (this.currentMatchColor >= puzzleLogic.getPuzzleColorNum()) {
        //終わり

        //落下処理へ
        this.runFallBall();

        //リフレッシュ
        this.refreshBoard();

        //少しディレイ入れてから落ちコンチェック
        var a1 = cc.delayTime(PZG_ANIME_DURATION_BASE);
        var a2 = cc.callFunc(function() {

          this.checkMatchPuzzle();

        }, this);

        var sq = cc.sequence(a1, a2);
        this.runAction(sq);

      } else {
        this.nextMatchAnime();
      }

    }



  },

  //渡されたオブジェクトを消す
  //アニメが終わったらnextMatchAnimeする
  runMatchAnime: function(dict) {

    var dur = PZG_ANIME_DURATION_BASE;
    var i = 0;

    for (var key in dict) {

      var sp = dict[key];

      var aclist = [];

      var a1 = cc.fadeTo(dur, 0);
      aclist.push(a1);

      //一個だけcallfunc付き
      if (i == 0) {
        var func1 = cc.callFunc(function() {

          //次
          this.nextMatchAnime();

        }, this);
        aclist.push(func1);
      }


      var sq = cc.sequence(aclist);
      sp.runAction(sq);

      i++;
    }


  },

  //matchinfoに該当しているオブジェクトを連想配列に入れて返す
  //keyはindex
  findMatchPuzzleBall: function(list, color) {

    //indexの連想配列
    var dict = {};

    var wcnt = puzzleLogic.getPuzzleWidthCount();

    var i;
    for (i = 0; i < list.length; i++) {
      var info = list[i];

      var c = info.c;
      var pos = info.pos;
      var dir = info.dir;
      var cnt = info.cnt;

      if (c == color) {

        //                cc.log("findMatchPuzzleBall color=" + color + ",pos " + pos.x + "," + pos.y + ",dir=" + dir + ",cnt=" + cnt);

        var addx = 0;
        var addy = 0;
        if (dir == 0) {
          addx = 1;
        } else if (dir == 1) {
          addy = 1;
        }

        var posx = pos.x;
        var posy = pos.y;

        var j;
        for (j = 0; j < cnt; j++) {

          var idx = posx + (posy * wcnt);
          dict[idx] = this.boardList[idx];

          posx += addx;
          posy += addy;

        }

      }

    }

    for (var key in dict) {
      //      cc.log("findmatch key " + key);
    }

    return dict;
  },

  //ボール落下+補充
  runFallBall: function() {
    cc.log("runFallBall");

    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();

    var x, y;
    for (x = 0; x < wcnt; x++) {

      var fallcnt = 0;
      var mycharadd = 0;
      for (y = 0; y < hcnt; y++) {



        var idx = x + (y * wcnt);
        var ball = this.boardList[idx];

        var isMatch = ball.isMatch;
        if (isMatch == true) {
          fallcnt++;
        }

        //fallcntが1以上+消えない場合は落ちる
        if (fallcnt > 0 && isMatch == false) {
          //落下

          //マイキャラは落ちないモードがある
          if (PZG_MYCHAR_ENABLE_FALL == 0 && ball.isMyChar == true) {
            //マイキャラ落ちないモード
            //マイキャラより上のオブジェクトはその分余計に落ちる必要あり
            mycharadd++;
          } else {

            //マイキャラが動かない時は落下位置を調整する必要がある
            if (mycharadd > 0) {

              var pzpos = ball.getBallPosition();
              var posy = pzpos.y - (fallcnt + mycharadd);

              var pzmypos = this.mycharSprite.getBallPosition();
              if (pzmypos.y == posy) {
                //マイキャラと場所がかぶるので調整
                mycharadd--;
              }

            }


            ball.setFallAnime(fallcnt + mycharadd);
          }

        }


        //        cc.log("idx " + idx + ",match " + isMatch + ",fall " + fallcnt);

      }

      //落下分補充する
      if (fallcnt > 0) {
        this.addPuzzleBall(x, fallcnt);

      }

    }






  },

  //ボールの補充
  //x座標と個数を指定
  addPuzzleBall: function(x, cnt) {

    //    cc.log("addPuzzleBall x=" + x + ",cnt=" + cnt);

    var wcnt = puzzleLogic.getPuzzleWidthCount();
    var hcnt = puzzleLogic.getPuzzleHeightCount();

    var i;
    for (i = 0; i < cnt; i++) {

      //とりあえずランダムで
      var sp = this.createRandomPuzzleBall();

      var scale = this.ballPixelSize / sp.getContentSize().width;
      sp.setScale(scale);
      this.addChild(sp, 0);

      var ypos = hcnt - cnt + i;
      var addcnt = 0;

      //マイキャラが落下しない場合は重なる場合がある
      if (PZG_MYCHAR_ENABLE_FALL == 0 && puzzleLogic.enableMyCharMode() == true) {
        var mypos = this.mycharSprite.getBallPosition();

        if (mypos.y == ypos && mypos.x == x) {
          ypos--;
          addcnt++;
        }
      }

      sp.setBallPosition(x, ypos);

      //画面座標
      var pos = this.puzzlePosToScreen(x, ypos);
      sp.setPosition(pos);

      //上から降ってくるアニメ
      sp.setAddAnime(cnt + addcnt);

      this.spriteList.push(sp);

    }



    /*
        //横縦数
        var wcnt = puzzleLogic.getPuzzleWidthCount();
        var hcnt = puzzleLogic.getPuzzleHeightCount();

        var list = []

        var i, j;
        for (i = 0; i < hcnt; i++) {
          for (j = 0; j < wcnt; j++) {

            var idx = puzzleLogic.posToIndex(j, i);

            var c = board[idx];

            //        cc.log("idx "+idx+",c "+c);

            var sp = this.createPuzzleBall(c);
            var scale = this.ballPixelSize / sp.getContentSize().width;
            sp.setScale(scale);
            this.addChild(sp, 0);

            sp.setBallPosition(j, i);

            var pos = this.getBallPosition(j, i);
            sp.setPosition(pos);



            list.push(sp);

          }
        }
    */

  },


  //タイムアップ処理
  onGameEnd: function() {
    cc.log("PuzzleLayer::onGameEnd");

    this.isGameEnd = true;

    //処理をキャンセル
    if (_puzzleLayer.currentBall != null) {
      _puzzleLayer.currentBall.onReleaseBall();
      _puzzleLayer.currentBall = null;
    }
    if (_puzzleLayer.moveBall != null) {
      _puzzleLayer.moveBall.removeFromParent();
      _puzzleLayer.moveBall = null;
    }


  },

  //操作時間切れ
  onControlTimeout: function() {
    cc.log("onControlTimeout");


    if (_puzzleLayer.currentBall != null) {
      _puzzleLayer.currentBall.onReleaseBall();
    }

    //マッチチェック
    _puzzleLayer.checkMatchPuzzle(true);

    if (_puzzleLayer.currentBall != null) {
      _puzzleLayer.currentBall = null;
    }
    if (_puzzleLayer.moveBall != null) {
      _puzzleLayer.moveBall.removeFromParent();
      _puzzleLayer.moveBall = null;
    }


    //操作終了
    puzzleLogic.onBallRelease();


  },






  //パズル座標を画面座標に変換
  puzzlePosToScreen: function(x, y) {
    //    getBallPosition: function(x, y) {

    var dx = x * this.ballPixelSize + (this.ballPixelSize / 2);
    var dy = y * this.ballPixelSize + (this.ballPixelSize / 2);

    return cc.p(dx, dy);
  },

  //操作テスト
  testPuzzle1: function() {
    cc.log("testPuzzle1");

    //どれかを擬似的につかんで一気に入れ替えテスト

    _puzzleLayer.currentBall = this.getBallAtPosition(0,0);
    _puzzleLayer.currentBall.onGrabBall();

    //開始
    puzzleLogic.startMove(_puzzleLayer.currentBall.getBallPosition());



//    var path = [0,7,8,9,10,17];
    var path = [0,1,2,3,4,5,6];
    var tolist = {};
    var movepath = [];


    var pos = _puzzleLayer.currentBall.getBallPosition();
    var srcpos = puzzleLogic.posToIndex(pos.x,pos.y);
    var originpos = srcpos;




    var i;
    for(i=0 ; i < path.length ; i++) {
      var dstpos = path[i];
      if( srcpos != dstpos ) {

        var p1 = puzzleLogic.indexToPos(srcpos);
        var p2 = puzzleLogic.indexToPos(dstpos);

        if( puzzleLogic.checkSwap(p1,p2) == true ) {

          movepath.push(dstpos);
          tolist[originpos] = dstpos;
          tolist[dstpos] = srcpos;

//          cc.log(tolist);
//          cc.log(srcpos+" -> "+dstpos);

          srcpos = dstpos;
        }
        else {
          break;
        }

      }
    }

    //パス更新
    for(i=0 ; i < movepath.length ; i++) {
      var pos = puzzleLogic.indexToPos(movepath[i]);

      puzzleLogic.movePuzzle(pos);
    }


    this.swapPuzzleBallMulti(tolist);

    /*
    //OKなので位置替え
    puzzleLogic.movePuzzle(pos2);

    //行ける方向更新
    if (puzzleLogic.enableDirRestriction() == true) {
      //          if (puzzleLogic.enableMyCharMode() == true) {
      _puzzleLayer.moveBall.updateIndicator(puzzleLogic.checkValidDir(), puzzleLogic.getCurrentDir());

    }


    //演出は後で
    _puzzleLayer.swapPuzzleBall(_puzzleLayer.currentBall, ball);
    */




  }

});

//スプライトのクラス
var PuzzleBallSprite = cc.Sprite.extend({

  ctor: function(filename, color) {
    //////////////////////////////
    // 1. super init first
    this._super(filename);

    this.puzzleColor = color;
    this.isMoving = false;
    this.isMatch = false;
    this._temppos = null;
    this.isMyChar = false;
    this.isGrab = false;

    //マイキャラフラグ
    if (color == PZG_BALL_COLOR_MYCHAR) {
      this.isMyChar = true;
    }
  },

  //消すアニメ開始
  onStartMatchAnime: function() {
    this.isMoving = true;
    this.isMatch = true;
  },
  //アニメに関わってるか
  //アニメ中は入れ替えできない

  //操作可能か
  isPuzzleActive: function() {

    if (this.isMoving == true) {
      return false;
    }
    if (this.isMatch == true) {
      return false;
    }

    return true;
  },


  //タッチされた
  onGrabBall: function() {

    //掴まれたら少し透過させる
    this.setOpacity(128);
    this.isGrab = true;

  },
  //リリース
  onReleaseBall: function() {

    //透過を戻す
    this.setOpacity(255);
    this.isGrab = false;


  },

  //捕まれ状態か
  isGrabBall: function() {
    return this.isGrab;
  },

  //タッチポイントに追従
  setTouchPosition: function(touch) {

    var tp = touch.getLocation();



    var adjx = 0;
    var adjy = 50;

    var vorigin = cc.director.getVisibleOrigin();
    tp.x -= vorigin.x;
    tp.y -= vorigin.y;


    //    this.setPosition(cc.p(tp.x+adjx,tp.y+adjy));
    this.setPosition(tp);

  },

  //落下アニメスタート
  setFallAnime: function(fallcnt) {

    //パズル座標も更新
    var pzpos = this.getBallPosition();
    this.setBallPosition(pzpos.x, pzpos.y - fallcnt);

    //    var pzpos2 = this.getBallPosition();
    //    cc.log("pzpos "+pzpos.x+","+pzpos.y+" -> "+pzpos2.x+","+pzpos2.y);

    //移動
    var height = _puzzleLayer.ballPixelSize;

    //    var pos = this.getPosition();
    var dur = PZG_ANIME_DURATION_BASE;

    var a1 = cc.moveBy(dur, 0, -fallcnt * height);
    //落下中は操作できないようにする
    var f1 = cc.callFunc(function() {
      this.isMoving = false;
    }, this);

    var seq = cc.sequence(a1, f1);


    this.isMoving = true;
    this.runAction(seq);


  },
  //補充アニメ（上から降ってくる
  setAddAnime: function(fallcnt) {

    var hcnt = puzzleLogic.getPuzzleHeightCount();

    //はじめは透明
    this.setOpacity(0);

    //降ってくる＋フェードイン
    var dur = PZG_ANIME_DURATION_BASE;

    //降ってくる分、上に移動
    var pos = this.getPosition();
    var pzpos = this.getBallPosition();
    var addy = fallcnt * _puzzleLayer.ballPixelSize;
    this.setPosition(pos.x, pos.y + addy);

    var a1 = cc.moveBy(dur, 0, -addy);
    var a2 = cc.fadeTo(dur / 2, 255);

    //落下中は操作できないようにする
    var f1 = cc.callFunc(function() {
      this.isMoving = false;
    }, this);

    var sp = cc.spawn(a1, a2);
    var seq = cc.sequence(sp, f1);


    this.isMoving = true;
    this.runAction(seq);

  },

  //移動方向ゲージをくっつける
  addMoveIndicator: function() {

    //上下左右
    var dist = 1.5;
    var poslist = [cc.p(0.5, 1.0), cc.p(0.5, 0), cc.p(0, 0.5), cc.p(1.0, 0.5)];
    var poslist2 = [cc.p(0, dist), cc.p(0, -dist), cc.p(-dist, 0), cc.p(dist, 0)];
    var rotlist = [180, 0, 90, -90];
    var namelist = ["up", "down", "left", "right"];

    var i;
    for (i = 0; i < 4; i++) {
      var sp = new cc.Sprite(res.arrow);
      this.addChild(sp);

      cc.log("size " + _puzzleLayer.ballPixelSize + "," + this.getContentSize().height + "," + sp.getContentSize().height);

      var p = (_puzzleLayer.ballPixelSize * 0.9) / sp.getContentSize().height;
      p /= this.getScale();
      sp.setScale(p);

      //座標
      var pos = poslist2[i];
      var w = this.getContentSize().height;
      var dx = (w / 2) + w * pos.x;
      var dy = (w / 2) + w * pos.y;
      sp.setPosition(dx, dy);

      //回転
      sp.setRotation(rotlist[i]);

      sp.setName(namelist[i]);
      sp.setOpacity(200);

    }

  },

  //フィーバー中
  updateFeverSprite: function(isFever) {
    //    cc.log("upfatefer");

    if (isFever) {
      this.setColor(cc.color(255, 0, 0, 255));
    } else {
      this.setColor(cc.color(255, 255, 255, 255));
    }

  },

  //インジケーター更新
  updateIndicator: function(validDir, currentDir) {

    cc.log("updateIndicator " + validDir + ",currentDir " + currentDir);

    if (validDir[PZG_DIR_UP] == 0 || currentDir == PZG_DIR_UP) {
      this.getChildByName("up").setVisible(false);
    }
    if (validDir[PZG_DIR_DOWN] == 0 || currentDir == PZG_DIR_DOWN) {
      this.getChildByName("down").setVisible(false);
    }
    if (validDir[PZG_DIR_LEFT] == 0 || currentDir == PZG_DIR_LEFT) {
      this.getChildByName("left").setVisible(false);
    }
    if (validDir[PZG_DIR_RIGHT] == 0 || currentDir == PZG_DIR_RIGHT) {
      this.getChildByName("right").setVisible(false);
    }

  },



  //座標
  setBallPosition: function(x, y) {

    this.xpos = x;
    this.ypos = y;

    //    var p = this.getBallPosition();
    //    cc.log("pos " + p.x+","+p.y);

  },
  getBallPosition: function() {
    return cc.p(this.xpos, this.ypos);
  }

});

var puzzleLayerListener = cc.EventListener.create({
  event: cc.EventListener.TOUCH_ONE_BY_ONE,


  //タッチ開始
  onTouchBegan: function(touch, event) {


    if (_puzzleLayer.isGameEnd == true) {
      //      cc.log("ゲーム終了してる");
      return false;
    }

    var tp = touch.getLocation();

    var vorigin = cc.director.getVisibleOrigin();
    var vsize = cc.director.getVisibleSize();
    tp.x -= vorigin.x;
    tp.y -= vorigin.y;

    _puzzleLayer.currentBall = null;
    _puzzleLayer.moveBall = null;

    //    cc.log(touch.getLocation());
    //    cc.log(touch.getLocationInView());


    //スプライト当たり判定
    var list = _puzzleLayer.spriteList;
    var i;
    for (i = 0; i < list.length; i++) {
      var sp = list[i];

      box = sp.getBoundingBox();

      if (cc.rectContainsPoint(box, tp) && sp.isPuzzleActive()) {
        //ヒット
        //        cc.log("onTouchBegan " + box.x + "," + box.y + "," + box.width + "," + box.height);

        //マイキャラモード時はマイキャラしか動かせない
        if (puzzleLogic.enableMyCharMode() == true) {
          if (sp.puzzleColor != PZG_BALL_COLOR_MYCHAR) {
            return false;
          }
        }

        //移動させる玉を新しく生成
        var sp2 = _puzzleLayer.createPuzzleBall(sp.puzzleColor);
        _puzzleLayer.addChild(sp2, 1);
        _puzzleLayer.moveBall = sp2;
        sp2.setScale(sp.getScale());
        sp2.setTouchPosition(touch);

        //マイキャラには移動インジケーターをつける
        //移動制限がある場合はインジケーター付ける
        if (puzzleLogic.enableDirRestriction() == true) {
          //        if (puzzleLogic.enableMyCharMode() == true) {
          sp2.addMoveIndicator();
        }

        //掴まれた表示
        _puzzleLayer.currentBall = sp;
        sp.onGrabBall();

        //開始
        puzzleLogic.startMove(sp.getBallPosition());


        break;

      }


    }

    if (_puzzleLayer.currentBall != null) {
      return true;
    }
    //    cc.log("onTouchBegan " + tp.x + "," + tp.y);

    //    cc.log("onTouchBegan pl " + list.length);
    return false;
  },

  //移動中
  onTouchMoved: function(touch, event) {
    //    cc.log("onTouchMoved pl");

    //    var delta = touch.getDelta();
    //    cc.log("move "+delta.x+","+delta.y);



    if (_puzzleLayer.currentBall != null) {



      //移動させてみる
      _puzzleLayer.moveBall.setTouchPosition(touch);

      if (puzzleLogic.enableFeverTime() == true) {
        _puzzleLayer.moveBall.updateFeverSprite(puzzleLogic.isFeverTime());
      }
      //      sp.setPosition(tp);

      //複数入れ替え
      var path = [];
      if ( puzzleLogic.enableMultiSwap() == true ) {
        path = this.getMoveTraceBalls(touch);
      }

      if (path.length > 1) {

        var tolist = {};
        var movepath = [];


        var pos = _puzzleLayer.currentBall.getBallPosition();
        var srcpos = puzzleLogic.posToIndex(pos.x,pos.y);
        var originpos = srcpos;

        var i;
        for(i=0 ; i < path.length ; i++) {
          var dstpos = path[i];
          if( srcpos != dstpos ) {

            var p1 = puzzleLogic.indexToPos(srcpos);
            var p2 = puzzleLogic.indexToPos(dstpos);

            if( puzzleLogic.checkSwap(p1,p2) == true ) {

              movepath.push(dstpos);
              tolist[originpos] = dstpos;
              tolist[dstpos] = srcpos;

    //          cc.log(tolist);
    //          cc.log(srcpos+" -> "+dstpos);

              srcpos = dstpos;
            }
            else {
              break;
            }

          }
        }

        //パス更新
        for(i=0 ; i < movepath.length ; i++) {
          var pos = puzzleLogic.indexToPos(movepath[i]);

          puzzleLogic.movePuzzle(pos);
        }


        //移動
        _puzzleLayer.swapPuzzleBallMulti(tolist);


        if (puzzleLogic.getPuzzleMatchTiming() == PZG_BALL_MATCH_TIMING_EARLY) {
          //すぐにマッチチェック
          _puzzleLayer.checkMatchPuzzle();

          if (_puzzleLayer.currentBall.isMoving == true) {
            //移動させたやつが消えたので操作できなくする
            _puzzleLayer.currentBall = null;
            _puzzleLayer.moveBall.removeFromParent();
            _puzzleLayer.moveBall = null;

            //操作終了
            puzzleLogic.onBallRelease();

          }
        }







      } else {


        //入れ替えチェック
        var ball = this.getTouchBall(touch);
        if (ball != null && ball.isPuzzleActive() == true) {


          var pos1 = _puzzleLayer.currentBall.getBallPosition();
          var pos2 = ball.getBallPosition();

          if (puzzleLogic.checkSwap(pos1, pos2) == true) {

            //OKなので位置替え
            puzzleLogic.movePuzzle(pos2);

            //行ける方向更新
            if (puzzleLogic.enableDirRestriction() == true) {
              //          if (puzzleLogic.enableMyCharMode() == true) {
              _puzzleLayer.moveBall.updateIndicator(puzzleLogic.checkValidDir(), puzzleLogic.getCurrentDir());

            }


            //演出は後で
            _puzzleLayer.swapPuzzleBall(_puzzleLayer.currentBall, ball);

            if (puzzleLogic.getPuzzleMatchTiming() == PZG_BALL_MATCH_TIMING_EARLY) {
              //すぐにマッチチェック
              _puzzleLayer.checkMatchPuzzle();

              if (_puzzleLayer.currentBall.isMoving == true) {
                //移動させたやつが消えたので操作できなくする
                _puzzleLayer.currentBall = null;
                _puzzleLayer.moveBall.removeFromParent();
                _puzzleLayer.moveBall = null;

                //操作終了
                puzzleLogic.onBallRelease();

              }
            }


          }

        }



      }

    } else {
      //      cc.log("current null");
    }

  },

  //同時タッチテスト
  getMoveTraceBalls: function(touch) {


    var wcnt = puzzleLogic.getPuzzleWidthCount();

    var delta = touch.getDelta();
    var stpos = touch.getPreviousLocation();


    var vorigin = cc.director.getVisibleOrigin();
    var vsize = cc.director.getVisibleSize();
    stpos.x -= vorigin.x;
    stpos.y -= vorigin.y;

    //    cc.log(stpos.x+","+stpos.y+" -> "+tp.x+","+tp.y);

    //中間調べる回数とか
    var distmax = Math.max(Math.abs(delta.x), Math.abs(delta.y));

    //ボール一個サイズ/5くらいずつ？
    var pixel = _puzzleLayer.ballPixelSize / 5;

    var cnt = Math.floor(distmax / pixel);
//    cc.log("distmax "+distmax+",cnt "+cnt);


    var path = [];

    var startballpos = _puzzleLayer.screenPosToIndex(stpos.x, stpos.y);

    if( cnt == 0 ) {
      cnt = 1;
    }

    if (cnt > 0) {

      var addx = delta.x / cnt;
      var addy = delta.y / cnt;

      var touchx = stpos.x;
      var touchy = stpos.y;

//      var prev = -1;

      var prev = startballpos;
      path.push(startballpos);
//      cc.log("startpos "+startballpos);

      var i;
      for (i = 0; i < cnt; i++) {

        touchx += addx;
        touchy += addy;


        var idx = _puzzleLayer.screenPosToIndex(touchx, touchy);

//        cc.log(touchx + "," + touchy+","+idx);

        if (idx != -1 && prev != idx) {

//          cc.log("move "+prev+"->"+idx);

          //隣り合っていない場合は適当に補完してみる
          if (prev != -1) {
            var diff = idx - prev;
//            cc.log("hokan? abs="+Math.abs(diff)+",abs2="+Math.abs(diff));
            if (Math.abs(diff) != 1 && Math.abs(diff) != wcnt) {

              //斜めの４パターン決め打ち対応
              var hokan = -1;
              if ((diff == wcnt + 1) || (diff == wcnt - 1)) {
                hokan = prev + wcnt;
              } else if ((diff == -wcnt + 1) || (diff == -wcnt - 1)) {
                hokan = prev - wcnt;
              }

              if (hokan != -1) {
                path.push(hokan);
              }

            }
          }

//          cc.log("add "+idx);
          path.push(idx);

          prev = idx;
        }

      }
    }








    //    cc.log("trace pos (" + stpos.x + "," + stpos.y + ") delta (" + delta.x + "," + delta.y + "),pixel " + pixel);
    //    cc.log("addxy " + addx + "," + addy);

    if (path.length > 1) {
      cc.log("trace " + startballpos + " -> " + path);
    }

    return path;

  },

  onTouchEnded: function(touch, event) {
    cc.log("onTouchEnded pl");

    if (_puzzleLayer.currentBall != null) {
      _puzzleLayer.currentBall.onReleaseBall();
    }
    if (_puzzleLayer.moveBall != null) {
      _puzzleLayer.moveBall.removeFromParent();
      _puzzleLayer.moveBall = null;
    }

    //マッチチェック
    if (puzzleLogic.getPuzzleMatchTiming() == PZG_BALL_MATCH_TIMING_END || puzzleLogic.enableMyCharMode() == false ) {
      _puzzleLayer.checkMatchPuzzle();
    }

    //操作終了
    puzzleLogic.onBallRelease();


  },

  onTouchCancelled: function(touch, event) {
    cc.log("onTouchCancelled pl");

    if (_puzzleLayer.currentBall != null) {
      _puzzleLayer.currentBall.onReleaseBall();
    }
    if (_puzzleLayer.moveBall != null) {
      _puzzleLayer.moveBall.removeFromParent();
      _puzzleLayer.moveBall = null;
    }

    //マッチチェック
    if (puzzleLogic.getPuzzleMatchTiming() == PZG_BALL_MATCH_TIMING_END || puzzleLogic.enableMyCharMode() == false ) {
      _puzzleLayer.checkMatchPuzzle();
    }

    //操作終了
    puzzleLogic.onBallRelease();

  },

  //タッチしたブロック取得
  getTouchBall: function(touch) {

    var tp = touch.getLocation();

    var vorigin = cc.director.getVisibleOrigin();
    tp.x -= vorigin.x;
    tp.y -= vorigin.y;

    //スプライト当たり判定
    var list = _puzzleLayer.spriteList;
    var i;
    for (i = 0; i < list.length; i++) {
      var sp = list[i];

      var box = sp.getBoundingBox();

      if (cc.rectContainsPoint(box, tp)) {
        //ヒット
        return sp;
      }

    }

    return null;
  }

});
