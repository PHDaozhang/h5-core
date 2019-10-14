/**
 * Created by wjdeng on 2016/4/1.
 */

module cui
{
    export class Skin
    {
        public x:number;
        public y:number;
        public width:number;
        public height:number;

        public skinParts:string[];
        public elementsContent:egret.DisplayObject[];

        private states:{}; // state:[{ctrl:,prop:,val:}]

        private _host:Component;

        constructor()
        {
            let self = this;
            self.skinParts = [];
            self.elementsContent = [];
        }

        public get hostComponent():Component
        {
            return this._host;
        }

        public set hostComponent(value:Component)
        {
            let self = this;
            if (self._host == value)
                return;

            self._host = value;
            if( value )
            {
                let tmp = self.x;
                if(tmp) value.x = tmp;

                tmp = self.y;
                if(tmp) value.y = tmp;

                tmp = self.width;
                if( tmp && isNaN(value.$getExplicitWidth()) ) value.width = tmp;

                tmp = self.height;
                if( tmp && isNaN(value.$getExplicitHeight()) ) value.height = tmp;
            }
        }

        //------------------------------------------------------------
        public hasStates():boolean
        {
            return !!this.states;
        }

        public applyState( stateName:string ):void
        {
            let self = this;
            let propInfos = self.states[stateName];
            if( !propInfos ) return;

            let host = self._host;
            for( let i=0, n=propInfos.length; i<n; ++i )
            {
                let propInfo = propInfos[i];
                let ctrlName = propInfo.ctrl;
                if( ctrlName == "" )
                {
                    host[propInfo.prop] = propInfo.val;
                }
                else
                {
                    self[ctrlName][propInfo.prop] = propInfo.val;
                }
            }
        }
    }
}