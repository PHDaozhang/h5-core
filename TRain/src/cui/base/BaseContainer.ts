/**
 * Created by wjdeng on 2016/4/1.
 */

module cui
{
    export const enum BaseUIKeys
    {
        left,
        top,
        right,
        bottom,
        hCenter, //在父级容器中距竖直中心位置的距离。
        vCenter, //在父级容器中距竖直中心位置的距离。
        perWidth, //
        perHeight,
        needPLayout, //需要用到父窗口对齐
        openLayout,//开启Layout
        width,
        height,
        filterNm,
    }

    let disProp = egret.DisplayObject.prototype;
    disProp.$getOriginalBounds = function():egret.Rectangle {
        let self = this;
        let bounds = self.$getContentBounds();
        self.$measureChildBounds(bounds);

        if( self.filters ){
            let offset = self['$measureFiltersOffset'](false);
            bounds.x += offset.minX;
            bounds.y += offset.minY;
            bounds.width += -offset.minX + offset.maxX;
            bounds.height += -offset.minY + offset.maxY;
        }
        
        return bounds;
    }

    /**
         * @private
         * 显示对象添加到舞台
         */
    disProp.$onAddToStage = function (stage, nestLevel) {
            var self = this;
            self.$stage = stage;
            self.$nestLevel = nestLevel;
            self.$hasAddToStage = true;
            //egret.Sprite.$EVENT_ADD_TO_STAGE_LIST.push(self);
        };
        /**
         * @private
         * 显示对象从舞台移除
         */
    disProp.$onRemoveFromStage = function () {
            var self = this;
            self.$nestLevel = 0;
            self.$stage = null;
            self.$hasAddToStage = false;
            //egret.Sprite.$EVENT_REMOVE_FROM_STAGE_LIST.push(self);
        };

    export class BaseContainer extends egret.DisplayObjectContainer implements IBaseContainer
    {
        public tag:number;
        public ud:any;
        public hitCheckBound:boolean;//优先检测是否在区域内
        public touchThrough:boolean; //是否可以穿透

        public disposed:boolean;//是否已销毁

        protected _anthorPerX:number;
        protected _anthorPerY:number;

        protected _inited:boolean;
        protected _invalidProps:number;
        protected _invalidPropsFlag:boolean;
        protected _invalidDL:boolean;
        protected _invalidDLFlag:boolean

        protected $BC:any[];

        constructor()
        {
            super();

            let self = this;
            self.$BC = [
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    NaN,
                    false,
                    false,
                    NaN,//pLayout
                    NaN,
            ];

            self._invalidDL = false;
            self._invalidProps = 0;
            self.hitCheckBound = true;
          
            self.$touchEnabled = true;
        }

        public dispose():void
        {
            if( DEBUG )
            {
                if( this.disposed )
                {
                    egret.log( "this UIComponent already disposed" );
                }
            }

            let self = this;
            if(self.disposed) return;

            if( self.ud ) self.ud = null;

            self.disposed = true;
            
            let children = self.$children;
            for( let i=0, n=children.length; i<n; ++i){
                (<IBaseCtrl>children[i]).dispose();
            }
        }

        //-----------------------------------------------------------
        public $onAddToStage(stage, nestLevel):void
        {
            super.$onAddToStage( stage, nestLevel );

            let self = this;
            if ( !self._inited )
            {
                self._inited = true;
                self.childrenCreated();
            }
      
            if( self._invalidProps>0 )
            {
                self.validateProps();
            }
            if( self._invalidDL )
            {
                self.validateDL();
            }
        }

        //-----------------------------------------------------------
        protected childrenCreated():void
        {
        }

        //-------------------------------------------------------------
        /**
         * float
         */
        public get anthorPerX():number
        {
            return this._anthorPerX || 0;
        }
        /**
         * float
         */
        public set anthorPerX( val:number )
        {
            let self = this;
            self._anthorPerX = val;
            let width = self.$getWidth();
            if( width > 0 ){
                self.anchorOffsetX = Math.floor(width * val);
            }
        }
        /**
         * float
         */
        public get anthorPerY():number
        {
            return this._anthorPerY || 0;
        }
        /**
         * float
         */
        public set anthorPerY( val:number )
        {
            let self = this;
            self._anthorPerY = val;
            let height = self.$getHeight();
            if( height > 0 ){
                self.anchorOffsetY = Math.floor(height * val);
            }
        }

        public get width():number
        {
            return super.$getWidth();
        }
        $getExplicitWidth():number
        {
            return this.$BC[BaseUIKeys.width];
        }
        public set width(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.width] === value)
                return;

