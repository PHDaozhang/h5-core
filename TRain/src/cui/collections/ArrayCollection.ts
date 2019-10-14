//////////////////////////////////////////////////////////////////////////////////////

module cui
{
    export const enum CollectionEventKind
    {
        ADD = "add",
        REFRESH = "refresh",
        REMOVE = "remove",
        REMOVEALL = "removeAll",
        REPLACE = "replace",
        RESET = "reset",
        UPDATE = "update",
        UPDATE_idxs = "upidxs",
    }

    export interface ICollection extends egret.IEventDispatcher
    {
        length:number;
        getItemAt(index:number):any;
        getItemIndex(item:any):number;
    }

    export class ArrayCollection extends egret.EventDispatcher implements ICollection
    {
        public constructor(source?:any[]) {
            super();
            this._src = source || [];
        }

        private _src:any[];

        public get source():any[] {
            return this._src;
        }

        public set source(value:any[]) {
            this._src = value;
            CollectionEvent.dispatchCoEvent(this, CollectionEventKind.RESET);
        }

        public refresh():void {
            CollectionEvent.dispatchCoEvent(this, CollectionEventKind.REFRESH);
        }

        //--------------------------------------------------------------------------
        //
        // ICollection接口实现方法
        //
        //--------------------------------------------------------------------------
        public get length():number {
            return this._src.length;
        }

        public addItem(item:any):void {
            let self = this;
            let source = self._src;
            source.push(item);
            CollectionEvent.dispatchCoEvent(self, CollectionEventKind.ADD, source.length - 1, item);
        }

        public addItemAt(item:any, index:number):void {
            let self = this;
            let source = self._src;
            if ( DEBUG ) {
                if( index < 0 || index > source.length ){
                    egret.$error(1007);
                }
            }
            source.splice(index, 0, item);
            CollectionEvent.dispatchCoEvent(self, CollectionEventKind.ADD, index, item);
        }

        public getItemAt(index:number):any {
            return this._src[index];
        }

        public getItemIndex(item:any):number {
            return this._src.indexOf( item );
        }

        public itemUpdated(item:any):void {
            let self = this;
            let index:number = self._src.indexOf( item );
            if (index != -1) {
                CollectionEvent.dispatchCoEvent(self, CollectionEventKind.UPDATE, index, item);
            }
        }

        public updateItemAt( idx:number ):void {
            let self = this;
            let source = self._src;
            if (idx>=0 && idx<source.length) {
                CollectionEvent.dispatchCoEvent(self, CollectionEventKind.UPDATE, idx, source[idx]);
            }
        }

        public updateItemAts( idxs:number[] ):void {
            CollectionEvent.dispatchCoEvent(this, CollectionEventKind.UPDATE_idxs, 0, idxs );
        }

        public removeAll():void {
            let self = this;
            self._src.length = 0;
            CollectionEvent.dispatchCoEvent( self, CollectionEventKind.REMOVEALL );
        }

        public removeItem(item:any):void{
            let self = this;
            let source = self._src;
            let idx = source.indexOf(item);
            source.splice(idx, 1);
            CollectionEvent.dispatchCoEvent( self, CollectionEventKind.REMOVE, idx, item);
        }

        public removeItemAt(index:number):any {
            let self = this;
            let source = self._src;
            if ( DEBUG ) {
                if( index < 0 || index > source.length ){
                    egret.$error(1007);
                }
            }
            let item:any = source.splice(index, 1)[0];
            CollectionEvent.dispatchCoEvent( self, CollectionEventKind.REMOVE, index, item);
            return item;
        }

        public replaceItemAt(item:any, index:number):any {
            let self = this;
            let source = self._src;
            if ( DEBUG ) {
                if( index < 0 || index > source.length ){
                    egret.$error(1007);
                }
            }
            let oldItem:any = source.splice(index, 1, item)[0];
            CollectionEvent.dispatchCoEvent( self, CollectionEventKind.REPLACE, index, item, oldItem);
            return oldItem;
        }
    }
}