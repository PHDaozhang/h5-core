/**
 * Created by wjdeng on 2016/1/22.
 */

module cui
{
    /**
     * @private
     */
    const enum ScrollKeys
    {
        scrollPolicyV,
        scrollPolicyH,
        hCanScroll,
        vCanScroll,
        touchStartPosition,
        touchMoved,
        touchScrollH,
        touchScrollV,
        throwSpeed,
        viewport,
        scrollTo
    }

    export class Scroller extends Group
    {

        public static scrollThreshold:number = 5;

        //-----------------------------------------------------------

        protected $Scroller:any[];

        protected _lastActive:egret.DisplayObject;

        protected _bounces:boolean = true;

        protected _hAnimation:Animation;
        protected _vAnimation:Animation;

        public constructor()
        {
            super();

            let self = this;
            self.$Scroller = [
                "auto",//verticalScrollPolicy,
                "auto",//horizontalScrollPolicy,
                false,//hCanScroll,
                false,//vCanScroll,
                {x:0, y:0},//touchStartPosition,
                false,//touchMoved,
                null,//touchScrollH,
                null,//touchScrollV,
                1.0,//throwSpeed
                null,//viewport
                null
            ];

            self._bounces = true;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
        }

        public dispose():void
        {
            let self = this;
            self.clearEvent();

            let values = self.$Scroller;
            values[ScrollKeys.viewport] = null;
            let touchScroll = values[ScrollKeys.touchScrollH];
            if ( touchScroll )
            {
                touchScroll.dispose();
                values[ScrollKeys.touchScrollH] = null;
            }
            touchScroll = values[ScrollKeys.touchScrollV];
            if ( touchScroll )
            {
                touchScroll.dispose();
                values[ScrollKeys.touchScrollV] = null;
            }

            let ani = self._hAnimation;
            if( ani )
            {
                ani.stop();
                ani.updateFunction = null;
            }
            ani = self._vAnimation;
            if( ani )
            {
                ani.stop();
                ani.updateFunction = null;
            }

            super.dispose();
        }

        public get bounces(): boolean
        {
            return this._bounces;
        }

        public set bounces(value: boolean)
        {
            let self = this;
            this._bounces = value;
            let touchScrollH = self.$Scroller[ScrollKeys.touchScrollH];
            if(touchScrollH)
            {
                touchScrollH.$bounces = value;
            }
            let touchScrollV = self.$Scroller[ScrollKeys.touchScrollV];
            if(touchScrollV)
            {
                touchScrollV.$bounces = value;
            }
        }


        public get scrollPolicyV():string
        {
            return this.$Scroller[ScrollKeys.scrollPolicyV];
        }

        public set scrollPolicyV(value:string)
        {
            let self = this;
            let values = self.$Scroller;
            if (values[ScrollKeys.scrollPolicyV] == value) {
                return;
            }
            values[ScrollKeys.scrollPolicyV] = value;
            self.checkScrollPolicy();
        }

        public get scrollPolicyH():string
        {
            return this.$Scroller[ScrollKeys.scrollPolicyH];
        }

        public set scrollPolicyH(value:string)
        {
            let self = this;
            let values = self.$Scroller;
            if (values[ScrollKeys.scrollPolicyH] == value) {
                return;
            }
            values[ScrollKeys.scrollPolicyH] = value;
            self.checkScrollPolicy();
        }


        public set throwSpeed(val:number)
        {
            val = +val;
            val = val<0.01?0.01:val;

            let self = this;
            this.$Scroller[ScrollKeys.throwSpeed] = val;

            let touchScroll = self.$Scroller[ScrollKeys.touchScrollH];
            if(touchScroll)
            {
                touchScroll.$scrollFactor = val;
            }
            touchScroll = self.$Scroller[ScrollKeys.touchScrollV];
            if(touchScroll)
            {
                touchScroll.$scrollFactor = val;
            }
        }

        public get throwSpeed():number
        {
            let touchScroll = this.$Scroller[ScrollKeys.touchScrollH];
            if(touchScroll)
            {
                return touchScroll.$scrollFactor;
            }
            return 0;
        }

