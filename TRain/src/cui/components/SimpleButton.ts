/**
 * Created by wjdeng on 2015/10/23.
 */

module cui
{
    export class SimpleButton extends Component
    {
        public trigTm:number;//长按触发事件间隔

        protected _cb:{fun:(ctrl:SimpleButton)=>void, tar:any};

        protected _touchCaptured:boolean;
        protected _sound:string;

        protected _tmTag:number;
        protected _longTriged:boolean;

        public constructor()
        {
            super();
            let self = this;
            self.trigTm = 0;
            self.touchChildren = false;
            self._touchCaptured = false;

            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            //self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self); //没有TOUCH_BEGIN 也可以收到TOUCH_END
        }

        public dispose()
        {
            let self = this;
            self.clearTouchTm();
            self.onTouchFinish();
            self._cb = null;
            super.dispose();
        }

        public setTarget(fun:(ctrl:SimpleButton)=>void, tar:any):void
        {
            this._cb = {fun:fun, tar:tar};
        }

        public $hitTest(stageX:number, stageY:number):egret.DisplayObject
        {
            let self = this;
            if (!self.touchEnabled || !self.visible ) return null;

            let point = self.globalToLocal(stageX, stageY, egret.$TempPoint);
            let bounds = egret.$TempRectangle.setTo(0, 0, self.width, self.height);

            if (!bounds.contains(point.x, point.y)) return null;

            //子控件 不处理事件
            return self;
        }

        protected _tempStage:egret.Stage;
        protected onTouchBegin(event:egret.TouchEvent):void
        {
            let self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);

            let stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self._tempStage = stage;

            self._touchCaptured = true;
            self.invalidateProps( PropertyType.state );
            event.updateAfterEvent();

            if( self.trigTm>0 ){
                if( DEBUG ){
                    if( self._tmTag ){
                        egret.warn( "warning   frame event not cancel" );
                    }
                }
                self._tmTag = TRain.core.addFrameDo( self.longTigger, self, false, self.trigTm );
                self._longTriged = false;
            }
        }

        private onTouchEnd( event:egret.Event ):void
        {
            let self = this;

            self.onTouchFinish();

            //此事件 以被别的控件处理了
            if( event.isDefaultPrevented() ) return;

            event.preventDefault();
            if( !self._longTriged ){
                self.buttonReleased();
            }
        }

        protected onTouchFinish():void
        {
            let self = this;
            self.clearTouchTm(); 
            
            let stage = self._tempStage;
            if( stage )
            {
				self._tempStage = null;
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);

                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);

                self._touchCaptured = false;
                self.invalidateProps( PropertyType.state );
            }
        }


        //-------------------- long touch tigger
        protected longTigger(){
            let self = this;
            self._longTriged = true;
            if( self._touchCaptured ){
                self.buttonReleased();
            }
            else{
               self.clearTouchTm(); 
            }
        }

        protected clearTouchTm(){
            let tmTag = this._tmTag;
            if( tmTag ){
                this._tmTag = 0;
                TRain.core.rmvFrameDoById( tmTag );
            }
        }

        protected getState():string
        {
            let self = this;
            if (!self.enabled)
                return "disabled";

            if ( self._touchCaptured )
                return "down";

            return "up";
        }

        public get sound():string
        {
            return this._sound;
        }
        public set sound(value:string)
        {
            this._sound = value;
        }

        protected buttonReleased():void
        {
            let self = this;
            let cbData = self._cb;
            if ( cbData ){
                cbData.fun.call( cbData.tar, self );
            }
            if(self.enabled)
            {
                let sound = self._sound;
                if(sound) TRain.soundMgr.playSFX(sound);
            }
        }
    }
}