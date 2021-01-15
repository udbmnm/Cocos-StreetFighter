const {ccclass, property} = cc._decorator;
@ccclass
export default class NewScript extends cc.Component {

    @property
    distance = 30;//每次移动距离
    @property
    moveDuration = 0.05;//移动时间
    // 主角跳跃高度
    @property
    jumpHeight = 150;
    // 主角跳跃持续时间
    @property
    jumpDuration = 0.1;
    // 最大移动速度
    @property
    maxMoveSpeed = 300;
    // 加速度
    @property
    accel = 100;
    // 跳跃音效资源
    @property(cc.AudioClip)
    jumpAudio = null;

    @property(cc.AudioClip)
    boxingAudio = null;

    @property(cc.AudioClip)
    kickAudio = null;

    @property(cc.AudioClip)
    waveAudio = null;

    // 主角当前水平方向速度
    xSpeed = 0;
    // screen boundaries
    minPosX = 70;
    maxPosX = 900;
    anim = null;
    touchingID = 0; //触摸事件标记
    state = 'waiting'; //当前所处状态
    animState = null; //动画状态
    game = null;
    init(game) {
        this.game = game;
    }
    onLoad () {
        let anim = this.getComponent(cc.Animation);
        this.anim = anim;
        this.anim.on('finished',  this.onAnimFinished,this);
        this.runWaitAction();//站立等待
        // 初始化键盘输入监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        // 开始触摸
        // cc.systemEvent.on(cc.Node.EventType.TOUCH_START, this.onTouchEvt, this);
        // 结束触摸
        // cc.systemEvent.on(cc.Node.EventType.TOUCH_END, this.onTouchEvt, this);
    }
    onAnimFinished() {
        console.log('onAnimFinished');
        this.runWaitAction();
    }
    playJumpSound ():void {
        // 调用声音引擎播放声音
        // cc.audioEngine.playEffect(this.jumpAudio, false);
    }
    actionEnd() {
        console.log('动作结束');
        this.state = 'waiting';
        this.animState = this.anim.play('waiting');
    }
    runJumpAction() {
        if(this.state === 'jumping') {
            console.log('跳跃未结束');
            this.anim.resume();
            return;
        }
        this.state = 'jumping';
        this.animState =  this.anim.play('jump');
        let callFunc = cc.callFunc((target, score)=>{
            this.actionEnd();
        });
        let up = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight));
        let down = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight));
        let seq = cc.sequence(up,down,callFunc);
        this.node.runAction(seq);
    }
    runWaitAction() {
        this.state = 'waiting';
        this.animState = this.anim.play('waiting');
    }
    runMoveAction(type) {
        if(this.state === type && this.animState.isPlaying) {
            console.log(`${type} 未完成`);
        }else {
            this.animState = this.anim.play(type);
        }
        this.state = type;
        if((this.node.x < this.minPosX && type === 'goback') || (this.node.x > this.maxPosX && type === 'goforward')) {
            console.log('超过左边范围');
            return;
        }
        let distance = type === 'goback'? -this.distance : this.distance;
        let move = cc.moveBy(this.moveDuration, cc.v2(distance, 0));
        let callFunc = cc.callFunc((target, score)=>{
            // this.actionEnd();
        });
        // move.easing(cc.ease());
        let seq = cc.sequence(move,callFunc);
        this.node.runAction(seq);
    }
    runWaveBoxingAction() {
        this.animState = this.anim.play('wave_boxing');
        this.game.spawnNewWave();
        cc.audioEngine.playEffect(this.waveAudio, false);
    }
    onKeyDown (event) {
        // set a flag when key pressed
        console.log('onKeyDown this.animState.isPlaying',this.animState.isPlaying,event.keyCode);
        switch(event.keyCode) {
        case cc.macro.KEY.a:
            this.runMoveAction('goback');
            break;
        case cc.macro.KEY.d:
            this.runMoveAction('goforward');
            break;
        case cc.macro.KEY.w:
            this.runJumpAction();
            break;
        case cc.macro.KEY.j:
            this.animState = this.anim.play('boxing');
            cc.audioEngine.playEffect(this.boxingAudio, false);
            break;
        case cc.macro.KEY.k:
            this.animState = this.anim.play('kick');
            cc.audioEngine.playEffect(this.kickAudio, false);
            break;
        case cc.macro.KEY.l:
            this.runWaveBoxingAction();
            break;
        }

    }

    onKeyUp (event) {
        // unset a flag when key released
        switch(event.keyCode) {
        case cc.macro.KEY.a:
            break;
        case cc.macro.KEY.d:
            break;
        }
        console.log('onKeyUp animState',this.animState.isPlaying);
        console.log('this.node.x',this.node.x);
    }

    // onLoad () {},

    start () {

    }

    onTouchEvt(evt) {
        const touch = evt.touch;
        const tid = touch.getID();
        let touchingID = this.touchingID;
        console.log('touchingID',touchingID);
        if (evt.type === cc.Node.EventType.TOUCH_START) {
            // 开始触摸
            if (touchingID) return;    // 当前已有触摸，忽略之
            touchingID = tid;
        } else {
            // 结束触摸
            if (touchingID && touchingID !== tid) return; // 不是正触摸的点，忽略之

            // 得到滑动向量
            const vec = touch.getLocation().sub(touch.getStartLocation());
            if (vec.mag() < 10) {
                // 滑动距离太短，可认为是点击
                // your code...
            } else {
                // 得到滑动的方向
                // 右：(1, 0)
                // 左：(-1, 0)
                // 上：(0, 1)
                // 下：(0, -1)
                const dir = this.getVecDir(vec);
                // your code...
                console.log('dir',dir);
                debugger
            }

            this.touchingID = 0;
        }
    }
    getVecDir(vec) {
        if (Math.abs(vec.x) > Math.abs(vec.y)) { // 略嫌这里的判断不够高雅
            // 水平滑动
            if (vec.x > 0) {
                // 右
                return cc.Vec2.RIGHT;
            } else {
                // 左（即右的取反）
                return cc.Vec2.RIGHT.negSelf();
            }
        } else {
            // 垂直滑动
            if (vec.y > 0) {
                // 上
                return cc.Vec2.UP;
            } else {
                // 下
                return cc.Vec2.UP.negSelf();
            }
        }
    }
    onDestroy () {
        // 取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    update (dt) {
        // // 根据当前加速度方向每帧更新速度
        // if (this.accLeft) {
        //     this.xSpeed -= this.accel * dt;
        // }
        // else if (this.accRight) {
        //     this.xSpeed += this.accel * dt;
        // }

        // 限制主角的速度不能超过最大值
        // if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
        //     // if speed reach limit, use max speed with current direction
        //     this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        // }

        // 根据当前速度更新主角的位置
        // this.node.x += this.xSpeed * dt;
    }


}
