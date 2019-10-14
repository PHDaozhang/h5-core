module TRain
{
    export module UITheme
    {
        let _skinMap:Object = {};
        let _skinConfs:Object = {};

        let _initFin:Function;
        let _initTar:any;
        let _curGp:string;

        export function loadInitConf( configURL:string, initFin:Function, initTar:any ):void
        {
            _initFin = initFin;
            _initTar = initTar;
            RES.getResByUrl( configURL, onConfigLoaded, UITheme, RES.ResourceItem.TYPE_JSON );
        }

        export function setCurGp( gpNm:string ):void{
            _curGp = gpNm;
        }

        export function addSkinConf( addConfs:any, gpNm?:string  ):void
        {
            let skinConfs = _skinConfs;
            if( gpNm ){
                let profix = gpNm+".";
                for( let key in addConfs ){
                    skinConfs[profix+key] = addConfs[key];
                }
            }
            else{
                for( let key in addConfs ){
                    skinConfs[key] = addConfs[key];
                }
            }
        }

        export function getSkin( name:string ):any
        {
            let cls:any = _skinMap[name];
            if( cls ) return cls;

            cls = parseSkin( name );
            if( cls ) return cls;

            if( _curGp ){
                let fullName = _curGp + "." + name;
                cls = _skinMap[fullName];
                if( cls ) return cls;

                cls = parseSkin( fullName );
            }
            return cls;
        }

        function onConfigLoaded(data:any, url:string):void
        {
            if (DEBUG)
            {
                if( !data )
                {
                    egret.$error(3000);
                }
            }

            addSkinConf( data );
            RES.destroyRes( url );
            //egret.startTick( updateInitParse, self );
             onInited();
        }

        function onInited():void
        {
            if( _initFin )
            {
                _initFin.call( _initTar );
                _initFin = null;
                _initTar = null;
            }
        }

        // function updateInitParse( tm:number ):boolean
        // {
        //     let initSkins = _skinConfs;

        //     let handle = false;
        //     for( let key in initSkins )
        //     {
        //         parseSkin( key );
        //         handle = true;
        //         break;
        //     }

        //     if( !handle )
        //     {
        //         onInited();
        //         egret.stopTick( updateInitParse, self );
        //     }
        //     return false;
        // }

        function parseSkin( name:string ):any
        {
            let skinConfs = _skinConfs;
            let skinConf = skinConfs[name];
            if( !skinConf ) return null;
                
            delete skinConfs[name];
            
            skinConf = skinConf.replace(/#4/g, "new cui.");
            skinConf = skinConf.replace(/#3/g, "return ");
            skinConf = skinConf.replace(/#2/g, "this.");
            skinConf = skinConf.replace(/#1/g, "function(");
            let cls = parse( skinConf );
            _skinMap[name] = cls;

            return cls;
        }

        function parse( code:string ):void
        {
            let clazz:any;
            try {
                clazz = eval(code);
                code = null;
            }
            catch (e) {
                if (DEBUG) {
                    egret.log(e);
                }
                return null;
            }
            return clazz;
        }
    }
}