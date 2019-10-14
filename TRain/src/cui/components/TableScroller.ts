/**
 * Created by wjdeng on 2015/12/18.
 */

module cui
{
    const enum TableScrollerKeys
    {
        scrollPolicyV,
        scrollPolicyH,
        hCanScroll,
        vCanScroll,
        touchStartPosition,
        touchLastPosition,
        touchMoved,
        touchScrollH,
        touchScrollV,
        viewport
    }

    export class TableScroller extends Group
    {
        public static scrollThreshold:number = 5;

        public activeInView:boolean = false;//显示时 触发激活
        public canOutBound:boolean = true; //是否能拖动 超出边界
        public repeatClk:boolean = false;//是否可重复点击

        protected $TableScroller:any[];

        protected _cb:{fun:(tar:any)=>void, tar:any};
        protected _lastActiveIdx:number;

        protected _showInfo:any;

        constructor()
        {
            super();

            let self = this;
            self.$TableScroller = [
                "auto",//verticalScrollPolicy,
                "auto",//horizontalScrollPolicy,
                false,//hCanScroll,
                false,//vCanScroll,
                {x:0, y:0},//touchStartPosition,
                {x:0, y:0},//touchLastPosition,
                false,//touchMoved,
                null,//touchScrollH,
                null,//touchScrollV,
                null,//viewport
            ];

            self._lastActiveIdx = -1;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
        }

        public get scrollPolicyV():string
        {
            return this.$TableScroller[TableScrollerKeys.scrollPolicyV];
        }

        public set scrollPolicyV(value:string)
        {
            let values = this.$TableScroller;
            if (values[TableScrollerKeys.scrollPolicyV] == value) {
                return;
            }
            values[TableScrollerKeys.scrollPolicyV] = value;
            //this.checkScrollPolicy();
        }

        public get scrollPolicyH():string
        {
            return this.$TableScroller[TableScrollerKeys.scrollPolicyH];
        }

        public set scrollPolicyH(value:string)
        {
            let values = this.$TableScroller;
            if (values[TableScrollerKeys.scrollPolicyH] == value) {
                return;
            }
            values[TableScrollerKeys.scrollPolicyH] = value;
            //this.checkScrollPolicy();
        }

        public get viewport():IViewport
        {
            return this.$TableScroller[TableScrollerKeys.viewport];
        }

        public set viewport(value:IViewport)
        {
            let self = this;
            let values = self.$TableScroller;
            if ( value == values[TableScrollerKeys.viewport])
                return;

            let viewport = values[TableScrollerKeys.viewport];
            if( viewport )
            {
                self.uninstallViewport();
            }

            if( value )
            {
                self.installViewport(value);
            }
        }

        //--------------------------------------------------------------------------------
        public dispose():void
        {
            let self = this;
            self._cb = null;
            self.clearEvent();
            TRain.actionMgr.rmvActsByTar( self );
            super.dispose();
        }


        private installViewport( viewport:IViewport ):void
        {
            let self = this;
            viewport.scrollEnabled = true;
            self.$TableScroller[TableScrollerKeys.viewport] = viewport;
            self.addChild( viewport );

            viewport.addEventListener( UI_EVENT.VIEW_CLEAR, self.onViewClear, self );
        }

        private uninstallViewport():void
        {
            let self = this;
            self._showInfo = null;
            let values = self.$TableScroller;
            let viewport = values[TableScrollerKeys.viewport];
            let hAction:TRain.Action = values[TableScrollerKeys.touchScrollH];
            if( hAction )
            {
                TRain.actionMgr.rmvAction( hAction );
            }
            let vAction:TRain.Action = values[TableScrollerKeys.touchScrollV];
            if( vAction )
            {
                TRain.actionMgr.rmvAction( vAction );
            }

            viewport.scrollEnabled = false;
            values[TableScrollerKeys.viewport] = null;
            self.removeChild( viewport );
        }

        private onViewClear():void
        {
            let values = this.$TableScroller;
            let action = values[TableScrollerKeys.touchScrollH];
            if ( action ) action.stop();

            action = values[TableScrollerKeys.touchScrollV];
            if ( action ) action.stop();
        }

        //-----------------------------------------------------------
        public showTableInViewStart( idx:number, ani:boolean ):void
        {
            let self = this;
            self._showInfo = { idx:idx, ani:ani };
            self.invalidateDL();
        }

