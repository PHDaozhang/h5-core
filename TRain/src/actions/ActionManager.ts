/**
 * Created by wjdeng on 2016/1/4.
 */

    ///<reference path="../utils/CMap.ts" />

module TRain
{
    export const enum ACTIONSTATE
    {
        NONE,
        PAUSE,
        RMV,
    }

    export interface IActionData
    {
        actions:Array<Action>;
        tar:any;
        state:ACTIONSTATE;
    }

    export class ActionManager
    {
        //-------------------------------------------------------------------
        private _tarActs:CMap<Object,IActionData>;
        private _tagActs:CMap<number,Action[]>;

        private _unitTag:number;
        constructor()
        {
            let self = this;
            self._unitTag = 10000;
            self._tarActs = new CMap<Object,IActionData>();
            self._tagActs = new CMap<number,Action[]>();
        }

        public getUnitTag():number
        {
            return this._unitTag++;
        }

        //注： tag用于做清除tag相同的Action，当用完后，必须要调用rmvActionsByTag，完成 action 清理
        public addAction( act:Action, tar:any, paused:boolean, tag?:number ):void
        {
            let tarActs = this._tarActs;
            let actData:IActionData = tarActs.get( tar );
            if( !actData )
            {
                actData = {actions:[act],tar:tar,state:paused?ACTIONSTATE.PAUSE:ACTIONSTATE.NONE};
                tarActs.set( tar, actData );
            }
            else if( actData.state == ACTIONSTATE.RMV )
            {
                actData.actions = [act];
                actData.state = paused?ACTIONSTATE.PAUSE:ACTIONSTATE.NONE;
            }
            else
            {
                let actions = actData.actions;
                if( actions.indexOf( act ) < 0 )
                {
                    actions.push( act );
                }
            }
            act.start( tar );

            if( tag )
            {
                let actions = this._tagActs.get( tag );
                if( !actions )
                {
                    actions = [];
                    this._tagActs.set( tag, actions );
                }
                actions.push( act );
            }
        }

        public rmvAction( act:Action ):void
        {
            let tar = act.getTar();
            if( tar )
            {
                act.stop();

                let actData = this._tarActs.get( tar );
                if( actData )
                {
                    let actions = actData.actions;
                    let idx = actions.indexOf( act );
                    if( idx>=0)
                    {
                        actions.splice( idx, 1 );
                    }

                    if( actions.length == 0 )
                    {
                        actData.state = ACTIONSTATE.RMV;
                    }
                }
            }
        }

        public rmvActsByTar( tar:any ):void
        {
            let actData = this._tarActs.get( tar );
            if( actData )
            {
                actData.state = ACTIONSTATE.RMV;
            }
        }

        public rmvActsByTag( tag:number ):void
        {
            let actions = this._tagActs.get( tag );
            if( actions )
            {
                for( let i=0, n=actions.length; i<n; ++i )
                {
                    actions[i].stop();
                }
                this._tagActs.delete( tag );
            }
        }

        public rmvAllActs():void
        {
            let actDatas:Array<IActionData> = this._tarActs.values;
            for( let i=0,n=actDatas.length; i<n; ++i )
            {
                actDatas[i].state = ACTIONSTATE.RMV;
            }
        }


        //----------------------------------------------
        public pauseTar( tar:any ):void
        {
            let actData = this._tarActs.get( tar );
            if( actData && actData.state != ACTIONSTATE.RMV )
            {
                actData.state = ACTIONSTATE.PAUSE;
            }
        }

        public resumeTar( tar:any ):void
        {
            let actData = this._tarActs.get( tar );
            if( actData && actData.state != ACTIONSTATE.RMV )
            {
                actData.state = ACTIONSTATE.NONE;
            }
        }

        public pauseAll():void
        {
            let actDatas = this._tarActs.values;
            for( let i=0,n=actDatas.length; i<n; ++i )
            {
                let actData = actDatas[i];
                if( actData.state != ACTIONSTATE.RMV )
                {
                    actData.state = ACTIONSTATE.PAUSE;
                }
            }
        }

        public advanceTime( dt:number ):void
        {
            let self = this;
            let tarActs = self._tarActs;
            if( tarActs.size <= 0 ) return;

            let rmvs = [];
            let actDatas = tarActs.values;
            let i=0, n=actDatas.length;
            for( ; i<n; ++i )
            {
                let actData = actDatas[i];
                switch ( actData.state )
                {
                    case ACTIONSTATE.NONE:
                        self.updateAction( actData, dt );
                        break;
                    case ACTIONSTATE.RMV:
                        rmvs.push( actData.tar );
                        break;
                }
            }

            if( rmvs.length > 0 )
            {
                for( i=0,n=rmvs.length; i<n; ++i )
                {
                    tarActs.delete( rmvs[i] );
                }
            }
        }

        private updateAction( actData:IActionData, dt:number ):void
        {
            let actions = actData.actions;
            for( let i=actions.length-1; i>=0; --i )
            {
                let action = actions[i];
                if( action.getTar() )
                {
                    action.step( dt );

                    if( action.isDone() )
                    {
                        action.stop();
                        actions.splice( i, 1 );
                    }
                }
                else
                {
                    actions.splice( i, 1 );
                }
            }
            if( actions.length == 0 )
            {
                actData.state = ACTIONSTATE.RMV;
            }
        }
    }

    export let actionMgr = new ActionManager();
}