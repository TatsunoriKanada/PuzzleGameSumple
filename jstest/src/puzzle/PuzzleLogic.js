//パズルのロジック部分



function PuzzleLogic() {


  var puzzleWidthCount;
  var puzzleHeightCount;
  var puzzleColorNum;

  //入れ替え制約
  var restrictionUp;
  var restrictionDown;
  var restrictionLeft;
  var restrictionRight;
  //制約数える変数
  var swapPathList;
  //最大方向転換数
  var maxTurnCount;

  //パズルを消すタイミング
  var puzzleMatchTiming;

  //マイキャラを使うか
  var isMyCharMode;

  //制限時間
  var limitTimeSec;
  var enableLimitTime;

  //フィーバータイム
  var enableFeverTime;
  var feverMatchCount;
  var feverLimitTime;
  var isFeverTime;

  //仮のスコア計算
  var currentScore = 0;

  //操作タイム
  var enableControlTime;
  var controlTimeLimit;

  //操作中か
  var isBallOperationNow = false;

  //PZG_RULE_TYPEで初期値を変える
  if (PZG_RULE_TYPE == 0 || PZG_RULE_TYPE == 4) {
    //A

    if (PZG_RULE_TYPE == 0) {
      //A

      //色数
      puzzleColorNum = 6;

      //操作制限時間なし
      enableControlTime = false;

      //消すタイミング
      puzzleMatchTiming = PZG_BALL_MATCH_TIMING_END;

    } else if (PZG_RULE_TYPE == 4) {
      //A2

      //色数
      puzzleColorNum = 7;

      //操作制限時間あり
      enableControlTime = true;
      controlTimeLimit = PZG_CONTROL_TIME_MAX;

      //消すタイミング
      puzzleMatchTiming = PZG_BALL_MATCH_TIMING_EARLY;
    }

    //縦横数
    puzzleWidthCount = 7;
    puzzleHeightCount = 7;

    //制約なし
    restrictionUp = -1;
    restrictionDown = -1;
    restrictionLeft = -1;
    restrictionRight = -1;

    //マイキャラ
    isMyCharMode = false;

    //制限時間なし
    enableLimitTime = false;
    limitTimeSec = -9999;

    //フィーバーなし
    enableFeverTime = false;

  } else {
    //縦横数
    if (PZG_RULE_TYPE == 1) {
      puzzleWidthCount = 6;
      puzzleHeightCount = 5;

      maxTurnCount = 4;

      //マイキャラ
      isMyCharMode = true;

    } else if (PZG_RULE_TYPE == 2) {
      puzzleWidthCount = 7;
      puzzleHeightCount = 7;

      maxTurnCount = 4;

      //マイキャラ
      isMyCharMode = true;

    } else if (PZG_RULE_TYPE == 3) {
      puzzleWidthCount = 7;
      puzzleHeightCount = 7;

      maxTurnCount = 2;

      //マイキャラなし
      isMyCharMode = false;
    }
    //色数
    puzzleColorNum = 6;

    //それぞれ一回
    restrictionUp = 1;
    restrictionDown = 1;
    restrictionLeft = 1;
    restrictionRight = 1;

    //消すタイミング
    //    puzzleMatchTiming = PZG_BALL_MATCH_TIMING_END;
    puzzleMatchTiming = PZG_BALL_MATCH_TIMING_EARLY;


    //制限時間あり
    enableLimitTime = true;
    limitTimeSec = PZG_LIMIT_TIME_SEC;

    //フィーバーあり
    enableFeverTime = true;
    feverMatchCount = PZG_FEVER_MATCH_COUNT;
    feverLimitTime = PZG_FEVER_LIMIT_SEC;
    isFeverTime = false;

    //操作制限時間なし
    enableControlTime = false;

  }

  cc.log("PuzzleLogic::init mode=" + PZG_RULE_TYPE);
  cc.log("横 " + puzzleWidthCount + ",縦 " + puzzleHeightCount);


  //初期ボード生成
  this.createBoard = function() {

    cc.log("PuzzleLogic::createBoard");

    var i, j;
    var total = puzzleHeightCount * puzzleWidthCount;
    var board = new Array(total);

    var testy1 = 3;
    var testy2 = 4;

    //とりあえずランダム
    //あとで３つ揃わないように修正する
    for (i = 0; i < puzzleHeightCount; i++) {
      for (j = 0; j < puzzleWidthCount; j++) {

        //左と下とは別の色にする
        var omit1 = -1;
        var omit2 = -1;

        var idx = this.posToIndex(j, i);
        if (j > 0) {
          //左の色チェック
          omit1 = board[idx - 1];
        }
        if (i > 0) {
          //下の色チェック
          var idx2 = idx - puzzleWidthCount;
          omit2 = board[idx2];
        }


        var r = this.getRandomColor(omit1, omit2);

        //test
        if (0 && isMyCharMode) {

          if (i == testy1) {
            r = PZG_BALL_COLOR_YELLOW;
          } else if (i == testy2 && j == 2) {
            r = PZG_BALL_COLOR_YELLOW;
          }

          //          r = i;
        }

        board[idx] = r;


      }
    }

    //マイキャラモードの時はどれか一つをマイキャラにする
    if (isMyCharMode == true) {
      //とりあえず真ん中
      var x = parseInt(puzzleWidthCount / 2);
      var y = parseInt(puzzleHeightCount / 2);

      var idx = x + (y * puzzleWidthCount);

      //test
      if (0 && isMyCharMode) {
        idx = 2 + (testy1 * puzzleWidthCount);
      }

      board[idx] = PZG_BALL_COLOR_MYCHAR;

      //      cc.log("setmychar idx="+idx);

    }

    return board;

  }

  //ランダムで色取得
  //省く色を２つ設定できる
  this.getRandomColor = function(omit1, omit2) {

    //    cc.log("getRandomColor omit1=" + omit1 + ",omit2=" + omit2);

    var list = [];
    var i;
    for (i = 0; i < puzzleColorNum; i++) {

      if (i == omit1 || i == omit2) {
        continue;
      }

      list.push(i);
    }

    var r = Math.floor(Math.random() * list.length);
    var n = list[r];

    return n;

  }

  //(0,0) -> 0
  this.posToIndex = function(x, y) {

    var idx = x + (y * puzzleWidthCount);

    //    cc.log("PuzzleLogic::posToIndex x="+x+",y="+y+" -> "+idx);

    return idx;
  }


  //各種情報
  this.getPuzzleWidthCount = function() {
    return puzzleWidthCount;
  }
  this.getPuzzleHeightCount = function() {
    return puzzleHeightCount;
  }
  this.getPuzzleColorNum = function() {
    return puzzleColorNum;
  }
  this.getPuzzleMatchTiming = function() {
    return puzzleMatchTiming;
  }
  this.enableMyCharMode = function() {
    return isMyCharMode;
  }
  //行ける方向制限があるか
  this.enableDirRestriction = function() {
    if (restrictionUp > 0) {
      return true;
    }

    return false;
  }

  //入れ替え可能か
  this.checkSwap = function(pos1, pos2) {

    //同じところはだめ
    if (pos1.x == pos2.x && pos1.y == pos2.y) {
      return false;
    }

    //同じラインか
    var ok = 0;
    if (pos1.x == pos2.x && pos1.y != pos2.y) {
      ok = 1;
    }
    if (pos1.x != pos2.x && pos1.y == pos2.y) {
      ok = 1;
    }

    //さらに細かい制約をチェックする
    if (ok == 1) {

      if (this.checkRestriction(pos1, pos2) == true) {
        return true;
      }
    }

    return false;
  }

  //制約チェック
  this.checkRestriction = function(pos1, pos2) {
    cc.log("checkRestriction (" + pos1.x + "," + pos1.y + ") (" + pos2.x + "," + pos2.y + ")");

    //pos1とpos2が隣り合わせか
    //早くなぞった場合に途中が抜けるとかあるかも
    var dist = Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    if (dist != 1) {
      return false;
    }

    //入れ替え制約

    //一度に動かせる回数が決まっている制約
    if (restrictionUp > 0) {

      //何マスでも動かせるが方向転換は一回ずつしかできない
      var validDir = this.checkValidDir();

      //動こうとしている方向
      var dir = this.getDir(pos1, pos2);

      if (validDir[dir] == 0) {
        return false;
      }

      //      cc.log("dir "+dir+",valid "+validDir);


      /*
      var UP = PZG_DIR_UP;
      var DOWN = PZG_DIR_DOWN;
      var LEFT = PZG_DIR_LEFT;
      var RIGHT = PZG_DIR_RIGHT;

      //方向転換数
      var changeup = 0;
      var changedown = 0;
      var changeleft = 0;
      var changeright = 0;

      var list = swapPathList.slice(0, swapPathList.length);
      list.push(pos2);

      var oldDir = 0;

      for (i = 1; i < list.length; i++) {

        var src = list[i - 1];
        var dst = list[i];

        var dir = 0;

        if (dst.x > src.x) {
          dir = RIGHT;
        } else if (dst.x < src.x) {
          dir = LEFT;
        }

        if (dst.y > src.y) {
          dir = UP;
        } else if (dst.y < src.y) {
          dir = DOWN;
        }

        if (oldDir != dir) {
          //        if( oldDir != 0 && oldDir != dir ) {

          if (dir == UP) {
            changeup++;
          } else if (dir == DOWN) {
            changedown++;
          } else if (dir == RIGHT) {
            changeright++;
          } else if (dir == LEFT) {
            changeleft++;
          }
        }
        oldDir = dir;

      }

      //最後に動いた方向
      var len = list.length;
      var lastDir = this.getDir(list[len-1],list[len-2]);

      //移動できる方向
      var validDir = [0, 0, 0, 0, 0];
      if (changeup < restrictionUp) validDir[UP] = 1;
      if (changedown < restrictionDown) validDir[DOWN] = 1;
      if (changeleft < restrictionLeft) validDir[LEFT] = 1;
      if (changeright < restrictionRight) validDir[RIGHT] = 1;

      cc.log("last "+lastDir+",validir " + validDir);



      //            cc.log("up "+changeup+",down "+changedown+",left "+changeleft+",right "+changeright);

      if (changeup > restrictionUp) {
        return false;
      } else if (changedown > restrictionDown) {
        return false;
      } else if (changeleft > restrictionLeft) {
        return false;
      } else if (changeright > restrictionRight) {
        return false;
      }
      */


    }




    //    cc.log("dist " + dist);

    return true;
  }

  //移動した方向を返す
  this.getDir = function(pos1, pos2) {

    if (pos1.x < pos2.x) return PZG_DIR_RIGHT;
    if (pos1.x > pos2.x) return PZG_DIR_LEFT;
    if (pos1.y < pos2.y) return PZG_DIR_UP;
    if (pos1.y > pos2.y) return PZG_DIR_DOWN;


    return 0;
  }

  //行ける方向チェック
  this.checkValidDir = function() {

    var validDir = [0, 1, 1, 1, 1];

    //フィーバー中は全方向ok
    if (enableFeverTime == true && isFeverTime == true) {
      return validDir;
    }

    var list = swapPathList;

    //方向転換数
    var changecnt = 0;

    var path = [];

    var i;
    var oldDir = 0;
    for (i = 1; i < list.length; i++) {

      var src = list[i - 1];
      var dst = list[i];

      var dir = this.getDir(src, dst);

      //方向転換できない
      validDir[dir] = 0;

      path.push(dir);

      if (oldDir != dir) {
        //        if( oldDir != 0 && oldDir != dir ) {
        changecnt++;

        //方向転換maxチェック
        if (changecnt >= maxTurnCount) {

          //          cc.log("changecnt max break");

          validDir[PZG_DIR_UP] = 0;
          validDir[PZG_DIR_DOWN] = 0;
          validDir[PZG_DIR_LEFT] = 0;
          validDir[PZG_DIR_RIGHT] = 0;

          oldDir = dir;
          break;
        }

      }
      oldDir = dir;

    }

    //最後の方向はok
    if (oldDir > 0) {
      validDir[oldDir] = 1;
    }

    //    cc.log("checkValidDir "+validDir+",turncnt "+changecnt+",rldDir "+oldDir);
    //      cc.log("path "+path);
    //      cc.log("up "+changeup+",down "+changedown+",left "+changeleft+",right "+changeright);

    return validDir;
  }

  //現在の進行方向
  this.getCurrentDir = function() {

    var len = swapPathList.length;
    if (len > 1) {
      var pos1 = swapPathList[len - 2];
      var pos2 = swapPathList[len - 1];

      return this.getDir(pos1, pos2);

    }

    return 0;
  }

  //起点セット
  this.startMove = function(pos) {

    var idx = pos.x + (pos.y * puzzleWidthCount);
    cc.log("startMove " + pos.x + "," + pos.y + "(" + idx + ")");

    //移動の軌跡をとっておく
    swapPathList = [cc.p(pos.x, pos.y)];

    //時間初期化
    controlTimeLimit = PZG_CONTROL_TIME_MAX;

  }

  //進んだ
  this.movePuzzle = function(pos) {

    cc.log("movePuzzle " + pos.x + "," + pos.y);

    //軌跡追加
    swapPathList.push(cc.p(pos.x, pos.y));

    isBallOperationNow = true;

  }

  //進んだ数
  this.getMoveCount = function() {
    var count = swapPathList.length;

    return count - 1;
  }

  //消した数保存
  this.addPuzzleScore = function(score) {
    //    cc.log("addPuzzleScore "+score);

    //scoreは消した数
    if (enableFeverTime == true && isFeverTime == false) {
      feverMatchCount -= score;

      if (feverMatchCount <= 0) {
        //フィーバー突入
        feverLimitTime = PZG_FEVER_LIMIT_SEC;
        isFeverTime = true;
        feverMatchCount = PZG_FEVER_MATCH_COUNT;
      }
    }

    currentScore += score;

    //ローカルに保存してみる
    var saveval = cc.sys.localStorage.getItem("game_score");
    if (saveval == null) {
      saveval = 0;
    } else {
      saveval = parseInt(saveval);
    }

    saveval += score;
    cc.sys.localStorage.setItem("game_score", saveval);


  }


  //残り時間
  this.getLimitTime = function() {
    return limitTimeSec;
  }
  this.advanceLimit = function(dt) {
    limitTimeSec -= dt;

    //操作制限時間
    if( enableControlTime == true && isBallOperationNow == true ) {
      controlTimeLimit -= dt;
      if( controlTimeLimit < 0 ) {
        //時間切れ
        controlTimeLimit = 0;
        isBallOperationNow = false;

        _puzzleLayer.onControlTimeout();
      }
    }

    //フィーバー
    if (enableFeverTime == true && isFeverTime == true) {
      feverLimitTime -= dt;

      if (feverLimitTime <= 0) {
        //フィーバー終了
        isFeverTime = false;
      }
    }
  }
  //時間切れか
  this.isLimitOver = function() {

    if (enableLimitTime == true && limitTimeSec <= 0) {
      return true;
    }

    return false;

  }

  //スコア
  this.getCurrentScore = function() {
    return currentScore;
  }

  //フィーバー関連
  this.enableFeverTime = function() {
    return enableFeverTime;
  }
  this.feverMatchCount = function() {
    return feverMatchCount;
  }
  this.isFeverTime = function() {
    return isFeverTime;
  }
  this.feverLimitTime = function() {
    return feverLimitTime;
  }
  this.enableControlTime = function() {
    return enableControlTime;
  }
  this.isBallOperationNow = function() {
    return isBallOperationNow;
  }
  this.getControlTimeLimit = function() {
    return controlTimeLimit;
  }


  //操作し終わった
  this.onBallRelease = function() {
    isBallOperationNow = false;
  }


}