        private _showTable( idx:number, ani:boolean ):void
        {
            let self = this;
            if( !self.checkScrollPolicy() ) return;

            let viewport = self.viewport;
            let needAdjust:boolean = false;
            let itemRect = viewport.getElementRect( idx );
            if( !itemRect ) return;

            let hCanScroll = self.$TableScroller[TableScrollerKeys.hCanScroll];
            let duration:number;
            let toPos:number;
            let startPos:number;
            if( hCanScroll )
            {
                toPos = itemRect.x;
                startPos = viewport.scrollH;
                let width = viewport.width;
                if( toPos<startPos || (toPos+itemRect.w)>(startPos+width) )
                {//不在显示范围
                    let contentWidth = viewport.contentWidth;
                    if( contentWidth>width && toPos+width>contentWidth )
                    {
                        toPos = contentWidth-width;
                    }

                    if( ani )
                    {
                        duration = self.getAnimationDuration( 0.5, startPos, toPos );
                        self.setScrollLeft( toPos, duration );
                    }
                    else
                    {
                        viewport.scrollH = toPos;
                    }
                }
            }
            else
            {
                toPos = itemRect.y;
                startPos = viewport.scrollV;
                let height = viewport.height;
                if( toPos<startPos || (toPos+itemRect.h)>(startPos+height) )
                {//不在显示范围
                    let contentHeight = viewport.contentHeight;
                    if ( contentHeight>height && (toPos+height) > contentHeight)
                    {
                        toPos = contentHeight - height;
                    }

                    if (ani)
                    {
                        duration = self.getAnimationDuration(0.5, startPos, toPos);
                        self.setScrollTop(toPos, duration);
                    }
                    else
                    {
                        viewport.scrollV = toPos;
                    }
                }
            }

            if( self.activeInView )
            {
                self.activate( idx );
            }
        }


        //------------------------------------------------------------
        protected activate( tableIdx:number ):boolean
        {
            let self = this;
            let cbData = self._cb
            if( (!self.repeatClk && self._lastActiveIdx==tableIdx) || !cbData )
            {
                return false;
            }
            self._lastActiveIdx = tableIdx;
            cbData.fun.call(cbData.tar, tableIdx);
            return true;
        }

        public setTarget(fun:(tar:any)=>void, tar:any):void
        {
            this._cb = {fun:fun, tar:tar};
        }

        //-------------------------------------------------------------
        protected checkScrollPolicy():boolean
        {
            let self = this;
            let viewport:IViewport = self.viewport;
            if(!viewport)
            {
                return false;
            }

            let values = self.$TableScroller;
            let hCanScroll:boolean = false;
            switch (values[TableScrollerKeys.scrollPolicyH])
            {
                case "auto":
                    hCanScroll = viewport.contentWidth > viewport.width;
                    break;
                case "on":
                    hCanScroll = true;
                    break;
            }
            values[TableScrollerKeys.hCanScroll] = hCanScroll;

            let vCanScroll:boolean = false;
            if( !hCanScroll ) //只能一个方向移动
            {
                switch (values[TableScrollerKeys.scrollPolicyV]) {
                    case "auto":
                        vCanScroll = viewport.contentHeight > viewport.height;
                        break;
                    case "on":
                        vCanScroll = true;
                        break;
                }
                values[TableScrollerKeys.vCanScroll] = vCanScroll;
            }

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

            let stageX:number = event.$stageX;
            let stageY:number = event.$stageY;
            let statPos:IPointData = self.$TableScroller[TableScrollerKeys.touchStartPosition];
            statPos.x = stageX;
            statPos.y = stageY;

            let stage:egret.Stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self._tempStage = stage;

            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);//优先监听
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true);//优先监听

