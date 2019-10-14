/**
 * Created by wjdeng on 2016/5/3.
 */

module cui
{
    export class UITile extends DataItem
    {
        protected _data:any;//显示数据
        protected _cb:{fun:(tile:UITile)=>void, tar:any};

        constructor(){
            super();
        
            let self = this;
            self.tag = 0;
            self.ud = null;
        }
        
        public dispose():void
        {
            let self = this;
            self.onTouchFinish();
            self._cb = null;
            super.dispose();
        }

        public hasProp( key:string ):boolean{
            return false;
        }

        // public modProp(key:string, value:any):void
        // {
        //     super.modProp( key, value );

        //     let self = this;
        //     if( self.hasProp(key) ){
        //         self[key] = value;
        //     }
        // }

        public dataChanged():void
        {
            let self = this;
            let showData = self._data;
            self
            for( let key in showData ){
                if( self.hasProp(key) ){
                    self[key] = showData[key];
                }
            }
        }

//---------------------------------------事件-----------------------------------------------------
        public setTarget(fun:(tile:UITile)=>void, tar:any):void
        {
            let self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            self._cb = {fun:fun, tar:tar};
        }

        protected _tempStage:egret.Stage;
        protected onTouchBegin(event:egret.TouchEvent):void
        {
            let self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);

            let stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self._tempStage = stage;

            event.updateAfterEvent();
        }

        private onTouchEnd( event:egret.Event ):void
        {
            let self = this;

            self.onTouchFinish();

            //此事件 已被别的控件处理了
            if( event.isDefaultPrevented() ) return;

            event.preventDefault();
            self.clkReleased();
        }

        private onTouchFinish():void
        {
            let self = this;
            let stage = self._tempStage;
            if( stage )
            {
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
                self._tempStage = null;
            }
        }

        protected clkReleased():void
        {
            let cbData = this._cb;
            if ( cbData ){
                cbData.fun.call( cbData.tar, this );
            }
        }
    }
}