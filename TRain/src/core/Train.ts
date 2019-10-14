/**
 * Created by wjdeng on 2016/4/6.
 */

module TRain
{
    interface INextDo
    {
        doFun:Function;
        thisObj:any;
        args:Array<any>;
    }

    interface IDelayDo
    {
        flag:number;
        doFun:Function;
        thisObj:any;
        delay:number;
        canScale:boolean;
        uuid:number;
        args:Array<any>;
    }

    interface IFrameDo
    {
        doFun:Function;
        thisObj:any;
        uuid:number;
        canScale:boolean;
        interval?:number;
        lostTm?:number;
    }

    export class Core
    {
        //--------------------------------------------------------------
        public stage:egret.Stage;

        private _timeScale:number;

        private _uid:number;
        private _delayDos:Array<IDelayDo>;
        private _freeDelayObjs:Array<IDelayDo>;

        private _nextDos:INextDo[];

        private _frameDos:Array<IFrameDo>;

        constructor()
        {
            let self = this;
            self._timeScale = 1;

            self._uid = 0;
            self._delayDos = [];
            self._freeDelayObjs = [];

            self._frameDos = [];

            self._nextDos = [];
        }

        public init( s:egret.Stage ):void
        {
            var self = this;
            var context = egret.lifecycle.contexts[0];
            context.onUpdate = function () { return self.update(); };
            //失去焦点时不响应  只有显示隐藏时才响应
            window.removeEventListener("focus", context.resume, false);
            window.removeEventListener("blur", context.pause, false);
            self.stage = s;
            //s.addEventListener( egret.Event.ENTER_FRAME, self.update, self );
            s.addEventListener(egret.Event.ACTIVATE, s.invalidate, s);
            self._lastTime = egret.getTimer();
            cui.uiMgr.initState(s);
            TRain.soundMgr = new TRain.SoundManager();
        }

        //---------------------------------------------------------------
        public setTimeScale( val:number ):void
        {
            this._timeScale = val;
        }

        public addNextDo(doFun:Function, target:any, ...args):void{
            this._nextDos.push( {doFun:doFun, thisObj:target, args:args} );
        }

        public addDelayDo(doFun:Function, target:any, delay:number, flag?:number, canScale?:boolean, ...args ):number
        {
            flag = flag || 0;
            canScale = !!canScale;
            let self = this;
            let delayDos = self._delayDos;
            let id = ++self._uid;

            let obj:IDelayDo;
            let objs = this._freeDelayObjs;
            if( objs.length > 0 )
            {
                obj = objs.pop();
                obj.flag = flag;
                obj.doFun = doFun;
                obj.thisObj = target;
                obj.delay = delay;
                obj.canScale = canScale;
                obj.args = args;
                obj.uuid = id;
            }
            else
            {
                obj = {flag:flag, doFun:doFun, thisObj:target, delay:delay, canScale:canScale, args:args, uuid:id};
            }

            delayDos.unshift( obj );
            return id;
        }

        private freeDelayObj( obj:IDelayDo ):void
        {
            let freeObjs = this._freeDelayObjs;
            if( freeObjs.length < 30 )
            {
                obj.doFun = null;
                obj.thisObj = null;
                obj.args = null;
                freeObjs.push( obj );
            }
        }

        public rmvDelayDo( doFun:Function, target:any ):void
        {
            let delayDos = this._delayDos;
            let cnt = delayDos.length;
            if( cnt <= 0 ) return;

            for( let i=cnt-1; i>=0; --i )
            {
                let delayDo = delayDos[i];
                if( delayDo.thisObj == target && delayDo.doFun == doFun )
                {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                    break;
                }
            }
        }

        public rmvAllDelayDo( target:any ):void
        {
            let delayDos = this._delayDos;
            let cnt = delayDos.length;
            if( cnt <= 0 ) return;

            for( let i=cnt-1; i>=0; --i )
            {
                let delayDo = delayDos[i];
                if( delayDo.thisObj == target )
                {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                }
            }
        }

        public rmvDelayDoByFlag( flag:number ):void
        {
            let delayDos = this._delayDos;
            let cnt = delayDos.length;
            if( cnt <= 0 ) return;

            flag = flag || 0;
            for( let i=cnt-1; i>=0; --i )
            {
                let delayDo = delayDos[i];
                if( delayDo.flag == flag )
                {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                }
            }
        }

        public rmvDelayDoByID( id:number ):void
        {
            let delayDos = this._delayDos;
            let cnt = delayDos.length;
            if( cnt <= 0 ) return;

            for( let i=cnt-1; i>=0; --i )
            {
                let delayDo = delayDos[i];
                if( delayDo.uuid == id )
                {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                    break;
                }
            }
        }

