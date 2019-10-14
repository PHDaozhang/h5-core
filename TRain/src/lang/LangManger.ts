module TRain{
    export type LangGroup = {[key:string]:string}|string[];

    export class LangManager{
        private _gpList:{[key:string]:LangGroup} = {};
        private _errGp:string[];

        public getGp(gpName:string):LangGroup{
            return this._gpList[gpName];
        }

        public getTxtByKey(key:string):string{
            let keys = key.split('#');
            let gp = this._gpList[keys[0]];
            return gp ? gp[keys[1]] : undefined;
        }

        public getTxt(gpName:string, key:string|number):string{
            let gp = this._gpList[gpName];
            return gp ? gp[key] : undefined;
        }

        public getErrText( errCode:number ):string{
            let errGp = this._errGp;
            if( errGp ) return errGp[errCode];

            errGp = <string[]>this._gpList['errCode'];
            if( errGp ){
                this._errGp = errGp;
                return errGp[errCode];
            }
            return undefined;
        }

        public addGps( gps:{[key:string]:LangGroup} ):void{
            let gpList = this._gpList;
            for( let key in gps ){
                let addGp = gps[key];
                let gp = gpList[key];
                if( gp ){
                    for( let subKey in addGp ){
                        gp[subKey] = addGp[subKey];
                    }
                }
                else{
                    gpList[key] = addGp;
                }
            }
        }
    }

    export let langMgr = new LangManager();
}