        //---------------------------------------------------
        public setScrollTop( scrollTop:number, duration?:number ):void
        {
            let values = this.$Scroller
            if( !values[ScrollKeys.viewport] ) return;

            let scrollTo = values[ScrollKeys.scrollTo];
            if( !scrollTo )
            {
                scrollTo = {};
                values[ScrollKeys.scrollTo] = scrollTo;
            }

            scrollTo.top = {v:scrollTop, d:duration};

            this.invalidateDL();
        }

        public setScrollLeft(scrollLeft:number, duration?:number):void
        {
            let values = this.$Scroller
            if (!values[ScrollKeys.viewport]) return;

            let scrollTo = values[ScrollKeys.scrollTo];
            if( !scrollTo )
            {
                scrollTo = {};
                values[ScrollKeys.scrollTo] = scrollTo;
            }

            scrollTo.left = {v:scrollLeft, d:duration};

            this.invalidateDL();
        }

        protected doScrollTo():void
        {
            let self = this;
            let values = self.$Scroller;
            let scrollTo = values[ScrollKeys.scrollTo];
            if( !scrollTo ) return;

            values[ScrollKeys.scrollTo] = null;
            if( !self.checkScrollPolicy() ) return;

            let viewport = values[ScrollKeys.viewport];
            if( !viewport ) return;

            let topInfo = scrollTo.top;
            if( topInfo )
            {
                if ( values[ScrollKeys.vCanScroll] && viewport.contentHeight > viewport.height )
                {
                    let scrollTop = topInfo.v;
                    let maxPos = viewport.contentHeight - viewport.height;
                    if( scrollTop > maxPos ) scrollTop = maxPos;

                    if( viewport.scrollV != scrollTop )
                    {
                        let touchScroll = self.getTouchScrollV();
                        if( touchScroll.isStarted() ) return;

                        let animation = self._vAnimation;
                        if( !animation )
                        {
                            let updateFun = function( ani:Animation ){
                                self.verticalUpdateHandler( ani.currentValue );
                            };
                            animation = new Animation( updateFun, self );
                            self._vAnimation = animation;
                        }

                        animation.stop();

                        let duration = topInfo.d || 0;
                        if( duration > 0 )
                        {
                            animation.duration = duration;
                            animation.from = viewport.scrollV;
                            animation.to = scrollTop;
                            animation.play();
                        }
                        else
                        {
                            viewport.scrollV = scrollTop;
                        }
                    }
                }
            }

            let leftInfo = scrollTo.left;
            if( leftInfo )
            {
                if ( values[ScrollKeys.hCanScroll] && viewport.contentWidth > viewport.width )
                {
                    let scrollLeft = leftInfo.v;
                    let maxPos = viewport.contentWidth - viewport.width;
                    if( scrollLeft > maxPos ) scrollLeft = maxPos;

                    if( viewport.scrollH != scrollLeft )
                    {
                        let touchScroll = self.getTouchScrollH();
                        if( touchScroll.isStarted() ) return;

                        let animation = self._hAnimation;
                        if( !animation )
                        {
                            let updateFun = function( ani:Animation ){
                                self.horizontalUpdateHandler( ani.currentValue );
                            };
                            animation = new Animation( updateFun, self );
                            self._hAnimation = animation;
                        }

                        animation.stop();

                        let duration = leftInfo.d || 0;
                        if( duration > 0 )
                        {
                            animation.duration = duration;
                            animation.from = viewport.scrollH;
                            animation.to = scrollLeft;
                            animation.play();
                        }
                        else
                        {
                            viewport.scrollH = scrollLeft;
                        }
                    }
                }
            }
        }

        protected getTouchScrollV():TouchScroll
        {
            let values = this.$Scroller;
            let touchScroll = values[ScrollKeys.touchScrollV];
            if ( !touchScroll )
            {
                let self = this;
                touchScroll = new TouchScroll(self.verticalUpdateHandler, self.verticalEndHanlder, self);
                touchScroll.stop();
                values[ScrollKeys.touchScrollV] = touchScroll;
                touchScroll.$scrollFactor = values[ScrollKeys.throwSpeed];
            }
            return touchScroll;
        }

        protected getTouchScrollH():TouchScroll
        {
            let values = this.$Scroller;
            let touchScroll = values[ScrollKeys.touchScrollH];
            if ( !touchScroll )
            {
                let self = this;
                touchScroll = new TouchScroll(self.horizontalUpdateHandler, self.horizontalEndHandler, self);
                touchScroll.stop();
                values[ScrollKeys.touchScrollH] = touchScroll;
                touchScroll.$scrollFactor = values[ScrollKeys.throwSpeed];
            }
            return touchScroll;
        }

