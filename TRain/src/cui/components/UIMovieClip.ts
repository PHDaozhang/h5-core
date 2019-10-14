/**
 * Created by wjdeng on 2015/12/27.
 */

module cui
{
    export class UIMovieClip extends BaseContainer
    {
        //---------------------------------------------------------------------------------
        protected _runing:boolean;
        protected _clip:TRain.MovieClip;
        protected _clipData:TRain.MovieClipData;
        protected _reverseData:TRain.MovieClipData;

        protected _reverse:boolean;

        protected _playData:any;
        protected _stopFrame:number;//停止帧数

        protected _aniName:string;

        public anitp:number = 0; //动画类型
        public autoPlay:boolean = false;

        constructor()
        {
            super();

            let self = this;
            self._runing = false;
            self._reverse = false;
            self._stopFrame = NaN;
            let clip = new TRain.MovieClip();
            self._clip = clip;
            clip.addEventListener( egret.Event.COMPLETE, self.onAniFin, self );
            self.addChild( clip );
        }

        public $hitTest(stageX:number, stageY:number):egret.DisplayObject
        {
            return null;
        }
        public get aniName():string
        {
            return this._aniName;
        }

        /**
         * 动画名
         * @param name 使用"."间隔。 格式为：mcName.aniName   文件名.动作名
         * 如果没有使用间隔。默认aniName = mcName
         *
         * */
        public set aniName( name:string )
        {
            let self = this;
            name = (!!name) ? name : null;
            if( self._aniName == name ) return;

            self._aniName = name;
            self.freeClipData();
            if( name )
            {
                if( self._inited )
                {
                    self.loadMCData();
                }
            }
        }

        protected childrenCreated():void
        {
            super.childrenCreated();

            let self = this;
            if( self._aniName )
            {
                self.loadMCData();
            }
        }

        public dispose():void
        {
            let self = this;
            self.freeClipData();
            let clip = self._clip;
            clip.dispose();
            clip.removeEventListener( egret.Event.COMPLETE, self.onAniFin, self );

            super.dispose();
        }

        $onAddToStage(stage:egret.Stage, nestLevel:number):void
        {
            super.$onAddToStage(stage, nestLevel);

            let self = this;
            if( self._clipData && self._runing )
            {
                TRain.mcMgr.add( self._clip );
            }
        }

        $onRemoveFromStage():void
        {
            super.$onRemoveFromStage();

            let self = this;
            if( self._clipData && self._runing )
            {
                TRain.mcMgr.remove( self._clip );
            }
        }

        //------------------------------- load --------------------------------------
        //加载动画数据
        protected loadMCData():void
        {
            let self = this;
            let aniName = self._aniName;
            let idx = aniName.indexOf( "." );
            if( idx<0 ){
                TRain.mcMgr.getMCDataAsync( self.anitp, aniName, self.onLoadDataFinish, self );
            }
            else{
                TRain.mcMgr.getMCDataAsync( self.anitp, aniName.substr(0,idx), self.onLoadDataFinish, self, aniName.substring(idx+1) );
            }        
        }

        protected onLoadDataFinish( clipData:TRain.MovieClipData, anitp:number ):void
        {
            if( !clipData ) return;

            let self = this;

            if( anitp != self.anitp )
            {
                TRain.mcMgr.freeMCData( self.anitp, clipData );
                return;
            }

            let aniName = self._aniName;
            if(aniName == null) return;

            let idx = aniName.indexOf( "." );
            let tmpName = idx<0 ? clipData.resName : clipData.resName+"."+clipData.aniName;
            if( aniName != tmpName )
            {
                TRain.mcMgr.freeMCData( self.anitp, clipData );
                return;
            }
            
            self._clipData = clipData;
            if( self._reverse )
            {
                let reverseData = clipData.clone( true );
                self._reverseData = reverseData;
                clipData = reverseData;
            }
            self._clip.movieClipData = clipData;


            let plyData = self._playData;
            if( plyData )
            {
                self.play( plyData.frame, plyData.playTimes );
            }
            else if( self.autoPlay )
            {
                self.play();
            }
            else if(!isNaN(self._stopFrame))
            {
                let clip = self._clip;
                clip.gotoAndStop( self._stopFrame );
                if( self.stage && self._runing )
                {
                    TRain.mcMgr.remove( clip );
                }
                self._runing = false;
            }

            self.dispatchEventWith( cui.UI_EVENT.EVT_CREATED, false );
            self.invalidateDL();
        }

        protected reverseChanged( reverse ):void
        {
            let self = this;
            self._reverse = reverse;
            let clipData:TRain.MovieClipData;
            if( reverse )
            {
                clipData = self._reverseData;
                if( !clipData )
                {
                    clipData = self._clipData.clone( true );
                }
            }
            else
            {
                clipData = self._clipData
            }
            self._clip.movieClipData = clipData;
        }
        //---------------------------------------------------------------------
        public gotoAndPlay( frame:number=0, playTimes:number=0, reverse:boolean=false ):void
        {
            let self = this;
            let clipData = self._clipData;
            if( clipData )
            {
                if( self._reverse != reverse )
                {
                    self.reverseChanged( reverse );
                }

                self.play( frame, playTimes );
            }
            else
            {
                self._reverse = reverse;
                self._playData = { frame:frame,playTimes:playTimes };
            }
        }

        private play( frame:number=0, loop:number=NaN ):void
        {
            let self = this;
            self._runing = true;
            let clip = self._clip;
            clip.gotoAndPlay( frame, loop );
            if( self.stage )
            {
                TRain.mcMgr.add( clip );
            }
        }

        public gotoAndStop( frame:number, reverse:boolean=false ):void
        {
            let self = this;
            let clipData = self._clipData;
            if( clipData )
            {
                if( self._reverse != reverse )
                {
                    self.reverseChanged( reverse );
                }

                let clip = self._clip;
                clip.gotoAndStop( frame );
                if( self.stage && self._runing )
                {
                    TRain.mcMgr.remove( clip );
                }
                self._runing = false;
            }
            else
            {
                self._stopFrame = frame;
            }
        }

        public stop():void
        {
            let self = this;
            let clip = self._clip;
            if( clip && self._runing )
            {
                self._runing = false;
                clip.stop();
                if( self.stage )
                {
                    TRain.mcMgr.remove( clip );
                }
            }
        }

        protected onAniFin( e:Event ):void
        {
            let self = this;
            self._runing = false;
            let clip = self._clip;
            TRain.mcMgr.remove( clip );

            self.dispatchEventWith( cui.UI_EVENT.EVT_PLAY_FIN, false )
        }

        protected freeClipData():void
        {
            let self = this;
            let clipData:TRain.MovieClipData = self._clipData;
            if( clipData )
            {
                self.stop();
                self._reverseData = null;
                self._clipData = null;
                self._clip.movieClipData = null;

                TRain.mcMgr.freeMCData( self.anitp, clipData );
            }
        }
    }
}
