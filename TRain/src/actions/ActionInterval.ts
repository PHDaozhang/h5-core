/**
 * Created by wjdeng on 2016/1/5.
 */

module TRain
{
    export class ActionTween extends Action
    {
        //------------------------------------------------
        protected _easeFun:Function; //(t:number)=>number;

        public setEaseFun( fun:Function ):void
        {
            this._easeFun = fun;
        }

        public update( tm:number ):void
        {
            let self = this;
            let easeFun = self._easeFun;
            if( easeFun ) tm = easeFun( tm );

            self.doUpdate( tm );
        }

        protected doUpdate( tm:number ):void
        {

        }
    }

    export class ActionTweenCall extends ActionTween
    {
        public once:boolean = true;//只执行一次
        //------------------------------------------------
        private _cb:{fun:(tm:number)=>void, tar:any};

        public setCall( fun:(tm:number)=>void, tar:any ):void
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

        protected doUpdate( tm:number ):void
        {
            let self = this;
            let cbData = self._cb;
            if( cbData )
            {
                cbData.fun.call( cbData.tar, tm );
            }
        }
    }

    export class ActionPropTween extends ActionTween
    {
        //----------------------------------------------------
        protected _props:{[name:string]:{b:number,r:number}};

        constructor( dur?:number, times?:number, props?:{[name:string]:{b:number,r:number}} ){
            super( dur, times );

            this._props = props;
        }

        // props name:{b, r}
        public setProps( props:{[name:string]:{b:number,r:number}} ):void
        {
            this._props = props;
        }

        public addProp( name:string, from:number, to:number ):void
        {
            let props = this._props;
            if( !props )
            {
                props = {};
                this._props = props;
            }

            props[name] = {b:from, r:to-from};
        }

        public start( tar:any ):void
        {
            super.start( tar );

            let self = this;
            let props = self._props;
            if( props ){
                for( let name in props ){
                    tar[name] = props[name].b;
                }
            }
        }

        protected doUpdate( tm:number ):void
        {
            let self = this;
            let tar = self._tar;
            let props = self._props;
            //if( tar && props )
            //{
                for( let name in props )
                {
                    let data = props[name];
                    tar[name] = data.b + data.r*tm;
                }
            //}
        }
    }

    //-----------------------------------------------------------------
    export class ActionPropTo extends ActionTween
    {
        //----------------------------------------
        protected _toProps:{[name:string]:number};
        protected _props:{[name:string]:{b:number,r:number}};

        constructor( dur?:number, times?:number, props?:{[name:string]:number} ){
            super( dur, times );

            this._toProps = props;
        }

        // props name:toval
        public setProps( props:{[name:string]:number} ):void
        {
            this._toProps = props;
        }

        public addProp( name:string, to:number ):void
        {
            let toProps = this._toProps;
            if( !toProps ){
                toProps = {};
                this._toProps = toProps;
            }

            toProps[name] = to;
        }

        public start( tar:any ):void
        {
            super.start( tar );

            let self = this;
            let toProps = self._toProps;
            let props = {};
            if( toProps ){
                for( let name in toProps ){
                    let from = tar[name];
                    props[name] = {b:from, r:toProps[name]-from};
                }
            }
            
            self._props = props;
        }

        protected doUpdate( tm:number ):void
        {
            let self = this;
            let tar = self._tar;
            let props = self._props;
            //if( tar && props )
            //{
                for( let name in props ){
                    let data = props[name];
                    tar[name] = data.b + data.r*tm;
                }
            //}
        }
    }

    //-------------------------------------------------------------------------
    export class ActionSequence extends ActionTween
    {
        //-----------------------------------------------------
        private _actions:Array<Action>;
        private _lastSplit:number;
        private _curSplit:number;
        //private _curDuration:number;
        private _curIdx:number;

        constructor( actions?:Action[] ){
            super();

            if(actions) this.setActions( actions );
        }

        public setActions( actions:Action[] ):void
        {
            let self = this;
            self._actions = actions;
            self._curIdx = 0;

            let duration = 0;
            for( let i=0,n=actions.length; i<n; ++i )
            {
                duration += actions[i].duration;
            }
            self.duration = duration;
        }

