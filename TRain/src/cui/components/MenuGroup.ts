/**
 * Created by wjdeng on 2015/10/8.
 */

module cui
{
//此控件会阻碍事件
    export class MenuGroup extends Group
    {
        //--------------------------------------------
        protected _selection:MenuItem;
        protected _highLightItem:MenuItem;
        protected _items:Array<MenuItem>;
    
        protected _cb:{fun:(tar:any)=>void, tar:any};
    
        public keepSelect:boolean = false;
        public activeCheckEnable:boolean = true;
    
        public constructor()
        {
            super();
    
            let self = this;
            self._items = [];
    
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
        }

        public dispose():void
        {
            let self = this;
            self.onTouchFinish();
            self._cb = null;
            super.dispose();
        }
    
        public get selectItem():MenuItem
        {
            return this._selection;
        }
    
        public set selectItem( item:MenuItem )
        {
            let self = this;
            if( self.keepSelect && self._selection != item )
            {
                self.setSelectItem( item );
                if(item)
                {
                    self.activate( item );
                }

            }
        }
    
        public get selectTag():number
        {
            let self = this;
            return self._selection ? self._selection.tag : -1;
        }
    
        public set selectTag( tag:number )
        {
            let self = this;
            if( self.keepSelect && (!self._selection || self._selection.tag!==tag) )
            {
                let item:MenuItem = self.getChildByTag( tag );
                if( item )
                {
                    self.setSelectItem( item );
                    self.activate( item );
                }
            }
        }
    
        private setSelectItem( item:MenuItem ):void
        {
            let self = this;
            if( self._selection )
            {
                self._selection.selected = false;
            }
            self._selection = item;
            if( self._selection )
            {
                self._selection.selected = true;
            }
        }
    
        public get numItems():number
        {
            return this._items.length;
        }
    
        public getMenuItemAt(index:number):MenuItem
        {
            let self = this;
            if (index >= 0 && index < self.numItems)
                return self._items[index];
    
            return null;
        }
    
        public getChildByTag(tag:number):MenuItem
        {
            let self = this;
            let item:MenuItem;
            let items = self._items;
            for(let i = 0, n=items.length; i < n; ++i)
            {
                item = items[i];
                if(item.tag === tag)
                {
                    return item;
                }
            }
            return null;
        }
    
        public getItemIndex(item:MenuItem):number
        {
            return this._items.indexOf(item);
        }
    
        public setTarget(fun:(item:MenuItem)=>void, tar:any):void
        {
            this._cb = {fun:fun, tar:tar};
        }
    
        protected activate( item:MenuItem ):void
        {
            let cbData = this._cb;
            if ( cbData ){
                cbData.fun.call( cbData.tar, item );
            }
        }
    
        //---------------------------------------------------------------------
        $childAdded(child:egret.DisplayObject, index:number):void
        {
            super.$childAdded( child, index );
    
            let self = this;
            if( child instanceof MenuItem )
            {
                self._items.push( <MenuItem>child );
            }
        }
    
        $childRemoved(child:egret.DisplayObject, index:number):void
        {
            super.$childRemoved( child, index );
    
            let self = this;
            if( child instanceof MenuItem )
            {
                let item:MenuItem = <MenuItem>child;
                if (item == self._selection)
                {
                    self._selection = null;
                }
                let items = self._items;
                items.splice( items.indexOf(child), 1 );
            }
        }
    
        public $hitTest(stageX:number, stageY:number):egret.DisplayObject
        {
            let self = this;
            if (!self.touchEnabled || !self.visible ) return null;
    
            let point = self.globalToLocal(stageX, stageY, egret.$TempPoint);
            let bounds = egret.$TempRectangle.setTo(0, 0, self.width, self.height);
            let scrollRect = self.$scrollRect;
            if(scrollRect){
                bounds.x = scrollRect.x;
                bounds.y = scrollRect.y;
            }
    
            if (!bounds.contains(point.x, point.y)) return null;
    
            //子控件 不处理事件
            return self;
        }
    
        protected _tempStage:egret.Stage;
        protected onTouchBegin(event:egret.TouchEvent):void
        {
            let self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
    
            let stage:egret.Stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
            self._tempStage = stage;
    
            self._highLightItem = self._itemForTouch(event.localX, event.localY);
            if (self._highLightItem)
            {
                self._highLightItem.selected = true;
                event.updateAfterEvent();
            }
        }

