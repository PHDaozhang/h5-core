/**
 * Created by wjdeng on 2016/3/31.
 */

module cui
{
    export class Component extends BaseContainer
    {
        public hitCheckBound:boolean;//优先检测是否在区域内

        protected _skinName:string;
        protected _skin:Skin;
        protected _needRess:any;

        protected _disabled:boolean;

        //------------------------------------ skin -----------------------------------------
        public get skinName():any
        {
            return this._skinName;
        }

        public set skinName(value:any)
        {
            let self = this;
            let name = self._skinName;
            if (name == value)
                return;

            self._skinName = value;
            self.parseSkinName();
        }

        protected parseSkinName():void
        {
            let self = this;
            let skinName = self.skinName;
            let skin:any;
            if (skinName)
            {
                if (skinName.prototype)
                {
                    skin = new skinName();
                }
                else
                {
                    let clazz:any = TRain.UITheme.getSkin( skinName );
                    skin = new clazz();
                    skin.skinParts = clazz.skinParts;
                    skin.needRess = clazz.needRess;
                }
            }
            self.setSkin(skin);
        }

        protected setSkin( newSkin:Skin ):void
        {
            let self = this;
            let oldSkin = self._skin;
            if (oldSkin)
            {
                oldSkin.hostComponent = null;
                let skinParts:string[] = oldSkin.skinParts;
                let length = skinParts.length;
                for (let i = 0; i < length; i++)
                {
                    let partName = skinParts[i];
                    if (self[partName])
                    {
                        delete self[partName];
                    }
                }
                let children = oldSkin.elementsContent;
                if (children)
                {
                    length = children.length;
                    for (let i = 0; i < length; i++)
                    {
                        self.removeChild(children[i]);
                    }
                }
                self._needRess = null;
            }

            self._skin = newSkin;

            if (newSkin)
            {
                newSkin.hostComponent = self;

                let skinParts:string[] = newSkin.skinParts;
                let length = skinParts.length;
                if (skinParts) {
                    var length_2 = skinParts.length;
                    for (var i = 0; i < length_2; i++) {
                        var partName = skinParts[i];
                        self[partName] = newSkin[partName];
                    }
                }
                self._needRess = newSkin.needRess;
                let children = newSkin.elementsContent;
                if (children)
                {
                    for ( let i = children.length-1; i >= 0; i-- )
                    {
                        self.addChildAt(children[i],0);
                    }
                }
    
                TRain.core.addDelayDo( self.onPartAdded, self, 0 );
            }
            //self.invalidateDL();
        }

        protected onPartAdded(){

        }

        //------------------------------------ skin -----------------------------------------
        public get enabled():boolean
        {
            return !this._disabled;
        }

        public set enabled(value:boolean)
        {
            let self = this;
            if ( self._disabled === !value )
                return;

            self._disabled = !value;
            self.$touchEnabled = value;

            self.invalidateProps( PropertyType.state );
        }

        protected getState():string
        {
            return "";
        }

        protected commitProps():void
        {
            let self = this;
            let invalidateProps = self._invalidProps;
            if( (invalidateProps&PropertyType.state)==PropertyType.state )
            {
                let skin = self._skin;
                if( skin && skin.hasStates() )
                {
                    skin.applyState( self.getState() );
                }
            }
            super.commitProps();
        }
    }
}