        public addAction( action:Action ):void
        {
            let self = this;
            let actions = self._actions;
            if( !actions )
            {
                actions = [];
                self._actions = actions;
            }

            actions.push( action );

            let duration = self._dur + action.duration;
            self.duration = duration;
        }

        public stop():void
        {
            let self = this;
            let actions = self._actions;
            if( actions.length > self._curIdx )
            {
                actions[self._curIdx].stop();
            }

            super.stop();
        }

        public stopToEnd():void
        {
            let self = this;
            let actions = self._actions;
            for( let i=self._curIdx, len=actions.length; i<len; ++i )
            {
                actions[i].stopToEnd();
            }
            super.stop();
        }

        public clear():void
        {
            super.clear();

            let self = this;
            let actions = self._actions;
            for( let i=0,n=actions.length; i<n; ++i )
            {
                actions[i].clear();
            }
            actions.length = 0;
        }

        public start( tar:any ):void
        {
            super.start( tar );

            let self = this;
            let action = self._actions[0];
            action.start( tar );
            //self._curDuration = action.duration;
            self._lastSplit = 0;
            self._curSplit = action.duration/self._dur;
            self._curIdx = 0;
        }

        public update( tm:number ):void
        {
            let self = this;
            let curIdx = self._curIdx;
            let actions = self._actions;
            while( curIdx < actions.length )
            {
                let curAction = actions[curIdx];
                let split = Math.min(1, self._curSplit + self._lastSplit);
                if( tm >= split )
                {
                    curAction.update( 1 );

                    curAction.stop();

                    curIdx++;
                    self._curIdx = curIdx;
                    if( curIdx < actions.length )
                    {
                        let action = actions[curIdx];
                        action.start( self._tar );
                        //self._curDuration += action.duration;
                        self._lastSplit = split;
                        self._curSplit = action.duration/self._dur;
                    }
                }
                else
                {
                    curAction.update( (tm-self._lastSplit)/self._curSplit );
                    break;
                }
            }
        }
    }

    export class ActionSpawn extends ActionTween
    {
        //---------------------------------------------------------------------------------
        private _actions:Action[];
        constructor( actions?:Action[] ){
            super();

            if(actions) this.setActions( actions );
        }

        public setActions( actions:Action[] ):void
        {
            let self = this;

            let maxDuration = 0;
            let action:Action;
            let i=0,n=actions.length;
            for( ; i<n; ++i )
            {
                action = actions[i];
                if( maxDuration < action.duration )
                {
                    maxDuration = action.duration;
                }
            }

            let sqAction:ActionSequence;
            let delayAction:Action;
            let newActions = [];
            for( i=0; i<n; ++i )
            {
                action = actions[i];
                if( action.duration < maxDuration )
                {
                    sqAction = new ActionSequence();
                    delayAction = new Action();
                    delayAction.duration = maxDuration - action.duration;
                    sqAction.setActions( [action, delayAction] )
                    newActions.push( sqAction );
                }
                else
                {
                    newActions.push( action );
                }
            }
            self._actions = newActions;
            self.duration = maxDuration;
        }

        public stop():void
        {
            let actions = this._actions;
            for( let i=0, n=actions.length; i < n; ++i )
            {
                actions[i].stop();
            }
            super.stop();
        }

        public stopToEnd():void
        {
            let actions = this._actions;
            for( let i=0, n=actions.length; i < n; ++i )
            {
                actions[i].stopToEnd();
            }
            super.stop();
        }

        public clear():void
        {
            super.clear();

            let self = this;
            let actions = self._actions;
            for( let i=0,n=actions.length; i<n; ++i )
            {
                actions[i].clear();
            }
            actions.length = 0;
        }

        public start( tar:any ):void
        {
            super.start( tar );

            let actions = this._actions;
            for( let i=0, n=actions.length; i < n; ++i )
            {
                actions[i].start(tar);
            }
        }

        public update( tm:number ):void
        {
            let actions = this._actions;
            for( let i=0, n=actions.length; i < n; ++i )
            {
                actions[i].update( tm );
            }
        }
    }
}

