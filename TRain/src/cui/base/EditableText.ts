module cui
{
    export const enum EditableTextKeys
    {
        promptText,
        textColorUser,
        asPassword
    }

    export class EditableText extends egret.TextField implements IDisplayText
    {
        public tag:number;
        public ud:any;

        protected _disposed:boolean;//是否已销毁

        private _showPrompt:boolean;
        private _isFocusIn: boolean = false;

        private _promptColor: number = 0x666666;

        protected $EditableText:any[];

        protected _invalidProps:number;
        protected _invalidPropsFlag:boolean;

        protected $BC:any[];

        public constructor() {
            super();

            let self = this;
            self.type = egret.TextFieldType.INPUT;
            self._isFocusIn = false;

            self.$EditableText = [
                null,         //promptText,
                0xffffff,     //textColorUser,
                false         //asPassword
            ];

            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false, //pLayout
            ];
            self._invalidProps = 0;
        }

        public dispose():void
        {
            this._disposed = true;
        }

        public get filterNm():string{
            return this.$BC[BaseUIKeys.filterNm];
        }

        public set filterNm( nm:string ){
            this.$BC[BaseUIKeys.filterNm] = nm;
            this.filters = nm&&nm.length>0 ? uiMgr.getFilters(nm) : null;
        }

        //----------------------------------------------------------------
        public $onAddToStage(stage: egret.Stage, nestLevel: number): void
        {
            super.$onAddToStage(stage, nestLevel);

            let self = this;
            self.addEventListener(egret.FocusEvent.FOCUS_IN, self.onfocusIn, self);
            self.addEventListener(egret.FocusEvent.FOCUS_OUT, self.onfocusOut, self);
            if( self._invalidProps>0 )
            {
                self.validateProps();
            }
        }

        public $onRemoveFromStage(): void
        {
            super.$onRemoveFromStage();

            let self = this;
            self.removeEventListener(egret.FocusEvent.FOCUS_IN, self.onfocusIn, self);
            self.removeEventListener(egret.FocusEvent.FOCUS_OUT, self.onfocusOut, self);
        }


        private onfocusOut(): void
        {
            let self = this;
            self._isFocusIn = false;
            if (!self.text)
            {
                self.showPromptText();
            }
        }

        private onfocusIn(): void
        {
            let self = this;
            self._isFocusIn = true;
            self._showPrompt = false;
            self.displayAsPassword = self.$EditableText[EditableTextKeys.asPassword];
            let values = self.$EditableText;
            let text = self.text;
            if (!text || text == values[EditableTextKeys.promptText])
            {
                self.textColor = values[EditableTextKeys.textColorUser];
                self.text = "";
            }
        }

        //-----------------------------------------------
        $getText():string
        {
            let value = super.$getText();
            if(value == this.$EditableText[EditableTextKeys.promptText])
            {
                value = "";
            }
            return value;
        }

        $setText(value: string): boolean
        {
            let self = this;
            let promptText = self.$EditableText[EditableTextKeys.promptText];
            if (promptText != value || promptText == null) {
                self._showPrompt = false;
                self.textColor = self.$EditableText[EditableTextKeys.textColorUser];
            }
            if (!self._isFocusIn) {
                if (value == "" || value == null) {
                    value = promptText;
                    self._showPrompt = true;
                    super.$setTextColor(self._promptColor);
                }
            }
            let result: boolean = super.$setText(value);
            return result;
        }

        public get prompt(): string
        {
            return this.$EditableText[EditableTextKeys.promptText];
        }
        public set prompt(value: string)
        {
            let self = this;
            let values = self.$EditableText;
            let promptText = values[EditableTextKeys.promptText];
            if (promptText == value)
                return;
            values[EditableTextKeys.promptText] = value;
            let text = self.text;
            if (!text || text == promptText) {
                self.showPromptText();
            }
        }

        //------------------------------------------
        public set promptColor(value: number)
        {
            value = +value | 0;
            let self = this;
            if (self._promptColor != value)
            {
                self._promptColor = value;
                let text = self.text;
                if (!text || text == self.$EditableText[EditableTextKeys.promptText])
                {
                    self.showPromptText();
                }
            }
        }
        public get promptColor(): number
        {
            return this._promptColor;
        }

        private showPromptText(): void
        {
            let self = this;
            let values = self.$EditableText;
            self._showPrompt = true;
            super.$setTextColor(self._promptColor);
            super.$setDisplayAsPassword(false);
            self.text = values[EditableTextKeys.promptText];
        }

        //------------------------------------------
        $setTextColor(value: number): boolean
        {
            value = +value | 0;
            let self = this;
            self.$EditableText[EditableTextKeys.textColorUser] = value;
            if (!self._showPrompt)
            {
                super.$setTextColor(value);
            }
            return true;
        }
        /**
         * @private
         */
        $setDisplayAsPassword(value: boolean): boolean
        {
            let self = this;
            self.$EditableText[EditableTextKeys.asPassword] = value;
            if (!self._showPrompt)
            {
                super.$setDisplayAsPassword(value);
            }
            return true;
        }

        //-------------------------------------------------------------
        $setWidth(value:number):boolean
        {
            let ret = super.$setWidth( value );
            if( ret )
            {
                this.invalidateProps( PropertyType.size );
            }
            return ret;
        }
        $setHeight(value:number):boolean
        {
            let ret = super.$setHeight( value );
            if( ret )
            {
                this.invalidateProps( PropertyType.size );
            }
            return ret;
        }


        //---------------------------------------------------------------------
        public get left():number
        {
            return this.$BC[BaseUIKeys.left];
        }

        public set left(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.left] === value)
                return;
            values[BaseUIKeys.left] = value;
            this.setNeedPLayout();
        }
        /**
         * 距父级容器右边距离
         */
        public get right():number
        {
            return this.$BC[BaseUIKeys.right];
        }

        public set right(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.right] === value)
                return;
            values[BaseUIKeys.right] = value;
            this.setNeedPLayout();
        }

        public get top():number
        {
            return this.$BC[BaseUIKeys.top];
        }

        public set top(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.top] === value)
                return;
            values[BaseUIKeys.top] = value;
            this.setNeedPLayout();
        }
        /**
         * 距父级容器底部距离
         */
        public get bottom():number
        {
            return this.$BC[BaseUIKeys.bottom];
        }

        public set bottom(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.bottom] == value)
                return;
            values[BaseUIKeys.bottom] = value;
            this.setNeedPLayout();
        }

        /**
         * 在父级容器中距水平中心位置的距离
         */
        public get hCenter():number
        {
            return this.$BC[BaseUIKeys.hCenter];
        }

        public set hCenter(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.hCenter] === value)
                return;
            values[BaseUIKeys.hCenter] = value;
            this.setNeedPLayout();
        }

        /**
         * 在父级容器中距竖直中心位置的距离
         */
        public get vCenter():number
        {
            return this.$BC[BaseUIKeys.vCenter];
        }

        public set vCenter(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.vCenter] === value)
                return;
            values[BaseUIKeys.vCenter] = value;
            this.setNeedPLayout();
        }

        public get perWidth():number
        {
            return this.$BC[BaseUIKeys.perWidth];
        }

        public set perWidth(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.perWidth] === value)
                return;

            values[BaseUIKeys.perWidth] = value;
            this.setNeedPLayout();
        }

        public get perHeight():number
        {
            return this.$BC[BaseUIKeys.perHeight];
        }

        public set perHeight(value:number)
        {
            value = +value;
            let values = this.$BC;
            if (values[BaseUIKeys.perHeight] === value)
                return;

            values[BaseUIKeys.perHeight] = value;
            this.setNeedPLayout();
        }

        public get needPLayout():boolean
        {
            return this.$BC[BaseUIKeys.needPLayout];
        }

        protected setNeedPLayout():void
        {
            let self = this;
            let values = self.$BC;
            let parent = <BaseContainer>self.$parent;
            if ( !values[BaseUIKeys.needPLayout] )
            {
                values[BaseUIKeys.needPLayout] = true;
                if( parent )
                {
                    parent.openLayout();
                }
            }

            if( parent )
            {
                parent.invalidateDL();
            }
        }
        //--------------------------------------------------

        protected invalidateProps( tp:PropertyType ):void
        {
            let self = this;
            if( self.$stage && !self._invalidPropsFlag )
            {
                self._invalidPropsFlag = true;
                uiMgr.invalidateProperty( self );
            }
            self._invalidProps |= tp;
        }

        public validateProps():void
        {
            let self = this;
            let invalidateProps = self._invalidProps;
            if( invalidateProps != 0 )
            {
                let values = self.$BC;
                if( values[BaseUIKeys.needPLayout] && self.$parent )
                {
                    if( self.$getText() != "" )
                    {
                        (<IBaseContainer><any>self.$parent).invalidateDL();
                    }
                }

                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        }
    }
}