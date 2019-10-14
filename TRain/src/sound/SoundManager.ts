module TRain
{

    // declare class Howl{
    //     constructor( data:{src:string[], loop?:boolean, volume?:number} );
    //     tag:number;
    //     playing();
    //     play();
    //     stop();
    //     unload();
    //     volume(val:number);
    // }


    // export class SoundManager
    // {

    //     private static UUID = 1;//统一 channel id

    //     private _musicState:boolean;//背景音乐的开关状态
    //     private _musicVol:number;//音乐音量

    //     private _sfxState:boolean;//
    //     private _sfxVol:number;//音效音量

    //     private _curMusic:Howl;
    //     private _musicNm:string;
    //     private _musicLoop:boolean;

    //     private _sfxList:{[key:string]:{ids:number[],sounds:Howl[]}};
    //     private _resList:string[];
    //     constructor()
    //     {
    //         let self = this;
    //         self._resList = [];
    //         self._musicVol = 0.5;
    //         self._sfxVol = 1;

    //         self._sfxList = {};//url
    //     }

    //     //-------------------开关
    //     public get musicState():boolean
    //     {
    //         return this._musicState;
    //     }
    //     public set musicState(value:boolean)
    //     {
    //         let self = this;
    //         if(self._musicState == value)return;

    //         self._musicState = value;
    //         if(value)
    //         {
    //            //重新播放当前设置的背景音乐
    //             self.playMusic(self._musicNm, true);
    //         }
    //         else
    //         {
    //             //关闭背景音乐
    //             self.stopMusic();
    //         }
    //     }

    //     public get musicVol():number
    //     {
    //         return this._musicVol;
    //     }
    //     public set musicVol(value:number)
    //     {
    //         let self = this;
    //         if(self._musicVol == value)return;

    //         self._musicVol = value;

    //         let curMusic = self._curMusic;
    //         if(curMusic)
    //         {
    //            curMusic.volume( value );
    //         }
    //     }

    //     public get sfxState():boolean
    //     {
    //         return this._sfxState;
    //     }
    //     public set sfxState(value:boolean)
    //     {
    //         let self = this;
    //         if(self._sfxState == value)return;
    //         self._sfxState = value;
    //         if(!value)
    //         {
    //             //关闭当前特效声音
    //             self.stopAllSFX();
    //         }
    //     }

    //     public get sfxVol():number
    //     {
    //         return this._sfxVol;
    //     }
    //     public set sfxVol(value:number)
    //     {
    //         let self = this;
    //         if(self._sfxVol == value)return;

    //         self._sfxVol = value;

    //         let curMusic = self._curMusic;
    //         if(curMusic)
    //         {
    //            curMusic.volume( value );
    //         }
    //     }

    //     private getUrl( name:string ):string{
    //         return CONF.soundUrl + name + ".mp3";
    //     }

    //     private loadSound( url:string, cb:(url:string)=>void, tar:any ){
    //         let self = this;
    //         let resList = self._resList;
    //         if( resList.indexOf(url)>=0 ){
    //             cb.call( tar, url );
    //         }
    //         else{
    //             RES.getResByUrl( url, function( data:any, url:string ){
    //                 if(data) {
    //                     resList.push( url );
    //                     cb.call( tar, url );
    //                 }
    //             }, self );
    //         }
    //     }

    //     /**
    //      * 播放背景音乐
    //      * @param name:string 背景音乐名字
    //      * */
    //     public playMusic( name:string, loop?:boolean ):void
    //     {
    //         let self = this;
    //         if( !name && self._musicNm == name ) return;

    //         let url = self.getUrl( name );
    //         if( self._musicNm == url ) return;

    //         self._musicNm = url;
    //         self._musicLoop = loop;
    //         if( !self._musicState )return;

    //         self.stopMusic();
    //         self.loadSound( url, self.onMusicLoad, self );
    //     }

    //     private onMusicLoad( url:string ){
    //         let self = this;
    //         if( !self._musicState || url != self._musicNm )return;

    //         let music = self._curMusic = new Howl({src:[url], loop:self._musicLoop, volume:self._musicVol});
    //         music.play();
    //     }

    //     /**
    //      * 关闭背景音乐
    //      * */
    //     public stopMusic():void
    //     {
    //         let self = this;
    //         let curMusic = self._curMusic;
    //         if( curMusic )
    //         {
    //             curMusic.stop();
    //             self._curMusic = null;
    //         }
    //     }

    //     /**
    //      * 播放音效
    //      * @param url:string 音效路径
    //      * @param delay:number 延时多久后开始播放， 单位毫秒 默认为0
    //      * @param duration:number 持续时间。值若大于0，表示持续时间到了就关闭音效。0代表不做时间限制。单位毫秒。默认为0
    //      * @return number 当前音效序列id，可用于停止音效使用。
    //      * */
    //     public playSFX(name:string, delay:number = 0, duration:number=0):number
    //     {
    //         let self = this;
    //         if(!self._sfxState || !name) return 0;

    //         let url = self.getUrl( name );
    //         let uuid = SoundManager.UUID++;

    //         let soundData = self._sfxList[url];
    //         if ( !soundData )
    //         {
    //             soundData = self._sfxList[url] = {ids:[], sounds:[]};
    //         }
    //         soundData.ids.push( uuid );

    //         let soundConf = {url:url, duration:duration, uuid:uuid};
    //         if(delay > 0)
    //         {
    //             TRain.core.addDelayDo(function(){
    //                 self.loadSound( url, function(){
    //                     self._playSfx( soundConf );
    //                 }, self );
    //             }, self, delay, 0, false, soundConf);
    //         }
    //         else
    //         {
    //             self.loadSound( url, function(){
    //                 self._playSfx( soundConf );
    //             }, self );
    //         }
    //         return uuid;
    //     }

    //     public stopSFX(id:number):void
    //     {
    //         this.stopSfxById(id);
    //     }

    //     public stopAllSFX():void
    //     {
    //         let sfxList = this._sfxList;
    //         this._sfxList = {};
    //         for( let key in sfxList )
    //         {
    //             let soundData = sfxList[key];
    //             soundData.ids.length = 0;
    //             let sounds = soundData.sounds;
    //             for( let sound of sounds ){
    //                 sound.tag = 0;
    //                 sound.stop();
    //             }
    //         }
    //     }

    //     private _playSfx(soundConf:{url:string, duration:number, uuid:number}):void
    //     {
    //         let self = this;
    //         if(!self._sfxState) return;

    //         let url = soundConf.url;
    //         let soundData = self._sfxList[url];
    //         let uuid = soundConf.uuid;
    //         let ids = soundData.ids;
    //         if( ids.indexOf(uuid)>=0 ){
    //             let sounds = soundData.sounds;
    //             let findSound:Howl;
    //             for( let sound of sounds ){
    //                 if( !sound.playing() ){
    //                     findSound = sound;
    //                     break;
    //                 }
    //             }

    //             if( findSound ){
    //                 if( findSound.tag ){
    //                     let idx = ids.indexOf( findSound.tag );
    //                     if( idx>=0 ) ids.splice( idx, 1 );
    //                 }
    //             }
    //             else{
    //                 findSound = new Howl({src:[url], volume:self._sfxVol});
    //                 sounds.push( findSound );
    //             }
                
    //             findSound.tag = uuid;
    //             findSound.play();

    //             let duration = soundConf.duration;
    //             if(duration > 0)
    //             {
    //                 TRain.core.addDelayDo(self.stopSfxById, self, duration, 0, false, uuid);
    //             }
    //         }
    //     }

    //     //------------------------------------------------------------------
    //     public stopSfxById( uuid:number ):void
    //     {
    //         let sfxList = this._sfxList;
    //         for( let key in sfxList ){
    //             let soundData = sfxList[key];
    //             let ids = soundData.ids;
    //             let idx = ids.indexOf( uuid );
    //             if( idx>=0 ){
    //                 ids.splice( idx, 1 );
    //                 let sounds = soundData.sounds;
    //                 for( let sound of sounds ){
    //                     if( sound.tag == uuid ){
    //                         sound.tag = 0;
    //                         sound.stop();
    //                         break;
    //                     }
    //                 }
    //                 break;
    //             }
    //         }
    //     }

    //     public gcRess():void
    //     {
    //         let rmvs = [];
    //         let sfxList = this._sfxList;
    //         let key:string;
    //         for( key in sfxList ){
    //             let soundData = sfxList[key];
    //             let ids = soundData.ids;
    //             let sounds = soundData.sounds;
    //             let inplay = false;
    //             if( ids.length > 0 ){
    //                 for( let sound of sounds ){
    //                     if( sound.playing() ){
    //                         inplay = true;
    //                         break;
    //                     }
    //                 }
    //             }

    //             if( !inplay ){
    //                 ids.length = 0;
    //                 for( let sound of sounds ){
    //                     sound.unload();
    //                 }
    //                 sounds.length = 0;
    //                 rmvs.push(key);
    //             }
    //         }

    //         let resList = this._resList;
    //         let musicNm = this._musicNm;
    //         for( key in resList ){
    //             if( !sfxList[key] && key != musicNm ){
    //                 rmvs.push( key );
    //             }
    //         }

    //         for( key of rmvs )
    //         {
    //             delete resList[key];
    //             RES.destroyRes( key );
    //         }
    //     }

    // }
    
    interface ISoundPlaying
    {
        sound:egret.Sound;
        channels:CMap<number,egret.SoundChannel>;
        nm:string;
        loaded:boolean;
        stoped:boolean;
    }


    export class SoundManager
    {
        private _active:boolean = true;
        private static UUID = 1;//统一 channel id

        private _musicState:boolean;//背景音乐的开关状态
        private _sfxState:boolean;//

        private _curMusic:{sound:egret.Sound, channel:egret.SoundChannel};
        private _musicNm:string;

        private _sfxs:CMap<string, ISoundPlaying>;
        private _plays:CMap<number, ISoundPlaying>;
        constructor()
        {
            let self = this;
            self._active = true;
            self._curMusic = {sound:null, channel:null};
            self._sfxs = new CMap<string,ISoundPlaying>();//url
            self._plays = new CMap<number,ISoundPlaying>();
            var stage = TRain.core.stage;
            stage.addEventListener(egret.Event.ACTIVATE, function () {
                self._active = true;
                if (self._musicState && self._musicNm) {
                    self.playMusic(self._musicNm, true);
                }
            }, self);
            stage.addEventListener(egret.Event.DEACTIVATE, function () {
                self._active = false;
                self.stopAllSFX();
                self.stopMusic();
            }, self);
        }

        //-------------------开关
        public get musicState():boolean
        {
            return this._musicState;
        }
        public set musicState(value:boolean)
        {
            let self = this;
            if(self._musicState == value)return;

            self._musicState = value;
            if(value && self._active)
            {
               //重新播放当前设置的背景音乐
                self.playMusic(self._musicNm, true);
            }
            else
            {
                //关闭背景音乐
                self.stopMusic();
            }
        }
        public get sfxState():boolean
        {
            return this._sfxState;
        }
        public set sfxState(value:boolean)
        {
            let self = this;
            if(self._sfxState == value)return;
            self._sfxState = value;
            if(!value)
            {
                //关闭当前特效声音
                self.stopAllSFX();
            }
        }

        private getUrl(name:string):string
        {
            return CONF.soundUrl + name + ".mp3";
        }

        /**
         * 播放背景音乐
         * @param url:string 背景音乐路径
         * */
        public playMusic(name:string, force?:boolean):void
        {
            let self = this;
            if(!name || (self._musicNm == name && !force)){
                return;
            }

            self._musicNm = name;
            if(!self._musicState || !self._active)return;
            self.stopMusic();
            let sound = new egret.Sound();
            sound.addEventListener(egret.Event.COMPLETE, function(event:egret.Event){
                let sound:egret.Sound = event.target;
                if(name != self._musicNm)
                {
                    sound.close();
                    return;
                }
                let curMusic = self._curMusic;
                let channel = sound.play();
                curMusic.sound = sound;
                curMusic.channel = channel;
            }, self);


            sound.load( RES.$getVirtualUrl( self.getUrl(name) ));

        }
        /**
         * 关闭背景音乐
         * */
        public stopMusic():void
        {
            let self = this;
            let curMusic = self._curMusic;
            if( curMusic.channel )
            {
                curMusic.channel.stop();
                curMusic.channel = null;
            }

            if( curMusic.sound )
            {
                curMusic.sound.close();
                curMusic.sound = null;
            }
        }

        /**
         * 播放音效
         * @param url:string 音效路径
         * @param delay:number 延时多久后开始播放， 单位毫秒 默认为0
         * @param duration:number 持续时间。值若大于0，表示持续时间到了就关闭音效。0代表不做时间限制。单位毫秒。默认为0
         * @return number 当前音效序列id，可用于停止音效使用。
         * */
        public playSFX(name:string, delay:number = 0, duration:number=0):number
        {
            let self = this;
            if(!self._sfxState || !self._active ||  !name) return 0;

            let uuid:number = SoundManager.UUID++;
            let soundConf = {nm:name, delay:delay, duration:duration, uuid:uuid};
            if(delay > 0)
            {
                TRain.core.addDelayDo(self._playSfx, self, delay, 0, false, soundConf);
            }
            else
            {
                self._playSfx(soundConf);
            }
            return uuid;
        }

        public stopSFX(id:number):void
        {
            this.rmvChannelById(id);
        }

        public stopAllSFX():void
        {
            let sfxMap = this._sfxs;
            let playings = sfxMap.values;
            for( let i=0, n=playings.length; i<n; ++i )
            {
                let playing = playings[i];
                playing.stoped = true;
                if( playing.loaded )
                {
                    let channels = playing.channels.values;
                    for( let j=0, m=channels.length; j<m; ++j )
                    {
                        let channel = channels[j];
                        channel.stop();
                    }
                    playing.sound.close();
                }
            }
            sfxMap.clear();
            this._plays.clear();
        }

        private _playSfx(soundConf:{nm:string, delay:number, duration:number, uuid:number}):void
        {
            let self = this;
            if(!self._sfxState || !self._active) return;

            let uuid = soundConf.uuid;
            let duration = soundConf.duration;
            if(duration > 0)
            {
                TRain.core.addDelayDo(self.rmvChannelById, self, duration, 0, false, uuid);
            }

            let name = soundConf.nm;
            let sfxData = self._sfxs.get(name);
            if (sfxData)
            {
                if( !sfxData.loaded ) return;

                self.playImpl( sfxData, 1, soundConf.uuid );
                return;
            }

            let sound = new egret.Sound();
            let channels = new CMap<number,egret.SoundChannel>();
            sfxData = {sound:sound, channels:channels, nm:name, loaded: false, stoped:false};
            self._sfxs.set( name, sfxData );
            self.addChannel(sfxData, null, uuid);
            let callback = function ( event:egret.Event ) {
                if( sfxData.stoped )
                {
                    sfxData.sound.close();
                }
                else
                {
                    sfxData.loaded = true;
                    let channels = sfxData.channels;
                    if( channels.has(uuid))
                    {
                        self.playImpl( sfxData, 1, uuid );
                    }
                }
            };
            sound.addEventListener(egret.Event.COMPLETE, callback, self);

            let url = self.getUrl(name);
            sound.load( RES.$getVirtualUrl( url )  );
            return;
        }

        //------------------------------------------------------------------
        private playImpl( playing:ISoundPlaying, loops:number, uuid:number ):void
        {
            let self = this;
            let channel = playing.sound.play( 0, loops );
            self.addChannel(playing, channel, uuid);
            (channel as any).uuid = uuid;
            channel.addEventListener( egret.Event.SOUND_COMPLETE, self.onSoundComplete, self );
            playing.channels.set( uuid, channel );
        }

        private addChannel( playing:ISoundPlaying, channel:egret.SoundChannel , uuid:number):void
        {
            playing.channels.set( uuid, channel );
            this._plays.set( uuid, playing );
        }

        private rmvChannelById( uuid:number ):void
        {
            let playingMap = this._plays;
            let playing:ISoundPlaying = playingMap.get( uuid );
            if( playing )
            {
                let channel = playing.channels.get( uuid );
                if( channel ) channel.stop();

                playing.channels.delete( uuid );
                playingMap.delete( uuid );
            }
        }

        private onSoundComplete(event:egret.Event):void
        {
            this.rmvChannelById( event.target.uuid );
        }

        public gcRess():void
        {
            let sfxMap = this._sfxs;
            let playings = sfxMap.values;
            let rmvs = [];
            let i = 0;
            for( i=playings.length-1; i>=0; --i )
            {
                let playing = playings[i];
                if( playing.channels.size <= 0 )
                {
                    playing.sound.close();
                    rmvs.push( playing.nm );
                }
            }

            let rmvCnt = rmvs.length;
            if( rmvCnt>0 )
            {
                for( i=rmvCnt; i>=0; --i )
                {
                    sfxMap.delete( rmvs[i] );
                }
            }
        }

    }

    export let soundMgr:SoundManager = new SoundManager();
}
