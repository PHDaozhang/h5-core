//////////////////////////////////////////////////////////////////////////////////////

module cui
{
    export class Animation {
        /**
         * @private
         */
        public constructor(updateFunction:(animation:Animation)=>void, thisObject:any) {
            this.updateFunction = updateFunction;
            this.thisObject = thisObject;
        }

        public easerFunction:Function = EaseUtil.sineInOut;

        /**
         * @private
         */
        private thisObject:any;

        /**
         * @private
         * 是否正在播放动画，不包括延迟等待和暂停的阶段
         */
        public isPlaying:boolean = false;

        /**
         * @private
         * 动画持续时间,单位毫秒，默认值500
         */
        public duration:number = 500;

        /**
         * @private
         * 动画到当前时间对应的值。
         */
        public currentValue:number = 0;

        /**
         * @private
         * 起始值
         */
        public from:number = 0;
        /**
         * @private
         * 终点值。
         */
        public to:number = 0;

        /**
         * @private
         * 动画启动时刻
         */
        private startTime:number = 0;
        /**
         * @private
         * 动画播放结束时的回调函数
         */
        public endFunction:(animation:Animation) => void = null;

        /**
         * @private
         * 动画更新时的回调函数
         */
        public updateFunction:Function;

        /**
         * @private
         * 开始正向播放动画,无论何时调用都重新从零时刻开始，若设置了延迟会首先进行等待。
         */
        public play():void {
            this.stop();
            this.start();
        }

        /**
         * @private
         * 开始播放动画
         */
        private start():void {
            this.isPlaying = false;
            this.currentValue = 0;
            this.startTime = egret.getTimer();
            this.doInterval(this.startTime);
            egret.startTick(this.doInterval,this);
        }

        /**
         * @private
         * 停止播放动画
         */
        public stop():void {
            this.isPlaying = false;
            this.startTime = 0;
            egret.stopTick(this.doInterval,this);
        }

        public dispose(){
            this.updateFunction = null;
            this.endFunction = null;
            this.thisObject = null;
        }

        /**
         * @private
         * 计算当前值并返回动画是否结束
         */
        private doInterval(currentTime:number):boolean {
            let runningTime = currentTime - this.startTime;
            if (!this.isPlaying) {
                this.isPlaying = true;
            }
            let duration = this.duration;
            let fraction = duration == 0 ? 1 : Math.min(runningTime, duration) / duration;
            if (this.easerFunction){
                fraction = this.easerFunction(fraction);
            }
            this.currentValue = this.from + (this.to - this.from) * fraction;
            if (this.updateFunction)
                this.updateFunction.call(this.thisObject, this);
            let isEnded = runningTime >= duration;
            if (isEnded) {
                this.stop();
            }
            if (isEnded && this.endFunction) {
                this.endFunction.call(this.thisObject, this);
            }
            return true;
        }

    }
}