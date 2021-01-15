import Wave from './Wave';
import Player from './Player';
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // Player 节点，用于获取主角弹跳的高度，和控制主角行动开关
    @property(cc.Node)
    playerNode:cc.Node = null;

    @property(Player)
    playerCom:Player = null;

    //能量波预制资源
    @property(cc.Prefab)
    wavePreFab: cc.Prefab = null;

    //背景音效资源
    @property(cc.AudioClip)
    bgAudio = null;

    onLoad () {
        this.playerCom.init(this);
        cc.audioEngine.playEffect(this.bgAudio, true);
    }

    spawnNewWave() {
        // 使用给定的模板在场景中生成一个新节点
        var newWave = cc.instantiate(this.wavePreFab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newWave);
        // 为星星设置一个随机位置
        let playerPos = this.playerNode.getPosition();
        let xPos = playerPos.x - this.node.x + 110;
        let yPos = playerPos.y - this.node.y + 10;
        newWave.setPosition(xPos, yPos);
        let newWaveComp = newWave.getComponent(Wave);
        newWaveComp.init(this);
    }


    // update (dt) {}
}
