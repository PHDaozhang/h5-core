//////////////////////////////////////////////////////////////////////////////////////

module cui
{
    export class LineLayout extends LayoutBase
    {
        public isHorizontal = true;

        public gap = 0;

        public horizontalAlign:string = "left";//横向居中对齐 "left" right
        public verticalAlign:string = "top"; //纵向居中对齐 top bottom

        public getElementRect( idx:number ):IRectData
        {
            let self = this;
            let target = self._target;
            let x = 0;
            let y = 0;
            let h = target.contentHeight;
            let w = target.contentWidth;
            let gap = self.gap;
            let item = target.getElementAt( idx );
            //如果没有显示， 则需要定位
            if( item.visible )
            {
                if( self.isHorizontal )
                {
                    x = item.x;
                    w = item.width + gap;
                }
                else
                {
                    y = item.y;
                    h = item.height + gap;
                }
            }
            else
            {
                let i=0;
                if( self.isHorizontal )
                {
                    x = self.paddingLeft;
                    w = item.width + gap;
                    for ( ; i < idx; i++ )
                    {
                        item = target.getElementAt(i);
                        x += (item.width+gap);
                    }
                }
                else
                {
                    y = self.paddingLeft;
                    h = item.height + gap;
                    for ( ; i < idx; i++ )
                    {
                        item = target.getElementAt(i);
                        y += (item.height+gap);
                    }
                }
            }

            return {x:x,y:y,w:w,h:h};
        }

        public getElementIdxByPos( x:number, y:number ):number
        {
            let self = this;
            let idx = -1;
            let gap = self.gap;
            let target = self._target;
            let count = target.numElements;
            if( self.isFixedSize() )
            {
                if( self.isHorizontal )
                {
                    idx = (x > self.paddingLeft) ? Math.floor((x-self.paddingLeft)/(self.itemW+gap)) : 0;
                }
                else
                {
                    idx = (y > self.paddingTop) ? Math.floor((y-self.paddingTop)/(self.itemH+gap)) : 0;
                }
            }
            else
            {
                let i = 0;
                let child;
                if( self.isHorizontal )
                {
                    for ( ; i < count; i++ )
                    {
                        child = <ILayout>target.getElementAt(i);
                        x -= (child.width+gap);
                        if( x <= 0 )
                        {
                            idx = i;
                            break;
                        }
                    }
                }
                else
                {
                    for ( ; i < count; i++ )
                    {
                        child = <ILayout>target.getElementAt(i);
                        y -= (child.height+gap);
                        if( y <= 0 )
                        {
                            idx = i;
                            break;
                        }
                    }
                }
            }
            if( idx >= count ) idx = count - 1;
            return idx;
        }

        protected adjustViewIndex( target:Group ):boolean
        {
            let self = this;

            let width = target.$getWidth();
            let height = target.$getHeight();
            if (self.isHorizontal)
            {
                return self.adjustViewIndexH( target, width, height );
            }

            return self.adjustViewIndexV( target, width, height );
        }

        protected adjustViewIndexH( target:Group, width:number, height:number ):boolean
        {
            let self = this;

            let startIdx = 0, endIdx = 0;
            let gap = self.gap;

            let minPos = target.scrollH;
            let maxPos = minPos + width - self.paddingRight;
            let startPos = self.paddingLeft, temp = 0;
            let child:egret.DisplayObject;

            let count = target.numChildren;
            if( self.isFixedSize() )
            {
                let itemSize = self.itemW + gap;
                if( minPos > startPos )
                {
                    startIdx = Math.floor((minPos-startPos)/itemSize);
                    if( startIdx >= count ) startIdx = count-1;
                }

                if( maxPos > startPos )
                {
                    endIdx = Math.floor((maxPos-startPos)/itemSize);
                    if( endIdx >= count ) endIdx = count-1;
                }
            }
            else
            {
                let i = 0;
                if( minPos > startPos )
                {
                    for ( ; i < count; i++ )
                    {
                        child = target.getElementAt(i);
                        temp = startPos + child.$getWidth() + gap;
                        if( minPos < temp )
                        {
                            startIdx = i;
                            break;
                        }

                        startPos = temp;
                    }
                }

                for ( ; i < count; i++ )
                {
                    child = target.getElementAt(i);
                    startPos += child.$getWidth()+gap;

                    endIdx = i;
                    if( maxPos <= startPos ) break;
                }
            }

            let oldStartIdx:number = self._startIdx;
            let oldEndIdx:number = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;

            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        }

        protected adjustViewIndexV( target:Group, width:number, height:number ):boolean
        {
            let self = this;

            let startIdx = 0, endIdx = 0;

            let gap = self.gap;

            let minPos = target.scrollV;
            let maxPos = minPos + height - self.paddingBottom;
            let startPos = self.paddingTop, temp = 0;
            let child:egret.DisplayObject;

            let count = target.numChildren;
            if( self.isFixedSize() )
            {
                let itemSize = self.itemH + gap;
                if( minPos > startPos )
                {
                    startIdx = Math.floor((minPos-startPos)/itemSize);
                    if( startIdx >= count ) startIdx = count-1;
                }

                if( maxPos > startPos )
                {
                    endIdx = Math.floor((maxPos-startPos)/itemSize);
                    if( endIdx >= count ) endIdx = count-1;
                }
            }
            else
            {
                let i = 0;
                if( minPos > startPos )
                {
                    for ( ; i < count; i++ )
                    {
                        child = target.getElementAt(i);
                        temp = startPos + child.$getHeight() + gap;
                        if( minPos < temp )
                        {
                            startIdx = i;
                            break;
                        }

                        startPos = temp;
                    }
                }

                for ( ; i < count; i++ )
                {
                    child = target.getElementAt(i);
                    startPos += child.$getHeight()+gap;

                    endIdx = i;
                    if( maxPos <= startPos ) break;
                }
            }

            let oldStartIdx:number = self._startIdx;
            let oldEndIdx:number = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;

            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        }