        //----------------------------------------------------
        public get viewport():IViewport
        {
            return this.$Scroller[ScrollKeys.viewport];
        }

        public set viewport(value:IViewport)
        {
            let self = this;
            let values = self.$Scroller;
            if ( value == values[ScrollKeys.viewport])
                return;

            let viewport = values[ScrollKeys.viewport];
            if( viewport )
            {
                self.uninstallViewport();
            }

            if( value )
            {
                self.installViewport(value);
            }
        }

        private installViewport( viewport:IViewport ):void
        {
            let self = this;
            viewport.scrollEnabled = true;
            self.$Scroller[ScrollKeys.viewport] = viewport;
            self.addChild( viewport );
            viewport.addEventListener( UI_EVENT.VIEW_CLEAR, self.onViewClear, self );
        }

        private uninstallViewport():void
        {
            let self = this;
            let values = self.$Scroller;

            let touchScroll:TouchScroll = values[ScrollKeys.touchScrollH];
            if( touchScroll )
            {
                touchScroll.stop();
            }
            touchScroll = values[ScrollKeys.touchScrollV];
            if( touchScroll )
            {
                touchScroll.stop();
            }

            let viewport = values[ScrollKeys.viewport];

            viewport.scrollEnabled = false;
            values[ScrollKeys.viewport] = null;
            self.removeChild( viewport );
        }

        private onViewClear():void
        {
            let self = this;
            let values = self.$Scroller;
            let touchScroll = values[ScrollKeys.touchScrollH];
            if ( touchScroll ) touchScroll.stop();

            touchScroll = values[ScrollKeys.touchScrollV];
            if ( touchScroll ) touchScroll.stop();

            let ani = self._hAnimation;
            if( ani )  ani.stop();

            ani = self._vAnimation;
            if( ani ) ani.stop();
        }

        //-------------------------------------------------------------------
        public validateDL():void
        {
            this.doScrollTo();

            super.validateDL();
        }

        //------------------------------------------------------------------
        private checkScrollPolicy():boolean
        {
            let values = this.$Scroller;
            let viewport:IViewport = values[ScrollKeys.viewport];
            if(!viewport)return false;

            let hCanScroll:boolean = false;

            switch (values[ScrollKeys.scrollPolicyH])
            {
                case "auto":
                    hCanScroll = viewport.contentWidth > viewport.width;
                    break;
                case "on":
                    hCanScroll = true;
                    break;
            }
            values[ScrollKeys.hCanScroll] = hCanScroll;

            let vCanScroll:boolean = false;
            switch (values[ScrollKeys.scrollPolicyV]) {
                case "auto":
                    vCanScroll = viewport.contentHeight > viewport.height;
                    break;
                case "on":
                    vCanScroll = true;
                    break;
            }
            values[ScrollKeys.vCanScroll] = vCanScroll;
            return hCanScroll || vCanScroll;
        }

