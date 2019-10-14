/**
 * Created by wjdeng on 2016/4/1.
 */

module cui
{
    const enum GroupKeys{
        contentWidth,
        contentHeight,
        scrollH,
        scrollV,
        scrollEnabled
    }

    export class Group extends BaseContainer implements IViewport
    {
        protected $Group:any[];
        protected _layout:LayoutBase;

        constructor()
        {
            super();

            let self = this;
            self.$Group = [
                            0,        //contentWidth,
                            0,        //contentHeight,
                            0,        //scrollH,
                            0,        //scrollV,
                            false,    //scrollEnabled,
            ];
        }

        //------------------------------------- layout ------------------------------------
        public get layout():LayoutBase
        {
            return this._layout;
        }

        public set layout(value:LayoutBase)
        {
            let self = this;
            if (self._layout == value) return;

            if (self._layout)
            {
                self._layout.target = null;
            }

            self._layout = value;

            if (value)
            {
                value.target = self;
            }
        }

        public get isOpenLayout():boolean
        {
            return !!this._layout || this.$BC[BaseUIKeys.openLayout];
        }

        public set elementsContent(value:egret.DisplayObject[])
        {
            if (value)
            {
                let length = value.length;
                for (let i = 0; i < length; i++)
                {
                    this.addChild(value[i]);
                }
            }
        }

        //-------------------------------------------  layout -------------------------------------
        public get contentWidth():number
        {
            return this.$Group[GroupKeys.contentWidth];
        }

        public get contentHeight():number
        {
            return this.$Group[GroupKeys.contentHeight];
        }

        public setContentSize(width: number, height: number): void
        {
            let self = this;
            let values = self.$Group;
            values[GroupKeys.contentWidth] = width;
            values[GroupKeys.contentHeight] = height;

            values = self.$BC;
            if( isNaN( values[BaseUIKeys.width] ) )//自动大小
            {
                self.$setWidth( width );
            }
            if( isNaN( values[BaseUIKeys.height] ) )//自动大小
            {
                self.$setHeight( height );
            }
        }

        public getElementRect( idx:number ):IRectData
        {
            let self = this;
            let num = self.numElements;
            if( num <= 0 ) return null;

            if( idx >= num ) idx = num - 1;

            let layout = this._layout;
            if( layout )
            {
                return layout.getElementRect( idx );
            }

            let ret = null;
            let child = this.getElementAt(idx);
            if( child )
            {
                ret = {x:child.$getX(), y:child.$getY(), w:child.$getWidth(), h:child.$getHeight()}
            }
            return ret;
        }

        public getElementSize( idx:number ):ISizeData
        {
            let self = this;
            let num = self.numElements;
            if( num <= 0 ) return {w:0,h:0};

            if( idx >= num ) idx = num - 1;

            let layout = this._layout;
            if( layout )
            {
                return layout.getElementSize( idx );
            }

            let ret = {w:0,h:0};
            let child = this.getElementAt(idx);
            if( child )
            {
                ret.w = child.$getWidth();
                ret.h = child.$getHeight();
            }
            return ret;
        }

        public getElementIdxByPos( x:number, y:number ):number
        {
            let num = this.numElements;
            if( num <= 0 || (x<0&&y<0)) return -1;

            let layout = this._layout;
            if( layout )
            {
                return layout.getElementIdxByPos( x, y );
            }

            for( let i=0; i<num; i++ )
            {
                let child = this.getElementAt(i);
                if( child )
                {
                    let childX = child.$getX();
                    let childY = child.$getY();
                    if( childX<=x && childY<=y && x<=(childX+child.$getWidth()) && y<=(childY+child.$getHeight()))
                    {
                        return i;
                    }
                }
            }
            return -1;
        }

        public get numElements():number
        {
            return this.$children.length;
        }

        public getElementAt( index:number ):egret.DisplayObject
        {
            return this.getChildAt(index);
        }

        public getVirtualElementAt( index:number ):egret.DisplayObject
        {
            return this.getChildAt(index);
        }

        public setIndicesInView(startIndex:number, endIndex:number):void
        {
            let i = 0;
            let children = this.$children;
            for( ; i<startIndex; i++ )
            {
                children[i].$setVisible(false);
            }
            for( ; i<=endIndex; i++ )
            {
                children[i].$setVisible(true);
            }
            let count = children.length;
            for( ; i<count; i++ )
            {
                children[i].$setVisible(false);
            }
        }

        public isElementInView( idx:number ):boolean
        {
            let child = this.getChildAt( idx );
            return child ? child.visible : false;
        }

        //-------------- scroll -------------
        public get scrollEnabled():boolean
        {
            return this.$Group[GroupKeys.scrollEnabled];
        }

        public set scrollEnabled(value:boolean)
        {
            value = !!value;
            let values = this.$Group;
            if (value === values[GroupKeys.scrollEnabled])
                return;

            values[GroupKeys.scrollEnabled] = value;
            this.updateScrollRect();
        }

        public get scrollH():number
        {
            return this.$Group[GroupKeys.scrollH];
        }

        public set scrollH(value:number)
        {
            value = +value || 0;

            let self = this;
            let values = self.$Group;
            if (value === values[GroupKeys.scrollH])
                return;

            values[GroupKeys.scrollH] = value;
            self.invalidateDL();
            //if (self.updateScrollRect() && self._layout)
            //{
            //    self._layout.scrollPositionChanged();
            //}
        }

        public get scrollV():number
        {
            return this.$Group[GroupKeys.scrollV];
        }

        public set scrollV(value:number)
        {
            value = +value || 0;
            let self = this;
            let values = self.$Group;
            if (value == values[GroupKeys.scrollV])
                return;

            values[GroupKeys.scrollV] = value;
            self.invalidateDL();
            //if (self.updateScrollRect() && self._layout)
            //{
            //    self._layout.scrollPositionChanged();
            //}
        }

        private updateScrollRect():boolean
        {
            let self = this;
            let values = self.$Group;
            let hasClip = values[GroupKeys.scrollEnabled];
            let rect = this.$scrollRect;
            if (hasClip)
            {
                if( rect )
                {
                    rect.x = values[GroupKeys.scrollH];
                    rect.y = values[GroupKeys.scrollV];
                    rect.width = self.$getWidth();
                    rect.height = self.$getHeight();
                }
                else
                {
                    rect = new egret.Rectangle(values[GroupKeys.scrollH], values[GroupKeys.scrollV], self.$getWidth(), self.$getHeight() );
                }
                self.scrollRect = rect;
            }
            else if (this.$scrollRect)
            {
                self.scrollRect = null;
            }
            return hasClip;
        }

        //-------------------------------------- scroll ------------------------------------
        public validateChildDL( child:IBaseCtrl ):void
        {
            let self =this;
            let layout = self._layout;
            if ( layout ) {
                self.invalidateDL();
            }
            else{
                super.validateChildDL( child );
            }
        }

        public validateDL():void
        {
            let self =this;
            let layout = self._layout;
            if ( layout )
            {
                self._invalidDL = false;
                self._invalidDLFlag = false;
                layout.updateDL( self.$getWidth(), self.$getHeight() );
            }
            else
            {
                super.validateDL();
            }

            self.updateScrollRect();
        }
    }
}