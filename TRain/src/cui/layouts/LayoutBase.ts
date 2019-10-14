/**
 * Created by wjdeng on 2016/4/1.
 */

module cui 
{
    export class LayoutBase
    {
        protected _target:Group;

        public paddingBottom:number;
        public paddingTop:number;
        public paddingRight:number;
        public paddingLeft:number;

        public itemH:number;
        public itemW:number;

        protected _startIdx:number;
        protected _endIdx:number;

        protected _inViewCalc:boolean;

        constructor()
        {
            let self = this;
            self._target = null;
            self.paddingBottom = 0;
            self.paddingTop = 0;
            self.paddingRight = 0;
            self.paddingLeft = 0;

            self.itemH = 0;
            self.itemW = 0;

            self._startIdx = -1;
            self._endIdx = -1;

        }

        public get target():Group
        {
            return this._target;
        }

        public set target(value:Group)
        {
            let self = this;
            if (self._target === value)
                return;

            self._target = value;
        }

        public getElementIdxByPos( x:number, y:number ):number
        {
            return -1;
        }

        //含item周围的间隔  确保 idx 有效
        public getElementRect( idx:number ):IRectData
        {
            return null;
        }

        public getElementSize( idx:number ):ISizeData
        {
            let self = this;
            if( self.isFixedSize() )
            {
                return {w:self.itemW,h:self.itemH};
            }

            let child = <ILayout>self.target.getElementAt(idx);
            return child? {w:child.width, h:child.height} : {w:0,h:0};
        }

        protected isFixedSize():boolean
        {
            return this.itemH>0 && this.itemW>0;
        }

        protected checkTargetValid( target:Group ):boolean
        {
            if ( !target || target.numElements <= 0 ) return false;

            let width = target.$getWidth();
            let height = target.$getHeight();
            if ( width <= 0 || height<= 0 ) return false;

            return true;
        }

        public scrollPositionChanged():void
        {
            let self = this;
            let target = self._target;
            if ( !self.checkTargetValid(target) )
            {
                self._startIdx = self._endIdx = -1;
                return;
            }

            let changed = self.adjustViewIndex( target );
            if (changed)
            {
                self._inViewCalc = true;
                self.target.invalidateDL();
            }
        }

        protected adjustViewIndex( target:Group ):boolean
        {
            return false;
        }

        public updateDL( unscaledWidth:number, unscaledHeight:number ):void
        {
            let self = this;
            let target = self._target;
            if ( !self.checkTargetValid(target) )
            {
                self._startIdx = self._endIdx = -1;
                return;
            }

            if (self._inViewCalc)
                self._inViewCalc = false;
            else
                self.adjustViewIndex( target );

            if (self._startIdx == -1 || self._endIdx == -1)
            {
                target.setContentSize(Math.ceil(self.paddingLeft + self.paddingRight), Math.ceil(self.paddingTop + self.paddingBottom));
                return;
            }

            target.setIndicesInView( self._startIdx, self._endIdx );

            if( self.isFixedSize() )
            {
                self.updateFixSizeDList( unscaledWidth, unscaledHeight );
            }
            else
            {
                self.updateRealDList( unscaledWidth, unscaledHeight );
            }
        }

        protected updateFixSizeDList( unscaledWidth:number, unscaledHeight:number ):void
        {
        }

        protected updateRealDList( unscaledWidth:number, unscaledHeight:number ):void
        {
        }
    }

}