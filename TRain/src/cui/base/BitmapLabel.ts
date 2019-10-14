/**
 * Created by wjdeng on 2015/10/29.
 */

module cui
{
    export class BitmapLabel extends egret.BitmapText implements IBaseCtrl
    {
        public tag:number;
        public ud:any;

        protected _disposed:boolean;//是否已销毁

        protected _fontChanged: boolean;
        protected _font:string;

        protected _invalidProps:number;
        protected _invalidPropsFlag:boolean;

        protected $BC:any[];

        public constructor( text?:string )
        {
            super();

            let self = this;
            self._fontChanged = false;
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false, //pLayout
            ];
            self._invalidProps = 0;
            //self.$BitmapText[egret.sys.BitmapTextKeys.textLinesChanged] = true;

            if( text ) self.$setText(text);
        }

        public get filterNm():string{
            return this.$BC[BaseUIKeys.filterNm];
        }

        public set filterNm( nm:string ){
            this.$BC[BaseUIKeys.filterNm] = nm;
            this.filters = nm&&nm.length>0 ? uiMgr.getFilters(nm) : null;
        }

        $onAddToStage( stage:egret.Stage, nestLevel: number ):void
        {
            super.$onAddToStage( stage, nestLevel );

            let self = this;
            if( self._fontChanged )
            {
                self.parseFont();
            }
            if( self._invalidProps>0 )
            {
                self.validateProps();
            }
        }

        //--------------------------------------------------
        $setText(value: string): boolean
        {
            let result: boolean = super.$setText(value);
            if( result )
            {
                this.invalidateProps( PropertyType.text );
            }
            return result;
        }

        $setFont(value: string): boolean
        {
            let self = this;

            if (self._font == value) {
                return false;
            }
            self._font = value;
            if ( self.$stage )
            {
                self.parseFont();
            }
            else
            {
                self._fontChanged = true;
            }
            self.$fontStringChanged = true;
            return true;
        }

        protected parseFont(): void
        {
            let self = this;
            self._fontChanged = false;
            if (self._font)
            {
                TRain.assetMgr.getFont(self._font, self.onFontChanged, self);
            }
            else
            {
                self.$setFontData( null );
            }
        }

        private onFontChanged(bitmapFont:egret.BitmapFont, font:string): void
        {
            let self = this;
            if (font !== self._font) {
                return;
            }
            self.$setFontData(bitmapFont);
        }

        public $setFontData(value: egret.BitmapFont): boolean
        {
            let self = this;
            if (value == self.$font) {
                return false;
            }
            self.$font = value;

            if( self.text != "" )
            {
                self.$invalidateContentBounds();
                self.invalidateProps( PropertyType.source );
            }
            return true;
        }

        //-------------------------------------------------------------------
        public dispose():void
        {
            this._disposed = true;
        }

        //-------------------------------------------------------------
        $setWidth(value:number):boolean
        {
            let ret = super.$setWidth( value );
            if( ret )
            {
                this.invalidateProps( PropertyType.size );
            }
            return ret;
        }
        $setHeight(value:number):boolean
        {
            let ret = super.$setHeight( value );
            if( ret )
            {
                this.invalidateProps( PropertyType.size );
            }
            return ret;
        }


        //---------------------------------------------------------------------
        public set txtKey(key:string){
            let txt = TRain.langMgr.getTxtByKey( key );
            if( txt ) this.text = txt;
        }

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
            let parent = <BaseContainer>self.$parent;
            if ( !values[BaseUIKeys.needPLayout] )
            {
                values[BaseUIKeys.needPLayout] = true;
                if( parent )
                {
                    parent.openLayout();
                }
            }

            if( parent )
            {
                parent.invalidateDL();
            }
        }

        //--------------------------------------------------

        protected invalidateProps( tp:PropertyType ):void
        {
            let self = this;
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
            let invalidateProps = self._invalidProps;
            if( invalidateProps != 0 )
            {
                let values = self.$BC;
                if( values[BaseUIKeys.needPLayout] && self.$parent )
                {
                    if( self.text != "" )
                    {
                        (<IBaseContainer><any>self.$parent).invalidateDL();
                    }
                }

                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        }
    }
}


