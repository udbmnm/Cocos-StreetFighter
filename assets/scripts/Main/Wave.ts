// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    //最远距离
    @property
    maxPosX = 500;
    @property
    xSpeed = 100;
    anim:cc.Animation = null;
    game = null;
    init(game) {
        this.game = game;
        this.enabled = true;
        this.anim = this.getComponent(cc.Animation);
        this.anim.play();
        this.move();
    }
    start() {
        console.log('start this.enabled ',this.enabled );
    }
    onLoad () {
        this.enabled = false;
        console.log('onLoad this.enabled ',this.enabled );
    }
    move () {
        let duration = (this.maxPosX - this.node.x)/this.xSpeed;
        let move = cc.tween(this.node).to(duration, {x:this.maxPosX}, {easing: 'sineOut'}) .call(() => { console.log('move callback'); });
        move.start();
    }

    update (dt) {
        if (this.node.x > this.maxPosX ) {
            console.log('wave destroy');
            this.node.destroy();
            this.enabled = false;
        }
    }
}