        //------------------------------------------------------------------------
        protected updateFixSizeDList(width:number, height:number):void
        {
            let self = this;
            if( self.isHorizontal )
            {
                self.updateFixSizeH( self._target );
            }
            else
            {
                self.updateFixSizeV( self._target );
            }
        }

        protected updateRealDList(width:number, height:number):void
        {
            let self = this;
            if( self.isHorizontal )
            {
                self.updateDLH( self._target );
            }
            else
            {
                self.updateDLV( self._target );
            }
        }

        protected updateFixSizeH( target:Group ):void
        {
            let self = this;

            let size = self.itemW + self.gap;
            let contentWidth = self.paddingLeft + self.paddingRight + size * target.numElements;
            let contentHeight = self.paddingTop + self.paddingBottom + self.itemH;

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = self.paddingLeft + size * startIdx, startY = 0;

            let paddingTop = self.paddingTop;
            for ( let i = startIdx; i <= endIdx; i++ )
            {
                let child = <ILayout>target.getElementAt(i);
                child.x = startX;
                child.y = paddingTop;
                startX += size;
            }

            target.setContentSize( contentWidth, contentHeight );
        }

        protected updateDLH( target:Group ):void
        {
            let self = this;

            let gap = self.gap;
            let i = 0, count = target.numElements;

            let child:ILayout;
            let contentWidth = self.paddingLeft + self.paddingRight;
            let contentHeight = self.paddingTop + self.paddingBottom;
            for ( ; i < count; i++ )
            {
                child = <ILayout>target.getElementAt(i);
                contentWidth += child.width + gap;
                contentHeight = Math.max(contentHeight, child.height);
            }

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = self.paddingLeft, startY = 0;

            i = 0;
            for ( ; i < startIdx; i++ )
            {
                child = <ILayout>target.getElementAt(i);
                startX = startX + child.width + gap;
            }

            let height = target.$getHeight();
            let paddingTop = self.paddingTop;
            if( self.verticalAlign == egret.HorizontalAlign.CENTER )
            {
                for ( ; i <= endIdx; i++ )
                {
                    child = <ILayout>target.getElementAt(i);
                    startY = paddingTop + (height-child.height)/2;
                    child.x = startX;
                    child.y = startY;
                    startX += child.width+gap;
                }
            }
            else if( self.verticalAlign == egret.VerticalAlign.BOTTOM )
            {
                child = <ILayout>target.getElementAt(i);
                startY = height - paddingTop - child.height;
                child.x = startX;
                child.y = startY;
                startX += child.width+gap;
            }
            else
            {
                for ( ; i <= endIdx; i++ )
                {
                    child = <ILayout>target.getElementAt(i);
                    child.x = startX;
                    child.y = paddingTop;
                    startX += child.width+gap;
                }
            }


            target.setContentSize( contentWidth, contentHeight );
        }

        protected updateFixSizeV( target:Group ):void
        {
            let self = this;

            let size = self.itemH + self.gap;
            let contentWidth = self.paddingLeft + self.paddingRight + self.itemW;
            let contentHeight = self.paddingTop + self.paddingBottom + size*target.numElements;

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = 0, startY = self.paddingTop + startIdx*size;

            let paddingLeft = self.paddingLeft;
            for ( let i=startIdx; i <= endIdx; i++ )
            {
                let child = <ILayout>target.getElementAt(i);
                child.x = paddingLeft;
                child.y = startY;
                startY += size;
            }

            target.setContentSize( contentWidth, contentHeight );
        }

        protected updateDLV( target:Group ):void
        {
            let self = this;

            let gap = self.gap;
            let i = 0, count = target.numElements;

            let child:ILayout;
            let contentWidth = self.paddingLeft + self.paddingRight;
            let contentHeight = self.paddingTop + self.paddingBottom;
            for ( ; i < count; i++ )
            {
                child = <ILayout>target.getElementAt(i);
                contentHeight += child.height + gap;
                contentWidth = Math.max(contentWidth, child.width);
            }

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = 0, startY = self.paddingTop;
            for ( i = 0; i < startIdx; i++ )
            {
                child = <ILayout>target.getElementAt(i);
                startY = startY + child.height + gap;
            }

            let width = target.$getWidth();
            let paddingLeft = self.paddingLeft;
            if( self.horizontalAlign == egret.HorizontalAlign.CENTER )
            {
                for ( ; i <= endIdx; i++ )
                {
                    child = <ILayout>target.getElementAt(i);
                    startX = paddingLeft + (width-child.width)/2;
                    child.x = startX;
                    child.y = startY;
                    startY += child.height+gap;
                }
            }
            else if( self.horizontalAlign == egret.HorizontalAlign.RIGHT )
            {
                child = <ILayout>target.getElementAt(i);
                startX = width - paddingLeft - child.width;
                child.x = startX;
                child.y = startY;
                startY += child.height+gap;
            }
            else
            {
                for ( ; i <= endIdx; i++ )
                {
                    child = <ILayout>target.getElementAt(i);
                    child.x = paddingLeft;
                    child.y = startY;
                    startY += child.height+gap;
                }
            }

            target.setContentSize( contentWidth, contentHeight );
        }
    }
}