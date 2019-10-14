/**
 * Created by wjdeng on 2015/10/29.
 */

module cui
{
    egret.Bitmap.prototype.$setTexture = function(value:TRain.TexData):boolean
    {
        let self = this;
        self._sourceChanged = false;
        let oldTexture = <TRain.TexData>self.$texture;
        if (value == oldTexture)
        {
            return false;
        }

        self.$texture = value;
        if (value)
        {
            self.$refreshImageData();
        }
        else
        {
            self.setImageData(null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        self.$renderDirty = true;
        return true;
    };

    export class Image extends egret.Bitmap implements IBaseCtrl
    {
        public tag:number;
        public ud:any;

        protected _disposed:boolean;//是否已销毁

        protected _anthorPerX:number;
        protected _anthorPerY:number;
        protected _invalidProps:number;
        protected _invalidPropsFlag:boolean;

        protected _source:string;
        protected _sourceChanged:boolean;

        protected $BC:any[];

        constructor( source?:string )
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
                false, //pLayout
            ];

            self._invalidProps = 0;
            self._sourceChanged = false;
            self._source = null;

            self.$renderNode = new egret.sys.BitmapNode();
            if( source )
            {
                self.source = source;
            }
        }

        //----------------------------------------------------
        public get anthorPerX():number
        {
            return this._anthorPerX || 0;
        }

        public set anthorPerX( val:number )
        {
            let self = this;
            self._anthorPerX = val;
            let width = self.$getWidth();
            if( width > 0 ){
                self.anchorOffsetX = Math.floor(width * val);
            }
        }

        public get anthorPerY():number
        {
            return this._anthorPerY || 0;
        }

        public set anthorPerY( val:number )
        {
            let self = this;
            self._anthorPerY = val;
            let height = self.$getHeight();
            if( height > 0 ){
                self.anchorOffsetY = Math.floor(height * val);
            }
        }

        public get filterNm():string{
            return this.$BC[BaseUIKeys.filterNm];
        }

        public set filterNm( nm:string ){
            this.$BC[BaseUIKeys.filterNm] = nm;
            this.filters = nm&&nm.length>0 ? uiMgr.getFilters(nm) : null;
        }

        //----------------------------------------
        public get source():string
        {
            return this._source;
        }

        public set source( value:string )
        {
            let self = this;
            if (value == self._source)
            {
                return;
            }

            self._source = value;

            if( value )
            {
                if(self.$stage)
                {
                    self.handleSourceChange();
                }
                else
                {
                    self._sourceChanged = true;
                }
            }
            else
            {
                self.$setTexture( null );
            }
        }

        protected handleSourceChange():void
        {
            let self = this;
            self._sourceChanged = false;
            let value = self._source;
            if( value )
            {
                TRain.assetMgr.getTex( value, self.contentChanged, self );
            }
        }

        $setTexture(value:TRain.TexData):boolean
        {
            let self = this;
            self._sourceChanged = false;
            let oldTexture = <TRain.TexData>self.$texture;
            if (value == oldTexture)
            {
                return false;
            }

            self.$texture = value;
            if (value)
            {
                self.$refreshImageData();

				self.dispatchEventWith(egret.Event.COMPLETE);
                self.invalidateProps( PropertyType.source );
            }
            else
            {
                self.resetBitmapData();
            }
            self.$renderDirty = true;

            if( oldTexture )
            {
                TRain.assetMgr.releaseTex( oldTexture );
            }
            return true;
        }

        protected resetBitmapData():void
        {
            let self = this;
            self.$bitmapData = null;
            self.$bitmapX = 0;
            self.$bitmapY = 0;
            self.$bitmapWidth = 0;
            self.$bitmapHeight = 0;
            self.$offsetX = 0;
            self.$offsetY = 0;
            self.$textureWidth = 0;
            self.$textureHeight = 0;
            self.$sourceWidth = 0;
            self.$sourceHeight = 0;
        }

        protected contentChanged(data:TRain.TexData, source:string):void
        {
            let self = this;
            let used = false;
            if (source == self._source)
            {
                used = !!self.$setTexture(data);
            }

            if( data && !used )
            {
                TRain.assetMgr.releaseTex( data );
            }
        }

        //----------------------------------------------------
        $onAddToStage( stage:egret.Stage, nestLevel: number ):void
        {
            egret.DisplayObject.prototype.$onAddToStage.call( this, stage, nestLevel );

            let self = this;
            if( self._sourceChanged )
            {
                self.handleSourceChange();
            }
            if( self._invalidProps>0 )
            {
                self.validateProps();
            }
        }

        $onRemoveFromStage():void {
            egret.DisplayObject.prototype.$onRemoveFromStage.call( this );
        }

        // $render():void
        // {
        //     let  self = this;
        //     let image = self.$Bitmap[egret.sys.BitmapKeys.bitmapData];
        //     if (!image) return;


        //     let width = self.$getWidth();
        //     let height = self.$getHeight();
        //     if (width === 0 || height === 0) {
        //         return;
        //     }

        //     let values = this.$Bitmap;

        //     egret.sys.BitmapNode.$updateTextureData(<egret.sys.BitmapNode>this.$renderNode, values[egret.sys.BitmapKeys.image],
        //         values[egret.sys.BitmapKeys.bitmapX], values[egret.sys.BitmapKeys.bitmapY], values[egret.sys.BitmapKeys.bitmapWidth], values[egret.sys.BitmapKeys.bitmapHeight],
        //         values[egret.sys.BitmapKeys.offsetX], values[egret.sys.BitmapKeys.offsetY], values[egret.sys.BitmapKeys.textureWidth], values[egret.sys.BitmapKeys.textureHeight],
        //         width, height, values[egret.sys.BitmapKeys.sourceWidth], values[egret.sys.BitmapKeys.sourceHeight], self.$scale9Grid, self.$fillMode, values[egret.sys.BitmapKeys.smoothing]);
        // }


        //-----------------------------------------------------------
        public dispose():void
        {
            let self = this;
            self._disposed = true;

            let texture = self.$texture;
            if( texture )
            {
                self.$texture = null;
                TRain.assetMgr.releaseTex( <TRain.TexData>texture );
            }
        }


        //----------------------------------------------------------
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
            if( tp==PropertyType.size || tp==PropertyType.source ){
                let tmpVal = self._anthorPerX;
                if( tmpVal != undefined  ){
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
            let invalidateProps = self._invalidProps;
            if( invalidateProps != 0 )
            {
                let values = self.$BC;
                if( values[BaseUIKeys.needPLayout] && self.$parent )
                {
                    if( self.$texture )
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

