/**
 * Created by wjdeng on 2015/10/24.
 */

    class CMap<K,V>
    {
        private _keys:Array<K>;
        private _values:Array<V>;

        constructor()
        {
            let self = this;
            self._keys = [];
            self._values = [];
        }

        public set(key:K, value:V):CMap<K, V>
        {
            let self = this;
            let idx:number = self._keys.indexOf( key );
            if( idx >= 0 )
            {
                self._values[idx] = value;
            }
            else
            {
                self._keys.push(key);
                self._values.push(value);
                if( DEBUG )
                {
                    if( self._keys.length !== self._values.length )
                    {
                        throw "CMap keys length not equal values length";
                    }
                }
            }
            return self;
        }

        public get(key:K):V
        {
            let self = this;
            let idx:number = self._keys.indexOf( key );
            return (idx>=0) ? self._values[idx] : null;
        }

        public get size():number
        {
            return this._keys.length;
        }

        //注意 外部不能修改 返回的数组
        public get keys():Array<K>
        {
            return this._keys;
        }

        //注意 外部不能修改 返回的数组
        public get values():Array<V>
        {
            return this._values;
        }

        public forEach(callbackfn: (value: V, key: K, map: CMap<K, V>) => void, thisArg?: any): void
        {
            let self = this;
            let keys:Array<K> = self._keys;
            let values:Array<V> = self._values;
            let size:number = keys.length;
            for( let i:number = 0; i<size; ++i )
            {
                callbackfn.call(thisArg, values[i], keys[i], self );
            }
        }

        public clear(): void
        {
            let self = this;
            self._keys.length = 0;
            self._values.length = 0;
        }

        public has(key: K): boolean
        {
            return this._keys.indexOf( key ) >= 0;
        }

        public delete(key: K): boolean
        {
            let self = this;
            let idx:number = self._keys.indexOf( key );
            if( idx >= 0 )
            {
                self._keys.splice( idx, 1 );
                self._values.splice( idx, 1 );
                return true;
            }
            return false;
        }
    }
