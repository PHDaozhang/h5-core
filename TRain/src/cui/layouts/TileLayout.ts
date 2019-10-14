//////////////////////////////////////////////////////////////////////////////////////

module cui
{
    export class TileLayout extends LayoutBase
    {
        public isHorizontal = true;//横向滚动
        public horizontalGap = 0;
        public verticalGap = 0;

        protected _count = 0;//1行最多放下item个数

        public getElementRect( idx:number ):IRectData
        {
            let self = this;
            let target = self._target;

            let x = 0;
            let y = 0;
            let w = self.itemW + self.horizontalGap;
            let h = self.itemH + self.verticalGap;
            let item = target.getElementAt( idx );
            if( item && item.visible )
            {
                if( self.isHorizontal )
                {
                    x = item.x;
                }
                else
                {
                    y = item.y;
                }
                return {x:x,y:y,w:w,h:h};
            }

            let count = self._count;
            let row = Math.floor(idx/count);
            let col = idx - row*count;
            if( self.isHorizontal )
            {
                if( row > 0 )
                {
                    x = w*row + self.paddingLeft;
                }
                if( col > 0 )
                {
                    y = h*col + self.paddingTop;
                }
            }
            else
            {
                if( col > 0 )
                {
                    x = h*col + self.paddingLeft;
                }
                if( row > 0 )
                {
                    y = w*row + self.paddingTop;
                }
            }

            return {x:x,y:y,w:w,h:h};
        }

        public getItemIdxByPos( x:number, y:number ):number
        {
            let self = this;
            let idx = -1;
            let num = self._target.numElements;
            if( self.isFixedSize() && x > self.paddingLeft && y > self.paddingTop)
            {
                let hSize = self.itemW + self.horizontalGap;
                let vSize = self.itemH + self.verticalGap;
                let col = Math.floor((x-self.paddingLeft)/hSize);
                let row = Math.floor((y-self.paddingTop)/vSize);
                if( self.isHorizontal )
                {
                    idx = col*self._count + row;
                }
                else
                {
                    idx = row*self._count + col;
                }
            }

            if( idx >= num ) idx = num - 1;
            return idx;
        }

        protected adjustViewIndex( target:Group ):boolean
        {
            let self = this;

            if ( self.itemH<=0 || self.itemW <= 0 )
            {
                self._startIdx = self._endIdx = -1;
                if( DEBUG )
                {
                    egret.error( "item size is zero");
                }
                return false;
            }

            let width = target.$getWidth();
            let height = target.$getHeight();
            if (self.isHorizontal)
            {
                return self.adjustViewIndexH( target, width, height );
            }
            else
            {
                return self.adjustViewIndexV( target, width, height );
            }
        }

        protected adjustViewIndexH( target:Group, width:number, height:number ):boolean
        {
            let self = this;
            let verticalGap = self.verticalGap
            let rowCount = Math.floor( (height-self.paddingTop-self.paddingBottom+verticalGap) / (self.itemH+verticalGap) );
            self._count = rowCount;

            let startPos = self.paddingLeft;
            let startCol = 0, endCol = 0;
            let tmpSize = self.itemW+self.horizontalGap;
            let minPos = target.scrollH;
            if( minPos > startPos )
            {
                startCol = Math.floor((minPos-startPos)/tmpSize);
            }
            let maxPos = target.scrollH+width-self.paddingRight;
            if( maxPos > startPos )
            {
                endCol = Math.floor((maxPos-startPos)/tmpSize);
            }

            let startIdx = startCol*rowCount;
            let endIdx = endCol*rowCount + rowCount - 1;
            let numChild = target.numElements;
            if( startIdx >= numChild ) startIdx = numChild - 1;
            if( endIdx >= numChild ) endIdx = numChild - 1;

            let oldStartIdx:number = self._startIdx;
            let oldEndIdx:number = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;

            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        }

