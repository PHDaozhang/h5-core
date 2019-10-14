/**
 * Created by wjdeng on 2016/1/5.
 */

module TRain
{
    export class ActionDo extends Action
    {
        //-------------------------------------------------------
        public update( tm:number ):void
        {
            if( tm >= 1 )
            {
                this.do();
            }
        }

        protected do():void
        {

        }
    }

    export class ActionPropDo extends ActionDo
    {
        //--------------------------------------------------------
        private _props:{[key:string]:any};
        constructor( dur?:number, props?:{[key:string]:any} ){
            super( dur );

            this._props = props;
        }
        
        public setProps( props:any ):void
        {
            this._props = props;
        }

        public addProp( name:string, val:any ):void
        {
            let props = this._props;
            if( !props )
            {
                props = {};
                this._props = props;
            }

            props[name] = val;
        }

        protected do():void
        {
            let tar = this._tar;
            let props = this._props;
            //if( tar && props )
            //{
                for( let name in props )
                {
                    tar[name] = props[name];
                }
            //}
        }
    }

    export class ActionCallDo extends ActionDo
    {
        public once:boolean = true;//只执行一次
        //--------------------------------------------------------
        private _cb:{fun:Function, tar:any};
        public setCall( fun:Function, tar:any ):void
        {
            this._cb = {fun:fun, tar:tar};
        }

        public clear():void
        {
            let self = this;
            self._tar = null;
            self._cb = null;
        }

        public stop():void
        {
            let self = this;
            self._tar = null;
            if( self.once ){
                self._cb = null;
            } 
        }

        public stopToEnd():void
        {
            let self = this;
            if( self._tar )
            {
                self.do();
                self._tar = null;
            }
        }

        protected do():void
        {
            let self = this;
            let cbData = self._cb;
            if( cbData )
            {
                cbData.fun.call( cbData.tar, self._tar );
                if( self.once ){
                    self._cb = null;
                } 
            }
        }
    }
}
