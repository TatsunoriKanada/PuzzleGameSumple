
//ゲームタイプ
//0でプロトタイプA,1がプロトB,2=プロトB2,3=プロトB3
//4=プロトタイプA2
PZG_RULE_TYPE = 1;

//何個消すとフィーバータイムになるか
PZG_FEVER_MATCH_COUNT = 20;
//フィーバータイム時間
PZG_FEVER_LIMIT_SEC = 10.0;

//制限時間がある場合の秒数
//PZG_LIMIT_TIME_SEC = 20.0;
PZG_LIMIT_TIME_SEC = 120.0;

//パズルの色
PZG_BALL_COLOR_BLUE = 0;
PZG_BALL_COLOR_RED = 1;
PZG_BALL_COLOR_BLACK = 2;
PZG_BALL_COLOR_YELLOW = 3;
PZG_BALL_COLOR_PURPLE = 4;
PZG_BALL_COLOR_GREEN = 5;
PZG_BALL_COLOR_LIGHTBLUE = 6;
PZG_BALL_COLOR_MYCHAR = 7;

//消すタイミング
//操作完了時
PZG_BALL_MATCH_TIMING_END = 0;
//即時
PZG_BALL_MATCH_TIMING_EARLY = 1;


//アニメーション調整
//消えたり落ちたりするアニメの時間
PZG_ANIME_DURATION_BASE = 0.34;
//入れ替えアニメ
PZG_ANIME_DURATION_SWAP = 0.1;

//マイキャラが落下するか
PZG_MYCHAR_ENABLE_FALL = 0;

//方向定数
PZG_DIR_UP = 1;
PZG_DIR_DOWN = 2;
PZG_DIR_LEFT = 3;
PZG_DIR_RIGHT = 4;

//state
PZG_GAME_STATE_PLAY = 0;
PZG_GAME_STATE_END = 1;

//操作制限時間
PZG_CONTROL_TIME_MAX = 2.0;