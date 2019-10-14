/**
 * Created by wjdeng on 2015/12/24.
 */

// 1.target 必须是UIDataGroup
// 2. data 中需要有 width  height 属性
///<reference path="./LayoutBase.ts" />
module cui
{
    export class DataLineLayout extends LayoutBase
    {
        public isHorizontal = true;

        public gap = 0;

        public horizontalAlign:string = "left";//横向居中对齐 "left" right
        public verticalAlign:string = "top"; //纵向居中对齐 top bottom

        public getElementRect( idx:number ):IRectData
        {
            let self = this;
            let target = self._target;

            let itemData;
            let dataProvider = (<DataGroup>self.target).dataProvider;

            let x = 0;
            let y = 0;
            let w = target.contentWidth;
            let h = target.contentHeight;
            let gap = self.gap;
            let item = target.getElementAt( idx );
            if( item )
            {
                itemData = <IItemData>dataProvider.getItemAt(idx);
                if( self.isHorizontal )
                {
                    x = item.x;
                    w = itemData.width + gap;
                }
                else
                {
                    y = item.y;
                    h = itemData.height + gap;
                }
                return {x:x,y:y,w:w,h:h};
            }

            if( self.isFixedSize() )
            {
                if( self.isHorizontal )
                {
                    w = self.itemW+gap;
                    x = w*idx + self.paddingLeft;
                }
                else
                {
                    h = self.itemH+gap;
                    y = h*idx + self.paddingTop;
                }
            }
            else
            {
                if( self.isHorizontal )
                {
                    x = self.paddingLeft;
                    for ( let i = 0; i < idx; i++ )
                    {
                        itemData = <IItemData>dataProvider.getItemAt(i);
                        x += itemData.width + gap;
                    }
                    itemData = <IItemData>dataProvider.getItemAt(idx);
                    w = itemData.width+gap;
                }
                else
                {
                    y = self.paddingTop;
                    for ( let i = 0; i < idx; i++ )
                    {
                        itemData = <IItemData>dataProvider.getItemAt(i);
                        y += itemData.height + gap;
                    }
                    itemData = <IItemData>dataProvider.getItemAt(idx);
                    h = itemData.height+gap;
                }
            }

            return {x:x, y:y, w:w, h:h};
        }