            values[BaseUIKeys.width] = value;
            this.$setWidth(value);
        }
        $setWidth(value:number):void
        {
            super.$setWidth( value );
            this.invalidateProps( PropertyType.size );
        }
        public get height():number
        {
            return super.$getHeight();
        }
        $getExplicitHeight():number
        {
            return this.$BC[BaseUIKeys.height];
        }
        public set height(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.height] === value)
                return;

            values[BaseUIKeys.height] = value;
            this.$setHeight(value);
        }
        $setHeight(value:number):void
        {
            super.$setHeight( value );
            this.invalidateProps( PropertyType.size );
        }

        public get filterNm():string{
            return this.$BC[BaseUIKeys.filterNm];
        }

        public set filterNm( nm:string ){
            this.$BC[BaseUIKeys.filterNm] = nm;
            this.filters = nm&&nm.length>0 ? uiMgr.getFilters(nm) : null;
        }

        //-----------------------------------------------------------------------
        $childAdded(child:egret.DisplayObject, index:number):void
        {
            let self = this;
            if( (<ILayout>child).needPLayout )
            {
                self.openLayout();
            }

            if( self.isOpenLayout ){
                if( !self.needPLayout || self.$stage ){
                    self.validateChildDL( <IBaseCtrl>child );
                }
                else if( self._inited ){
                    self.invalidateDL();
                }
            }
        }

        $childRemoved(child:egret.DisplayObject, index:number):void
        {
            let self = this;
            if( self.isOpenLayout ){
                self.invalidateDL();
            }
        }

        public getChildAt(index:number):egret.DisplayObject
        {
            let children = this.$children;
            if (index >= 0 && index < children.length)
            {
                return children[index];
            }
            return null;
        }

        public addChild(child:egret.DisplayObject):egret.DisplayObject
        {
            let self = this;
            let index:number = self.$children.length;
            if (child.$parent == self)
                index--;
            return self.$doAddChild(child, index, false);
        }

        public addChildAt(child:egret.DisplayObject, index:number):egret.DisplayObject
        {
            let num = this.$children.length;
            if (index < 0 || index >= num)
            {
                index = num;
                if (child.$parent == this) {
                    index--;
                }
            }
            return this.$doAddChild(child, index, false);
        }

        public removeChild(child:egret.DisplayObject):egret.DisplayObject
        {
            let self = this;
            let index = self.$children.indexOf(child);
            if( DEBUG )
            {
                if( index < 0 )
                {
                    egret.$error(1006);
                    return child;
                }
            }

            child = self.$doRemoveChild(index, false);
            self.dispatchEventWith( UI_EVENT.RMV_CHILD, false );
            return child;
        }

        public removeChildAt(index:number):egret.DisplayObject
        {
            let self = this;
            if (index >= 0 && index < self.$children.length)
            {
                let child = self.$doRemoveChild(index, false);
                self.dispatchEventWith( UI_EVENT.RMV_CHILD, false );
                return child;
            }
            return null;
        }

        //----------------------------------
        public get left():number
        {
            return this.$BC[BaseUIKeys.left];
        }

        public set left(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.left] === value)
                return;
            values[BaseUIKeys.left] = value;
            this.setNeedPLayout();
        }
        /**
         * 距父级容器右边距离
         */
        public get right():number
        {
            return this.$BC[BaseUIKeys.right];
        }

        public set right(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.right] === value)
                return;
            values[BaseUIKeys.right] = value;
            this.setNeedPLayout();
        }

        public get top():number
        {
            return this.$BC[BaseUIKeys.top];
        }

        public set top(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.top] === value)
                return;
            values[BaseUIKeys.top] = value;
            this.setNeedPLayout();
        }
        /**
         * 距父级容器底部距离
         */
        public get bottom():number
        {
            return this.$BC[BaseUIKeys.bottom];
        }

        public set bottom(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.bottom] == value)
                return;
            values[BaseUIKeys.bottom] = value;
            this.setNeedPLayout();
        }

        /**
         * 在父级容器中距水平中心位置的距离
         */
        public get hCenter():number
        {
            return this.$BC[BaseUIKeys.hCenter];
        }

        public set hCenter(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.hCenter] === value)
                return;
            values[BaseUIKeys.hCenter] = value;
            this.setNeedPLayout();
        }

        /**
         * 在父级容器中距竖直中心位置的距离
         */
        public get vCenter():number
        {
            return this.$BC[BaseUIKeys.vCenter];
        }

        public set vCenter(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.vCenter] === value)
                return;
            values[BaseUIKeys.vCenter] = value;
            this.setNeedPLayout();
        }

        public get perWidth():number
        {
            return this.$BC[BaseUIKeys.perWidth];
        }

        public set perWidth(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.perWidth] === value)
                return;

            values[BaseUIKeys.perWidth] = value;
            this.setNeedPLayout();
        }

        public get perHeight():number
        {
            return this.$BC[BaseUIKeys.perHeight];
        }

        public set perHeight(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.perHeight] === value)
                return;

            values[BaseUIKeys.perHeight] = value;
            this.setNeedPLayout();
        }

        public get needPLayout():boolean
        {
            return this.$BC[BaseUIKeys.needPLayout];
        }

        protected setNeedPLayout():void
        {
            let self = this;
            let values = self.$BC;
            if ( !values[BaseUIKeys.needPLayout] ){
                values[BaseUIKeys.needPLayout] = true;

                let parent = <BaseContainer>self.$parent;
                if( parent )
                {
                    parent.openLayout();
                }
            }

            if( self._inited ){
                self.invalidateDL();
            }
        }

        public get isOpenLayout():boolean
        {
            return this.$BC[BaseUIKeys.openLayout];
        }
        public openLayout():void
        {
            this.$BC[BaseUIKeys.openLayout] = true;
        }
        //-----------------------------------------------------------------
        //public getLayoutBounds(bounds:egret.Rectangle):void
        //{
        //    let self = this;
        //    let w = self.$getWidth();
        //    let h = self.$getHeight();
        //
        //    self.applyMatrix(bounds, w, h);
        //}
        //
        //public setLayoutPos(x:number, y:number):void
        //{
        //    let self = this;
        //    let matrix = self.$getMatrix();
        //    if (!self.isDeltaIdentity(matrix))
        //    {
        //        let bounds = egret.$TempRectangle;
        //        self.getLayoutBounds(bounds);
        //        x += self.$getX() - bounds.x;
        //        y += self.$getY() - bounds.y;
        //    }
        //    super.$setX(x);
        //    super.$setY(y);
        //}

        //------------------------- property -------------------------------
        public get nestLevel():number
        {
            return this.$nestLevel;
        }

        public getPreferredBounds(bounds:egret.Rectangle):void
        {
            let self = this;
            let w = self.$getWidth();
            let h = self.$getHeight();
            self.applyMatrix(bounds, w, h);
        }

        protected applyMatrix(bounds:egret.Rectangle, w:number, h:number):void
        {
            let self = this;
            bounds.setTo(0, 0, w, h);
            let matrix = self.$getMatrix();
            if ( self.isDeltaIdentity(matrix)) {
                bounds.x += matrix.tx;
                bounds.y += matrix.ty;
            }
            else {
                matrix.$transformBounds(bounds);
            }
        }

        protected isDeltaIdentity(m:egret.Matrix):boolean
        {
            return (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1);
        }

        //-----------------------------------------------------------------------------------------
        protected invalidateProps( tp:PropertyType ):void
        {
            let self = this;
            if( tp==PropertyType.size ){
                let tmpVal = self._anthorPerX;
                if( tmpVal != undefined ){
                    self.anchorOffsetX = Math.floor(self.$getWidth() * tmpVal);
                }

                tmpVal = self._anthorPerY;
                if( tmpVal != undefined ){
                    self.anchorOffsetY = Math.floor(self.$getHeight() * tmpVal);
                }
            }

            if( self.$stage && !self._invalidPropsFlag )
            {
                self._invalidPropsFlag = true;
                uiMgr.invalidateProperty( self );
            }
            self._invalidProps |= tp;
        }

        public validateProps():void
        {
            let self = this;
            if( self._invalidProps != 0 )
            {
                self.commitProps();
            }
        }

        protected commitProps():void
        {
            let self = this;

            let invalidateProps = self._invalidProps;
            if( (invalidateProps&PropertyType.size)==PropertyType.size ||
                (invalidateProps&PropertyType.position)==PropertyType.position )
            {
                self.invalidateDL();
            }
            self._invalidProps = 0;
            self._invalidPropsFlag = false;
        }

        //--------------------------------------------
        public invalidateDL():void
        {
            let self = this;
            if( self.$stage && !self._invalidDLFlag )
            {
                self._invalidDLFlag = true;

                if( self.needPLayout ){
                    let parent = <BaseContainer>self.$parent;
                    if( parent )
                    {
                        parent.invalidateDL();
                    }
                }
                // else{
                //     if( self.isOpenLayout ){
                        uiMgr.invalidateDL( self );
                    //}
                //}
            }
            self._invalidDL = true;
        }

        public validateDL():void
        {
            let self = this;
            self._invalidDL = false;
            self._invalidDLFlag = false;
            if( self.isOpenLayout )
            {
                self.updateDL();
            }
        }

        public validateChildDL( child:IBaseCtrl ):void
        {
            let self = this;
            if( self.isOpenLayout ){
                let unscaledWidth = self.$getWidth();
                if( unscaledWidth == 0 ) return;

                let unscaledHeight = self.$getHeight(); 
                if( unscaledHeight == 0 ) return;

                self.adjChildDL( child, unscaledWidth, unscaledHeight );
            }
        }

        protected updateDL():void
        {
            let self = this;
            let unscaledWidth = self.$getWidth();
            if( unscaledWidth == 0 ) return;

            let unscaledHeight = self.$getHeight(); 
            if( unscaledHeight == 0 ) return;

            let chilren = self.$children;
            for (let i = 0, len=chilren.length; i < len; i++)
            {
                let child = <IBaseCtrl>chilren[i];
                if( !child.needPLayout ) continue;

                self.adjChildDL( child, unscaledWidth, unscaledHeight );
            }
        }

        private adjChildDL( layoutElement:IBaseCtrl, unscaledWidth:number, unscaledHeight:number ){
            let left = layoutElement.left;
            let right = layoutElement.right;
            let perWidth = layoutElement.perWidth;

            let childWidth = NaN;
            if (!isNaN(left) && !isNaN(right))
            {
                childWidth = unscaledWidth - right - left;
            }
            else if (!isNaN(perWidth))
            {
                childWidth = Math.round(unscaledWidth * perWidth * 0.01);
            }

            if( isNaN(childWidth) )
            {
                childWidth = layoutElement.$getWidth();
            }
            else
            {
                layoutElement.width = childWidth;
            }

            let childHeight = NaN;
            let top = layoutElement.top;
            let bottom = layoutElement.bottom;
            let perHeight = layoutElement.perHeight;
            if (!isNaN(top) && !isNaN(bottom))
            {
                childHeight = unscaledHeight - bottom - top;
            }
            else if (!isNaN(perHeight))
            {
                childHeight = Math.round(unscaledHeight * perHeight * 0.01);
            }

            if( isNaN(childHeight) )
            {
                childHeight = layoutElement.$getHeight();
            }
            else
            {
                layoutElement.height = childHeight;
            }

            let childX = NaN;
            let childY = NaN;

            let hCenter = layoutElement.hCenter;
            let vCenter = layoutElement.vCenter;
            if (!isNaN(hCenter))
                childX = Math.round((unscaledWidth - childWidth) / 2 + hCenter);
            else if (!isNaN(left))
                childX = left;
            else if (!isNaN(right))
                childX = unscaledWidth - childWidth - right;

            if (!isNaN(vCenter))
                childY = Math.round((unscaledHeight - childHeight) / 2 + vCenter);
            else if (!isNaN(top))
                childY = top;
            else if (!isNaN(bottom))
                childY = unscaledHeight - childHeight - bottom;

            if( !isNaN(childX) ) {
                layoutElement.x = childX + layoutElement.anchorOffsetX;
            }
            if( !isNaN(childY) ) {
                layoutElement.y = childY + layoutElement.anchorOffsetY;
            }

            // if( (layoutElement as IBaseContainer).isOpenLayout ){
            //     (layoutElement as IBaseContainer).validateDL();
            // }
            //layoutElement.setLayoutPos( childX, childY );
        }

        //-----------------------------------------------------------------
        public $hitTest(stageX:number, stageY:number):egret.DisplayObject
        {
            let self = this;
            if (!self.touchEnabled || !self.visible ) return null;

            if( self.hitCheckBound )
            {
                let point = self.globalToLocal(stageX, stageY, egret.$TempPoint);
                let bounds = egret.$TempRectangle.setTo(0, 0, self.$getWidth(), self.$getHeight());
                let scrollRect = self.$scrollRect;
                if(scrollRect)
                {
                    bounds.x = scrollRect.x;
                    bounds.y = scrollRect.y;
                }

                if ( !bounds.contains(point.x, point.y) ) return null;
            }

            let ret = super.$hitTest( stageX, stageY );
            if( !ret && !self.touchThrough ) ret = self;

            return ret;
        }

        //优化 不测量 皮肤制定大小 如有需要具体控件重载修改
        public $measureChildBounds(): void {

        }

        public $measureContentBounds(bounds: egret.Rectangle): void {
            var val = this.$BC[10 /* width */];
            if (val)
                bounds.width = val;
            val = this.$BC[11 /* height */];
            if (val)
                bounds.height = val;
        }
        ;
    }
}