        protected adjustViewIndexV( target:Group, width:number, height:number ):boolean
        {
            let self = this;
            let horizontalGap = self.horizontalGap;
            let colCount = Math.floor( (width-self.paddingLeft-self.paddingRight+horizontalGap) / (self.itemW+horizontalGap) );
            self._count = colCount;

            let startPos = self.paddingTop;
            let startRow = 0, endRow = 0;
            let tmpSize = self.itemH+self.verticalGap;
            let minPos = target.scrollV;
            if( minPos > startPos )
            {
                startRow = Math.floor((minPos-startPos)/tmpSize);
            }
            let maxPos = target.scrollV+height-self.paddingBottom;
            if( maxPos > startPos )
            {
                endRow = Math.floor((maxPos-startPos)/tmpSize);
            }

            let startIdx = startRow*colCount;
            let endIdx = endRow*colCount + colCount - 1;
            let numChild = target.numElements;
            if( startIdx >= numChild ) startIdx = numChild - 1;
            if( endIdx >= numChild ) endIdx = numChild - 1;

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
            if( DEBUG )
            {
                egret.error( "TileLayout must set itemH itemW" );
            }
        }

        protected updateFixSizeH( target:Group ):void
        {
            let self = this;

            let paddingTop = self.paddingTop;
            let rowCount = self._count;
            let numElements = target.numElements;
            let size = self.itemW + self.horizontalGap;
            let vSize = self.itemH + self.verticalGap;
            let maxCol = Math.ceil( numElements/rowCount);
            let contentWidth = self.paddingLeft + self.paddingRight + size * maxCol;
            let contentHeight = paddingTop + self.paddingBottom + self.itemH;

            let startCol = Math.floor(self._startIdx/rowCount), endCol = Math.floor(self._endIdx/rowCount);

            let startX = self.paddingLeft + size * startCol, startY = 0;
            let tmpIdx = 0;
            for ( let i = startCol; i < endCol; i++ )
            {
                tmpIdx = i * rowCount;
                startY = paddingTop;
                for( let j = 0; j < rowCount; j++ )
                {
                    let layoutElement = <ILayout>target.getVirtualElementAt(tmpIdx+j);
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startY += vSize;
                }
                startX += size;
            }

            //最后一行
            tmpIdx = endCol * rowCount;
            let end = tmpIdx + rowCount;
            if( end > numElements ) end = numElements;
            startY = paddingTop;
            for( let j = tmpIdx; j < end; j++ )
            {
                let layoutElement = <ILayout>target.getVirtualElementAt(j);
                layoutElement.x = startX;
                layoutElement.y = startY;
                startY += vSize;
            }

            target.setContentSize( contentWidth, contentHeight );
        }

        protected updateFixSizeV( target:Group ):void
        {
            let self = this;

            let paddingLeft = self.paddingLeft;
            let colCount = self._count;
            let numElements = target.numElements;
            let hSize = self.itemW + self.horizontalGap;
            let size = self.itemH + self.verticalGap;
            let maxRow = Math.ceil( numElements/colCount);
            let contentWidth = self.paddingLeft + self.paddingRight + self.itemW;
            let contentHeight = paddingLeft + self.paddingBottom + size * maxRow;

            let startRow = Math.floor(self._startIdx/colCount), endRow = Math.floor(self._endIdx/colCount);

            let startX = 0, startY = self.paddingTop + size * startRow;
            let tmpIdx = 0;
            for ( let i = startRow; i < endRow; i++ )
            {
                tmpIdx = i * colCount;
                startX = paddingLeft;
                for( let j = 0; j < colCount; j++ )
                {
                    let layoutElement = <ILayout>target.getVirtualElementAt(tmpIdx+j);
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startX += hSize;
                }
                startY += size;
            }

            //最后一行
            tmpIdx = endRow * colCount;
            let end = tmpIdx + colCount;
            if( end > numElements ) end = numElements;
            startX = paddingLeft;
            for( let j = tmpIdx; j < end; j++ )
            {
                let layoutElement = <ILayout>target.getVirtualElementAt(j);
                layoutElement.x = startX;
                layoutElement.y = startY;
                startX += hSize;
            }

            target.setContentSize( contentWidth, contentHeight );
        }
    }
}