        protected _tempStage:egret.Stage;
        protected onTouchBegin(event:egret.TouchEvent):void
        {
            let self = this;
            if (!self.checkScrollPolicy())
            {
                return;
            }

            let values = self.$Scroller;
            let touchScroll:TouchScroll = values[ScrollKeys.touchScrollH];
            if( touchScroll )
            {
                touchScroll.stop();
            }
            touchScroll = values[ScrollKeys.touchScrollV];
            if( touchScroll )
            {
                touchScroll.stop();
            }

            let stageX:number = event.$stageX;
            let stageY:number = event.$stageY;
            let statPos:IPointData = self.$Scroller[ScrollKeys.touchStartPosition];
            statPos.x = stageX;
            statPos.y = stageY;

            let stage:egret.Stage = self.$stage;
            self._tempStage = stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);


            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true);//优先监听
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
        }

        protected onTouchMove(event:egret.TouchEvent):void
        {
            event.stopImmediatePropagation();

            let self = this;
            let stageX:number = event.$stageX;
            let stageY:number = event.$stageY;

            let values = self.$Scroller;
            if (!values[ScrollKeys.touchMoved])
            {
                let startPos:IPointData = values[ScrollKeys.touchStartPosition];
                if (Math.abs(startPos.x - stageX) < Scroller.scrollThreshold &&
                    Math.abs(startPos.y - stageY) < Scroller.scrollThreshold)
                {
                    return;
                }

                values[ScrollKeys.touchMoved] = true;
                self.moveStart(startPos.x, startPos.y);
            }

            //if (values[ScrollKeys.delayTouchEvent])
            //{
            //    values[ScrollKeys.delayTouchEvent] = null;
            //    values[ScrollKeys.delayTouchTimer].stop();
            //}

            self.moveUpdate(stageX, stageY);
        }

        protected onTouchCaptureEnd(event:egret.TouchEvent):void
        {
            let self = this;
            if (event.isDefaultPrevented())
            {
                self.onTouchFinish( event );
                return;
            }

            let touchMoved = self.$Scroller[ScrollKeys.touchMoved];
            if( touchMoved )
            {
                event.preventDefault();
                self.onTouchFinish( event );
            }
        }

        protected onTouchFinish(event?:egret.TouchEvent):void
        {
            let self = this;
            self.clearEvent();

            let values = self.$Scroller;
            if( values[ScrollKeys.touchMoved] )
            {
                self.moveEnd(event.stageX, event.stageY);
                values[ScrollKeys.touchMoved] = false
            }
        }

        private clearEvent()
        {
            let self = this;
            let stage = self._tempStage;
            if( stage ){
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true);//优先监听
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);


                stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);

                self._tempStage = null;
            }
        }

        //--------------------------------------------------------------
        protected moveStart( stageX:number, stageY:number ):void
        {
            let self = this;

            let ani = self._hAnimation;
            if( ani ) ani.stop();
            ani = self._vAnimation;
            if( ani ) ani.stop();

            let values = self.$Scroller;

            let viewport = values[ScrollKeys.viewport];
            let uiValues = viewport.$UIComponent;
            let touchScroll:TouchScroll;
            if (values[ScrollKeys.hCanScroll])
            {
                touchScroll = self.getTouchScrollH();
                touchScroll.stop();
                touchScroll.start(stageX);
            }
            if (values[ScrollKeys.vCanScroll])
            {
                touchScroll = self.getTouchScrollV();
                touchScroll.stop();
                touchScroll.start(stageY);
            }
        }

        protected moveUpdate( stageX:number, stageY:number ):void
        {
            let self = this;
            let values = self.$Scroller;

            let viewport = values[ScrollKeys.viewport];

            let touchScroll:TouchScroll;
            if (values[ScrollKeys.hCanScroll])
            {
                touchScroll = self.getTouchScrollH();
                if( touchScroll.isStarted() )
                {
                    touchScroll.update(stageX, viewport.contentWidth - viewport.width, viewport.scrollH);
                }
            }
            if (values[ScrollKeys.vCanScroll])
            {
                touchScroll = self.getTouchScrollV();
                if( touchScroll.isStarted() )
                {
                    touchScroll.update(stageY, viewport.contentHeight - viewport.height, viewport.scrollV);
                }
            }
        }

        protected moveEnd( stageX:number, stageY:number ):void
        {
            let self = this;
            let values = self.$Scroller;

            let viewport = values[ScrollKeys.viewport];

            let touchScroll:TouchScroll;
            if (values[ScrollKeys.hCanScroll])
            {
                touchScroll = self.getTouchScrollH();
                if( touchScroll.isStarted() )
                {
                    touchScroll.finish( viewport.scrollH, viewport.contentWidth - viewport.width);
                }
            }

            if (values[ScrollKeys.vCanScroll])
            {
                touchScroll = self.getTouchScrollV();
                if( touchScroll.isStarted() )
                {
                    touchScroll.finish( viewport.scrollV, viewport.contentHeight - viewport.height);
                }
            }
        }

        private horizontalUpdateHandler(scrollPos:number):void
        {
            this.$Scroller[ScrollKeys.viewport].scrollH = scrollPos;
        }

        private verticalUpdateHandler(scrollPos:number):void
        {
            this.$Scroller[ScrollKeys.viewport].scrollV = scrollPos;
        }

        private horizontalEndHandler():void
        {
        }

        private verticalEndHanlder():void
        {
        }
    }
}
