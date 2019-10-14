/**
 * Created by wjdeng on 2015/10/26.
 */

module cui
{
    //根据状态 显示图片
    export class StateImage extends Image
    {
        private _states:Object;
        private _curState:string;
        constructor()
        {
            super();

            let self = this;
            self._states = {};
            self._curState = null;
        }

        public set stateStr( val:string )
        {
            let self = this;
            let stateStrs:Array<string> = val.split(",");
            let stateData:Array<string>;
            let states = self._states;
            for(let i:number = 0; i < stateStrs.length; ++i )
            {
                stateData = stateStrs[i].split(":");
                if( stateData.length == 2 )
                {
                    states[stateData[0]] = stateData[1];
                }
            }

            let state = self._curState;
            if( state )
            {
                self.source = states[ state ];
            }
        }

        public set curState( state:string )
        {
            let self = this;
            if( self._curState == state ) return;

            self._curState = state;
            self.source = self._states[ state ];
        }

        public addState( key:string, val:string ):void
        {
            this._states[key] = val;
        }
    }
}
