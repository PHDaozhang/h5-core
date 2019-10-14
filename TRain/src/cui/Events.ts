/**
 * Created by CV-PC359 on 2016/6/22.
 */

module cui
{
    // export class ItemTapEvent extends egret.Event
    // {
    //     public item:any = null;
    //     public itemRenderer:IItemRenderer = null;
    //     public itemIndex:number = -1;

    //     protected clean():void
    //     {
    //         super.clean();
    //         this.item = this.itemRenderer = null;
    //     }

    //     public static dispatchItemTapEvent(target:egret.IEventDispatcher, itemRenderer?:IItemRenderer):boolean
    //     {
    //         if (!target.hasEventListener(UI_EVENT.ITEM_TAP))
    //         {
    //             return true;
    //         }
    //         let event = egret.Event.create(ItemTapEvent, UI_EVENT.ITEM_TAP);
    //         event.item = itemRenderer.data;
    //         event.itemIndex = itemRenderer.itemIndex;
    //         event.itemRenderer = itemRenderer;
    //         let result = target.dispatchEvent(event);
    //         egret.Event.release(event);
    //         return result;
    //     }
    // }

    export class CollectionEvent extends egret.Event
    {
        public kind:string;
        public item:any;
        public oldItem:any;
        public location:number;

        public constructor(type:string, bubbles?:boolean, cancelable?:boolean) {
            super(type, bubbles, cancelable);
        }

        protected clean():void{
            super.clean();
            this.item = this.oldItem = null;
        }

        private initTo(kind?:string, location?:number, item?:any, oldItem?:any):void {
            this.kind = kind;
            this.location = +location | 0;
            this.item = item;
            this.oldItem = oldItem;
        }

        public static dispatchCoEvent(target:egret.IEventDispatcher, kind?:string, location?:number,
                                              item?:any, oldItem?:any):boolean {
            if (!target.hasEventListener(UI_EVENT.COLLECT_CHANGE)) {
                return true;
            }
            let event = egret.Event.create(CollectionEvent, UI_EVENT.COLLECT_CHANGE);
            event.initTo(kind, location, item, oldItem);
            let result = target.dispatchEvent(event);
            egret.Event.release(event);
            return result;
        }
    }

}