        protected onTouchMove(event:egret.TouchEvent):void
        {
            let self = this;
    
            let point:egret.Point = self.globalToLocal( event.stageX, event.stageY, egret.$TempPoint );
            let currentItem:MenuItem = self._itemForTouch(point.x, point.y);
            if (self._highLightItem != currentItem)
            {
                if( self._highLightItem )
                {
                    if( !self.keepSelect || self._highLightItem!=self._selection )
                    {
                        self._highLightItem.selected = false;
                    }
                }
                self._highLightItem = currentItem;
                if( self._highLightItem )
                {
                    self._highLightItem.selected = true;
                }
                event.updateAfterEvent();
            }
            event.stopPropagation();
        }
    
        protected onTouchEnd(event:egret.TouchEvent):void
        {
            let self = this;
    
            self.onTouchFinish();
    
            let item:MenuItem = self._highLightItem;
            if ( item )
            {
                self._highLightItem = null;
                if( self.keepSelect )
                {
                    if( item!=self._selection )
                    {
                        self.setSelectItem( item );
                    }
                }
                else
                {
                    item.selected = false;
                }
    
                item.onItemTap();
                self.activate( item );
                event.preventDefault();
            }
        }
    
        protected onTouchFinish():void
        {
            let self = this;
            let stage = self._tempStage;
            if( stage ){
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);

                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
                self._tempStage = null;
            }
        }
    
        private _itemForTouch( localX:number, localY:number ):MenuItem
        {
            let items:Array<MenuItem> = this._items;
            if ( items.length > 0)
            {
                //按显示顺序从上层到下层遍历
                let i = items.length-1;
                let item:MenuItem;
                if( this.activeCheckEnable )
                {
                    for (; i >= 0; --i )
                    {
                        item = items[i];
                        if (item.visible && item.enabled )
                        {
                            if ( item.ptInRange(localX, localY) )
                                return item;
                        }
                    }
                }
                else
                {
                    for (; i >= 0; --i )
                    {
                        item = items[i];
                        if ( item.visible )
                        {
                            if ( item.ptInRange(localX, localY) )
                                return item;
                        }
                    }
                }
    
            }
            return null;
        }
    }
    
    
    export class MenuItem extends Component
    {
        protected _isSel:boolean;
        protected _enabled:boolean;

        protected _sound:string;
    
        constructor()
        {
            super();
    
            let self = this;
            self._isSel = false;
            self._enabled = true;
            self.touchEnabled = false;
        }
    
        public get selected():boolean
        {
            return this._isSel;
        }
    
        public set selected( val:boolean )
        {
            this._isSel = val;
        }
        public get sound():string
        {
            return this._sound;
        }
        public set sound(value:string)
        {
            this._sound = value;
        }
        public onItemTap():void
        {
            let self = this;
            if(self.enabled)
            {
                TRain.soundMgr.playSFX(self._sound);
            }
        }
    
        public ptInRange( localX:number, localY:number ):boolean
        {
            let self = this;
            let x = self.x - self.anchorOffsetX;
            let y = self.y - self.anchorOffsetY;
            return localX>x && localX<(x+self.width) && localY>y && localY<(y+self.height);
        }
    }
    
    
    export class MenuItemImage extends MenuItem
    {
        public skIcon:cui.Image;
        public skLabel:cui.Label;

        protected _label:string;
        protected _txtKey:string;
        protected _icon:string;

        public get label():string
        {
            return this._label;
        }
        public set label(value:string)
        {
            let self = this;
            self._label = value;
            let skLabel = self.skLabel;
            if(skLabel) skLabel.text = value;
        }

        public get txtKey():string
        {
            return this._txtKey;
        }
        public set txtKey(value:string)
        {
            let self = this;
            self._txtKey = value;
            let skLabel = self.skLabel;
            if(skLabel) skLabel.txtKey = value;
        }

        public get icon():string
        {
            return this._icon;
        }
        public set icon(value:string)
        {
            let self = this;
            self._icon = value;
            let skIcon = self.skIcon;
            if(skIcon) skIcon.source = value;
        }
        
        public get selected():boolean
        {
            return this._isSel;
        }

        public set selected( val:boolean )
        {
            let self = this;
            if( self._isSel == val ) return;

            self._isSel = val;
            self.invalidateProps( PropertyType.state );
        }

        public getState():string
        {
            let self = this;
            if (!self.enabled)
                return "disabled";

            if ( self._isSel )
                return "down";

            return "up";
        }

        protected onPartAdded():void
		{
			let self = this;

            let skIcon = self.skIcon;
			let icon = self._icon;
			if( icon && skIcon ) skIcon.source = icon;

            let skLabel = self.skLabel;
			if( skLabel ){
				let label = self._label;
				if( label )
				{
					skLabel.text = label;
				}
				else{
					let txtKey = self._txtKey;
					if(txtKey) skLabel.txtKey = txtKey;
				}
			}
		}
    }
}
    
