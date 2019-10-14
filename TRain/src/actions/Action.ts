/**
 * Created by wjdeng on 2016/1/4.
 */

module TRain
{
    export class Action
    {
        //-------------------------------------------------------
        protected _tar:any;
        protected _dur:number
        protected _times:number;//播放次数  默认播放一次  必大于0

        protected _tm:number = 0;
        protected _doCnt:number = 0;
        //和别的系统保持一至  如 delaydo
        //private _firstTick:boolean = true;
        constructor( dur?:number, times?:number ){
            let self = this;
            self._dur = dur || 1;
            self._times = times || 1;
            self._tm = 0;
            self._doCnt = 0;
        }

        public get duration():number
        {
            let self = this;
            return self._dur * self._times;
        }
        public set duration( d:number )
        {
            this._dur = d;
        }

        public get times():number
        {
            return this._times;
        }
        public set times( val:number )
        {
            this._times = val>0 ? val : 1;
        }

        public isDone():boolean
        {
            return this._tm>=this._dur;
        }

        public getTar():any
        {
            return this._tar;
        }

        public start( tar:any ):void
        {
            let self = this;
            self._tar = tar;
            //self._firstTick = true;
            self._tm = 0;
            self._doCnt = 0;
        }

        public stop():void
        {
            this._tar = null;
        }

        //停在最 并结束
        public stopToEnd():void
        {
            let self = this;
            if( self._tar )
            {
                self.update(1);
                self._tar = null;
            }
        }

        public clear():void
        {
            this._tar = null;
        }

        public step( dt:number ):void
        {
            let self = this;
            //if (self._firstTick)
            //{
            //    self._firstTick = false;
            //    self._tm = 0;
            //}
            //else
            //{
            self._tm += dt;
            //}

            let val = Math.min( 1, self._tm/self._dur);

            self.update( val );

            if( val >= 1 )
            {
                let times = self.times;
                self._doCnt++;
                if( self._doCnt < times )
                {//下一轮
                    self._tm -= self._dur;
                }
            }
        }

        /**
         called once per frame. tm a value between 0 and 1

         For example:
         - 0 means that the action just started
         - 0.5 means that the action is in the middle
         - 1 means that the action is over
         */
        public update( tm:number ):void
        {

        }
    }


    export class ActionLoop extends Action
    {
        //---------------------------------------------------------------------------------
        private _act:Action;
        constructor( action:Action )
        {
            super();

            this._act = action;
        }


        public isDone():boolean
        {
            return false;
        }

        public stop():void
        {
            let self = this;
            self._tar = null;
            self._act.stop();
        }

        public clear():void
        {
            super.clear();

            let action = this._act;
            if( action )
            {
                action.clear();
                this._act = null;
            }
        }

        public setAction( action:Action ):void
        {
            let self = this;
            let oldAction = self._act;
            if( oldAction ) oldAction.stop();

            self._act = action;

            let tar = self._tar;
            if( tar && action ){
                action.start( tar );
            }
        }

        public start( tar:any ):void
        {
            super.start( tar );

            let action = this._act;
            if( action ) action.start( tar );
        }

        public step( dt:number ):void
        {
            let self = this;
            let action = self._act;
            if( action )
            {
                self._tm += dt;
                if( action.isDone() )
                {
                    //重新开始
                    let duration = action.duration;
                    dt = self._tm - duration;
                    if( dt > duration )
                    {
                        dt = dt%duration;
                    }
                    self._tm = dt;
                    action.start( self._tar );
                }

                action.step( dt );
            }
        }
    }
}