            let lastPos = self.$TableScroller[TableScrollerKeys.touchLastPosition];
            lastPos.x = stageX;
            lastPos.y = stageY;
        }

        protected onTouchMove(event:egret.TouchEvent):void
        {
            let self = this;
            event.stopPropagation();

            let viewport = self.viewport;
            let localPos:egret.Point = viewport.globalToLocal( event.$stageX, event.$stageY, egret.$TempPoint );
            localPos.x -= viewport.scrollH;
            localPos.y -= viewport.scrollV;
            if (localPos.x<0 || localPos.y<0 || localPos.x>viewport.width || localPos.y>viewport.height )
            {
                return;
            }
            let stageX:number = event.$stageX;
            let stageY:number = event.$stageY;

            let values = self.$TableScroller;
            if( !self.canOutBound )
            {
                let lastPos:IPointData;
                let offset:number;
                if( values[TableScrollerKeys.hCanScroll] )
                {
                    lastPos = self.$TableScroller[TableScrollerKeys.touchLastPosition];
                    offset = event.$stageX - lastPos.x;
                    if( offset>=0 && viewport.scrollH<=0 ) return;

                    if( offset<=0 )
                    {
                        let maxLeft:number = viewport.contentWidth - viewport.width;
                        if( viewport.scrollH>=maxLeft ) return;
                    }
                }
                else if( values[TableScrollerKeys.vCanScroll] )
                {
                    offset = event.$stageY - lastPos.y;
                    if( offset>=0 && viewport.scrollV<=0 ) return;

                    if( offset<=0 )
                    {
                        let maxTop:number = viewport.contentHeight - viewport.height;
                        if( viewport.scrollV>=maxTop )return;
                    }
                }
            }

            if (!values[TableScrollerKeys.touchMoved])
            {
                let startPos:IPointData = values[TableScrollerKeys.touchStartPosition];
                if (Math.abs(startPos.x - stageX) < TableScroller.scrollThreshold &&
                    Math.abs(startPos.y - stageY) < TableScroller.scrollThreshold)
                {
                    return;
                }

                values[TableScrollerKeys.touchMoved] = true;
                self.moveStart();
            }

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

            let touchMoved = self.$TableScroller[TableScrollerKeys.touchMoved];
            if( touchMoved )
            {
                event.preventDefault();
                self.onTouchFinish( event );
            }
        }

        protected onTouchEnd(event:egret.TouchEvent):void
        {
            let self = this;
            if (event.isDefaultPrevented())
            {
                self.onTouchFinish( event );
                return;
            }

            self.onTouchFinish( event );
            if ( self._cb )
            {
                event.preventDefault();

                let localPos:egret.Point = self.globalToLocal( event.$stageX, event.$stageY, egret.$TempPoint );
                let viewport = self.viewport;

                let clickIdx = -1;
                let tmp;
                if( self.$TableScroller[TableScrollerKeys.hCanScroll] )
                {
                    tmp = localPos.x + viewport.scrollH;
                    if( tmp>0 && tmp<viewport.contentWidth )
                    {
                        clickIdx = viewport.getElementIdxByPos( tmp, localPos.y );
                    }
                }
                else
                {
                    tmp = localPos.y + viewport.scrollV;
                    if( tmp>0 && tmp<viewport.contentHeight )
                    {
                        clickIdx = viewport.getElementIdxByPos( localPos.x, tmp );
                    }
                }

                if( clickIdx>=0 )
                {
                    if( self.activate( clickIdx ) )
                    {
                        event.preventDefault();
                    }
                }
            }
        }

        protected onTouchFinish(event:egret.TouchEvent):void
        {
            let self = this;
            self.clearEvent();

            let values = self.$TableScroller;
            if( values[TableScrollerKeys.touchMoved] )
            {
                self.moveEnd(event.stageX, event.stageY);
                values[TableScrollerKeys.touchMoved] = false
            }
        }

        private clearEvent()
        {
            let self = this;
            let stage = self._tempStage;
            if( stage )
            {
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);//优先监听
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true);//优先监听

                stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);

                self._tempStage = null;
            }
        }

        //--------------------------------------------------------------
        protected moveStart():void
        {

        }

        protected moveUpdate( stageX:number, stageY:number ):void
        {
            let self = this;
            let lastPos:IPointData = self.$TableScroller[TableScrollerKeys.touchLastPosition];
            let offset:IPointData = {x:stageX,y:stageY};
            self.getPointChange( offset, lastPos, offset );
            self.setScrollPosition(offset.y, offset.x, true);

            lastPos.x = stageX;
            lastPos.y = stageY;
        }

        protected getPointChange( from:IPointData, to:IPointData, ret?:IPointData ):IPointData
        {//最多只能向一个方向滚动
            let self = this;
            if( !ret )
            {
                ret = {x:0,y:0};
            }

            if( self.$TableScroller[TableScrollerKeys.hCanScroll] )
            {
                ret.x = to.x - from.x;
                ret.y = 0;
            }
            else if( self.$TableScroller[TableScrollerKeys.vCanScroll] )
            {
                ret.x = 0;
                ret.y = to.y - from.y;
            }
            return ret;
        }


        protected moveEnd( stageX:number, stageY:number ):void
        {
            let self = this;

            let viewport = self.viewport;
            let num = viewport.numElements;
            if( num <= 0 ) return;

            let hCanScroll = self.$TableScroller[TableScrollerKeys.hCanScroll];
            let toPos = 0;
            let toIdx = viewport.getElementIdxByPos(viewport.scrollH, viewport.scrollV);
            if( toIdx >= 0 )
            {
                let movDistance = 0;
                let itemSize = 0, contentSize=0, size=0;
                let statPos = self.$TableScroller[TableScrollerKeys.touchStartPosition];
                let itemRect = viewport.getElementRect( toIdx );
                if( hCanScroll )
                {
                    movDistance = statPos.x - stageX;
                    if( movDistance<=1 && movDistance>=-1 ) return;

                    contentSize = viewport.contentWidth;
                    size = viewport.width;
                    itemSize = itemRect.w;
                    toPos = itemRect.x;
                }
                else
                {
                    movDistance = statPos.y - stageY;
                    if( movDistance<=1 && movDistance>=-1 ) return;

                    contentSize = viewport.contentHeight;
                    size = viewport.height;
                    itemSize = itemRect.h;
                    toPos = itemRect.y;
                }

                if( contentSize > size )
                {
                    let changed = (Math.abs(movDistance)/itemSize) > 0.2;

                    if( toIdx<num-1 && (movDistance>0&&changed) || (movDistance<0&&!changed) )
                    {
                        toPos += itemSize;
                        toIdx++;
                    }

                    if( (toPos+size)>contentSize )
                    {
                        toPos = contentSize-size;
                    }
                }
                else
                {
                    toPos = 0;
                    toIdx = -1;
                }
            }

            if( hCanScroll )
            {
                self.setScrollLeft( toPos, self.getAnimationDuration( 0.5, viewport.scrollH, toPos ) );
            }
            else
            {
                self.setScrollTop( toPos, self.getAnimationDuration( 0.5, viewport.scrollV, toPos ) );
            }

            if( toIdx>=0 && self.activeInView )
            {
                self.activate( toIdx );
            }
        }

        protected setScrollPosition(top:number, left:number, isOffset:boolean = false):void
        {
            let viewport = this.viewport;
            if (isOffset )
            {
                if(top === 0 && left === 0) return;
            }
            else
            {
                if(viewport.scrollV === top && viewport.scrollH === left) return;
            }


            let oldTop = viewport.scrollV, oldLeft = viewport.scrollH;
            if (isOffset)
            {
                if( top != 0 )
                {
                    let maxTop:number = viewport.contentHeight - viewport.height;
                    if (oldTop <=0 ||oldTop >= maxTop)
                    {
                        top = top * 0.5;
                    }
                    viewport.scrollV = oldTop + top;
                }
                if( left != 0 )
                {
                    let maxLeft:number = viewport.contentWidth - viewport.width;
                    if (oldLeft <= 0 || oldLeft >= maxLeft)
                    {
                        left = left * 0.5;
                    }
                    viewport.scrollH = oldLeft + left;
                }
            }
            else
            {
                viewport.scrollV = top;
                viewport.scrollH = left;
            }
        }

        private setScrollTop(scrollTop:number, duration:number = 0):void
        {
            let self = this;
            let viewport = self.viewport;
            if( duration > 0 )
            {
                let vAction:TRain.ActionPropTween = self.$TableScroller[TableScrollerKeys.touchScrollV];
                if( !vAction )
                {
                    vAction = new TRain.ActionPropTween();
                    vAction.setEaseFun( EaseUtil.quartOut );
                    self.$TableScroller[TableScrollerKeys.touchScrollV] = vAction;
                }
                vAction.addProp( "scrollV", viewport.scrollV, scrollTop );
                vAction.duration = duration;
                TRain.actionMgr.addAction( vAction, viewport, false );
            }
            else
            {
                viewport.scrollV = scrollTop;
            }
        }

        private setScrollLeft(scrollLeft:number, duration:number = 0):void
        {
            let self = this;
            let viewport = self.viewport;
            if( duration > 0 )
            {
                let hAction:TRain.ActionPropTween = self.$TableScroller[TableScrollerKeys.touchScrollH];
                if( !hAction )
                {
                    hAction = new TRain.ActionPropTween();
                    hAction.setEaseFun( EaseUtil.quartOut );
                    self.$TableScroller[TableScrollerKeys.touchScrollH] = hAction;
                }
                hAction.addProp( "scrollH", viewport.scrollH, scrollLeft );
                hAction.duration = duration;
                TRain.actionMgr.addAction( hAction, viewport, false );
            }
            else
            {
                viewport.scrollH = scrollLeft;
            }
        }

        protected getAnimationDuration(pixelsPerMS:number, curPos:number, endPos:number):number
        {
            let distance:number =  Math.abs(endPos-curPos);
            if( distance <= 10 ) return 0;

            return distance/pixelsPerMS;
        }

        //-------------------------------------------------------------------
        public validateDL():void
        {
            let self = this;
            let showInfo = self._showInfo;
            if( showInfo )
            {
                self._showTable( showInfo.idx, showInfo.ani );
                self._showInfo = null;
            }
            super.validateDL();
        }
    }
}
