module cui
{
    /**
     * 缩放按钮
     *
     * 自动对显示对象进行放大缩小
     * 需要指定所有的宽高
     *
     * */

    export class ScaleButton extends Button
    {
        public skAniGp:Group;
    
        public scaleTime:number;//缩放时间
        public smallRatio:number;//缩小的比例
        public bigRatio:number;//放大的比例

        private _action:TRain.Action;

        constructor()
        {
            super();
            let self = this;
            self.scaleTime = 60;
            self.smallRatio = 0.85;
            self.bigRatio = 1.15;
        }

        protected onPartAdded():void
		{
            super.onPartAdded();
            
			let self = this;
            let skAniGp = self.skAniGp;
            skAniGp.x = Math.floor(self.width*0.5);
            skAniGp.y = Math.floor(self.height*0.5);
            skAniGp.anthorPerX = 0.5;
            skAniGp.anthorPerY = 0.5;
		}

        //------------------------事件
        protected onTouchBegin(event:egret.TouchEvent):void
        {
            super.onTouchBegin( event );
        
            this.scaleSmall();
        }

        protected onTouchFinish():void
        {
            let self = this;
            if( self._tempStage ) self.scaleBig(); 
               
            super.onTouchFinish();
        }

        protected scaleSmall():void
        {
            let self = this;
            let target = self.skAniGp;
            if( !target ) return;

            self.clearAction();
            //记录下之前的缩放
            let scaRatio = self.smallRatio;
            let action = new TRain.ActionPropTo( self.scaleTime, 1, {scaleX:scaRatio, scaleY:scaRatio} );
            self._action = action;
            TRain.actionMgr.addAction(action, target, false);
        }

        protected scaleBig():void
        {
            let self = this;
            let target = self.skAniGp;
            if( !target ) return;

            self.clearAction();
            //记录下之前的缩放
            let scaRatio = self.bigRatio;
            let scaTm = self.scaleTime;
            let act1 = new TRain.ActionPropTo( scaTm*2, 1, {scaleX:scaRatio, scaleY:scaRatio} );
            let act2 = new TRain.ActionPropTo( scaTm, 1, {scaleX:1, scaleY:1} );
            let sequence = self._action = new TRain.ActionSequence( [act1,act2] );
            TRain.actionMgr.addAction(sequence, target, false);
        }

        protected clearAction():void
        {
            let action = this._action;
            if(action)
            {
                TRain.actionMgr.rmvAction(action);
                this._action = null;
            }
        }

        public dispose():void
        {
            this.clearAction();
            super.dispose();
        }
    }

}