        public getElementIdxByPos( x:number, y:number ):number
        {
            let self = this;
            let idx = -1;
            let gap = self.gap;
            let dataProvider = (<DataGroup>self.target).dataProvider;
            let count = dataProvider.length;
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
                let itemData;
                let target = self._target;
                if( self.isHorizontal )
                {
                    for ( ; i < count; i++ )
                    {
                        itemData = <IItemData>dataProvider.getItemAt(i);
                        x -= itemData.width;
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
                        itemData = <IItemData>dataProvider.getItemAt(i);
                        y -= itemData.height;
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

        public getElementSize( idx:number ):ISizeData
        {
            let self = this;
            if( self.isFixedSize() )
            {
                return {w:self.itemW,h:self.itemH};
            }

            let itemData = (<DataGroup>self.target).dataProvider.getItemAt(idx);
            return {w:itemData.width, h:itemData.height};
        }

        protected adjustViewIndex( target:Group ):boolean
        {
            let self = this;

            let width = target.$getWidth();
            let height = target.$getHeight();
            if (self.isHorizontal)
            {
                return self.adjustViewIndexH( <DataGroup>target, width, height );
            }

            return self.adjustViewIndexV( <DataGroup>target, width, height );
        }

        protected adjustViewIndexH( target:DataGroup, width:number, height:number ):boolean
        {
            let self = this;

            let startIdx = 0, endIdx = 0;
            let gap = self.gap;

            let minPos = target.scrollH;
            let maxPos = minPos + width - self.paddingRight;
            let startPos = self.paddingLeft, temp = 0;

            let dataProvider = target.dataProvider;
            let count = dataProvider.length;
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
                let itemData:IItemData;
                let i = 0;
                if( minPos > startPos )
                {
                    for ( ; i < count; i++ )
                    {
                        itemData = <IItemData>dataProvider.getItemAt(i);
                        temp = startPos + itemData.width + gap;
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
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    startPos += itemData.width+gap;

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

        protected adjustViewIndexV( target:DataGroup, width:number, height:number ):boolean
        {
            let self = this;

            let startIdx = 0, endIdx = 0;

            let gap = self.gap;

            let minPos = target.scrollV;
            let maxPos = minPos + height - self.paddingBottom;
            let startPos = self.paddingTop, temp = 0;

            let dataProvider = target.dataProvider;
            let count = dataProvider.length;
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
                let itemData:IItemData;
                let i = 0;
                if( minPos > startPos )
                {
                    for ( ; i < count; i++ )
                    {
                        itemData = <IItemData>dataProvider.getItemAt(i);
                        temp = startPos + itemData.height + gap;
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
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    startPos += itemData.height+gap;

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
            let target:DataGroup = <DataGroup>self._target;
            if( self.isHorizontal )
            {
                self.updateFixSizeH( target );
            }
            else
            {
                self.updateFixSizeV( target );
            }
        }

        protected updateRealDList(width:number, height:number):void
        {
            let self = this;
            let target:DataGroup = <DataGroup>self._target;
            if( self.isHorizontal )
            {
                self.updateDLH( target );
            }
            else
            {
                self.updateDLV( target );
            }
        }

        protected updateFixSizeH( target:DataGroup ):void
        {
            let self = this;
            let dataProvider = target.dataProvider;

            //let oldContentWidth = values[eui.sys.UIKeys.contentWidth];
            let size = self.itemW + self.gap;
            let contentWidth = self.paddingLeft + self.paddingRight + size * dataProvider.length;
            let contentHeight = self.paddingTop + self.paddingBottom + self.itemH;

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = self.paddingLeft + size * startIdx, startY = 0;

            let paddingTop = self.paddingTop;
            for ( let i = startIdx; i <= endIdx; i++ )
            {
                let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                layoutElement.x = startX;
                layoutElement.y = paddingTop;
                startX += size;
            }

            target.setContentSize( contentWidth, contentHeight );
            //if( contentWidth != oldContentWidth )
            //{
            //    target.invalidateSize();
            //}
        }

        protected updateDLH( target:DataGroup ):void
        {
            let self = this;
            let dataProvider = target.dataProvider;

            let gap = self.gap;
            let i = 0, count = dataProvider.length;

            //let oldContentWidth = values[eui.sys.UIKeys.contentWidth];
            let itemData:IItemData;

            let contentWidth = self.paddingLeft + self.paddingRight;
            let contentHeight = self.paddingTop + self.paddingBottom;
            for (; i < count; i++)
            {
                itemData = <IItemData>dataProvider.getItemAt(i);
                contentWidth += itemData.width + gap;
                contentHeight = Math.max(contentHeight, itemData.height);
            }

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = self.paddingLeft, startY = 0;

            i = 0;
            for ( ; i < startIdx; i++ )
            {
                itemData = <IItemData>dataProvider.getItemAt(i);
                startX = startX + itemData.width + gap;
            }

            let height = target.$getHeight();
            let paddingTop = self.paddingTop;
            if( self.verticalAlign == egret.HorizontalAlign.CENTER )
            {
                for ( ; i <= endIdx; i++ )
                {
                    let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    startY = paddingTop + (height-itemData.height)/2;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startX += itemData.width+gap;
                }
            }
            else if( self.verticalAlign == egret.VerticalAlign.BOTTOM )
            {
                for ( ; i <= endIdx; i++ )
                {
                    let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    startY = height-itemData.height-paddingTop ;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startX += itemData.width+gap;
                }
            }
            else
            {
                for ( ; i <= endIdx; i++ )
                {
                    let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    layoutElement.x = startX;
                    layoutElement.y = paddingTop;
                    startX += itemData.width+gap;
                }
            }

            target.setContentSize( contentWidth, contentHeight );
            //if( contentWidth != oldContentWidth )
            //{
            //    target.invalidateSize();
            //}
        }

        protected updateFixSizeV( target:DataGroup ):void
        {
            let self = this;
            let dataProvider = target.dataProvider;

            let size = self.itemH + self.gap;
            let contentWidth = self.paddingLeft + self.paddingRight + self.itemW;
            let contentHeight = self.paddingTop + self.paddingBottom + size*dataProvider.length;

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = 0, startY = self.paddingTop + startIdx*size;

            let paddingLeft = self.paddingLeft;
            for ( let i=startIdx; i <= endIdx; i++ )
            {
                let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                layoutElement.x = paddingLeft;
                layoutElement.y = startY;
                startY += size;
            }

            target.setContentSize( contentWidth, contentHeight );

            //if( contentHeight != oldContentHeight )
            //{
            //    target.invalidateSize();
            //}
        }

        protected updateDLV( target:DataGroup ):void
        {
            let self = this;
            let dataProvider = target.dataProvider;

            let gap = self.gap;
            let i = 0, count = dataProvider.length;

            //let oldContentHeight = values[eui.sys.UIKeys.contentWidth];

            let contentWidth = self.paddingLeft + self.paddingRight;
            let contentHeight = self.paddingTop + self.paddingBottom;
            let itemData:IItemData;
            for ( ; i < count; i++ )
            {
                itemData = <IItemData>dataProvider.getItemAt(i);
                contentHeight += itemData.height + gap;
                contentWidth = Math.max(contentWidth, itemData.width);
            }

            let startIdx = self._startIdx, endIdx = self._endIdx;
            let startX = 0, startY = self.paddingTop;
            for ( i = 0; i < startIdx; i++ )
            {
                itemData = <IItemData>dataProvider.getItemAt(i);
                startY = startY + itemData.height + gap;
            }

            let width = target.$getWidth();
            let paddingLeft = self.paddingLeft;
            if( self.horizontalAlign == egret.HorizontalAlign.CENTER )
            {
                for ( ; i <= endIdx; i++ )
                {
                    let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    startX = paddingLeft + (width-itemData.width)/2;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startY += itemData.height+gap;
                }
            }
            else if( self.horizontalAlign == egret.HorizontalAlign.RIGHT )
            {
                for ( ; i <= endIdx; i++ )
                {
                    let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    startX = width-itemData.width-paddingLeft;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startY += itemData.height+gap;
                }
            }
            else
            {
                for ( ; i <= endIdx; i++ )
                {
                    let layoutElement = <ILayout> (target.getVirtualElementAt(i));
                    itemData = <IItemData>dataProvider.getItemAt(i);
                    layoutElement.x = paddingLeft;
                    layoutElement.y = startY;
                    startY += itemData.height+gap;
                }
            }


            target.setContentSize( contentWidth, contentHeight );

            //if( contentHeight != oldContentHeight )
            //{
            //    target.invalidateSize();
            //}
        }
    }
}