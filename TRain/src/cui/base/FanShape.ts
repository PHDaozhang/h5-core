
module cui{
    /**通过 width  表示直径 
     * 顺时针
    */
    export class FanShape extends egret.Shape implements IBaseCtrl{
        public tag:number;
        public ud:any;

        protected _disposed:boolean;//是否已销毁

        protected _invalidProps:number;
        protected _invalidPropsFlag:boolean;

        protected $BC:any[];

        protected _stAngle:number; 
        protected _endAngle:number; 
        protected _color:number;

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
                NaN
            ];

            self.tag = -1;
            self._invalidProps = 0;
            self._stAngle = 0;
            self._endAngle = 360;
            self._color = 0;
        }

        public dispose():void
        {
            this._disposed = true;
        }

        $onAddToStage( stage:egret.Stage, nestLevel: number ):void
        {
            super.$onAddToStage( stage, nestLevel );

            let self = this;
            if( self._invalidProps>0 )
            {
                self.validateProps();
            }
        }

        //-------------------------------------------------------------
        // width  表示直径 
        $setWidth(value:number):void
        {
            super.$setWidth( value );
            super.$setHeight( value );
  
            this.invalidateProps( PropertyType.size );
        }

        // $setHeight(value:number):void
        // {
        //     super.$setHeight( value );

        //     this.invalidateProps( PropertyType.size );
        // }
        //开始角度 默认0
        public get stAngle():number
        {
            return this._stAngle;
        }

        public set stAngle(value:number)
        {
            value = +value;
            if ( this._stAngle == value)
                return;

            this._stAngle = value;
            this.invalidateProps( PropertyType.source );
        }

        //结束角度 默认360
        public get endAngle():number
        {
            return this._endAngle;
        }

        public set endAngle(value:number)
        {
            value = +value;
            if ( this._endAngle == value)
                return;

            this._endAngle = value;
            this.invalidateProps( PropertyType.source );
        }

        //结束角度 默认360
        public get color():number
        {
            return this._color;
        }

        public set color(value:number)
        {
            value = +value;
            if ( this._color == value)
                return;

            this._color = value;
            this.invalidateProps( PropertyType.source );
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
            return this.$BC[BaseUIKeys.perWidth];
        }

        public set perHeight(value:number)
        {
            // value = +value;
            // let values = this.$BC;
            // if (values[BaseUIKeys.perHeight] === value)
            //     return;

            // values[BaseUIKeys.perHeight] = value;
            // this.setNeedPLayout();
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
                if( self.$parent )
                {
                    self.drawFan();
                }

                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        }

        protected drawFan(){
            let self = this;
            let g:egret.Graphics = self.graphics;
            let width =  self.width;
            let startAngle = self._stAngle;
            let endAngle = self._endAngle;
            if( !width || startAngle==endAngle ) {
                g.clear();
                return;
            }

            let radius = Math.floor( width/2+0.5 );

            g.beginFill( self.color );
   
            g.moveTo( radius, radius );
            let tx = radius*(1+Math.cos(startAngle));
            let ty = radius*(1-Math.sin(startAngle));
            g.lineTo(tx,ty);

            g.drawArc( radius, radius, radius, startAngle/180*Math.PI, endAngle/180*Math.PI );

            g.lineTo( radius, radius );
            g.endFill();
        }
    }
}