        public adjustDelayTmByID( id:number, delay:number ):void
        {
            let delayDos = this._delayDos;
            let cnt = delayDos.length;
            if( cnt <= 0 ) return;

            for( let i=cnt-1; i>=0; --i )
            {
                let delayDo = delayDos[i];
                if( delayDo.uuid == id )
                {
                    delayDo.delay = delay;
                    break;
                }
            }
        }

        //------------------------------------ 帧回调 -----------------------------------------------
        public addFrameDo( doFun:Function, target:any, canScale?:boolean, interval?:number ):number
        {
            canScale = !!canScale;

            let self = this;
            let frameDos = self._frameDos;

            let id = ++self._uid;
            let frameDo:IFrameDo = { doFun:doFun, thisObj:target, canScale:canScale, uuid:id };
            if( interval && interval>35 )
            {
                frameDo.interval = interval;
                frameDo.lostTm = 0;
            }
            frameDos.push( frameDo );
            return id;
        }

        public rmvAllFrameDo():void
        {
            this._frameDos = [];
        }

        public rmvFrameDoById( id:number ):void
        {
            let frameDos = this._frameDos;
            let cnt = frameDos.length;
            if( cnt <= 0 ) return;

            for( let i=cnt-1; i>=0; --i )
            {
                let frameDo:IFrameDo = frameDos[i];
                if( frameDo.uuid == id )
                {
                    frameDo.doFun = null;
                    frameDo.thisObj = null;
                    break;
                }
            }
        }

        public rmvFrameDo( thisObj:any, doFun?:Function ):void
        {
            let frameDos = this._frameDos;
            let cnt = frameDos.length;
            if( cnt <= 0 ) return;

            let i=cnt-1;
            let frameDo:IFrameDo;
            if( doFun )
            {
                for( ; i>=0; --i )
                {
                    frameDo = frameDos[i];
                    if( frameDo.thisObj == thisObj && frameDo.doFun == doFun )
                    {
                        frameDo.doFun = null;
                        frameDo.thisObj = null;
                        break;
                    }
                }
            }
            else
            {
                for( ; i>=0; --i )
                {
                    frameDo = frameDos[i];
                    if( frameDo.thisObj == thisObj )
                    {
                        frameDo.doFun = null;
                        frameDo.thisObj = null;
                    }
                }
            }

        }

        private _lastTime:number;
        private update():void
        {
            let self = this;
            let tm:number = egret.getTimer();
            let lostTime:number = tm - self._lastTime;
            let passedTime:number = Math.floor(lostTime*self._timeScale);
            self._lastTime = tm;
  
            let nextDos = self._nextDos;
            let cnt = nextDos.length;
            let i:number;
            if( cnt>0 ){
                self._nextDos = [];
                for( i=0; i<cnt; ++i )
                {
                    let nextDo = nextDos[i];
                    nextDo.doFun.apply( nextDo.thisObj, nextDo.args );
                }
            }

            let delayDos = self._delayDos;
            cnt = delayDos.length;
            if( cnt>0 )
            {
                for( i=cnt-1; i>=0; --i )
                {
                    let delayDo = delayDos[i];
                    if( delayDo.doFun )
                    {
                        delayDo.delay -= delayDo.canScale ? passedTime : lostTime;
                        if( delayDo.delay<=0 )
                        {
                            delayDos.splice(i, 1);
                            delayDo.doFun.apply( delayDo.thisObj, delayDo.args );
                            self.freeDelayObj(delayDo);
                        }
                    }
                    else
                    {
                        delayDos.splice(i, 1);
                        self.freeDelayObj(delayDo);
                    }
                }
            }

            let frameDos = self._frameDos;
            cnt = frameDos.length;
            if( cnt > 0 )
            {
                for( i=cnt-1; i>=0; --i )
                {
                    let frameDo = frameDos[i];
                    if( frameDo.doFun )
                    {
                        let tmpTime = frameDo.canScale ? passedTime : lostTime;
                        let interval = frameDo.interval;
                        if( interval )
                        {
                            let lostTm = frameDo.lostTm + tmpTime;
                            frameDo.lostTm = lostTm;
                            if( lostTm>=interval )
                            {
                                frameDo.lostTm = lostTm%interval;
                                frameDo.doFun.call( frameDo.thisObj, lostTm );
                            }
                        }
                        else
                        {
                            frameDo.doFun.call( frameDo.thisObj, tmpTime );
                        }
                    }
                    else
                    {
                        frameDos.splice(i, 1);
                    }
                }
            }
        }
    }

    export let core = new Core();
}