
module EaseUtil
{
    export function getPowIn(pow):Function
    {
        return function (t) {
            return Math.pow(t, pow);
        }
    }

    export function getPowOut(pow):Function
    {
        return function (t) {
            return 1 - Math.pow(1 - t, pow);
        }
    }

    export function getPowInOut(pow):Function
    {
        return function (t) {
            if ((t *= 2) < 1) return 0.5 * Math.pow(t, pow);
            return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
        }
    }


    export let quadIn:Function = getPowIn(2);
    export let quadOut:Function = getPowOut(2);
    export let quadInOut:Function = getPowInOut(2);
    export let cubicIn:Function = getPowIn(3);
    export let cubicOut:Function = getPowOut(3);
    export let cubicInOut:Function = getPowInOut(3);
    export let quartIn:Function = getPowIn(4);
    export let quartOut:Function = getPowOut(4);
    export let quartInOut:Function = getPowInOut(4);
    export let quintIn:Function = getPowIn(5);
    export let quintOut:Function = getPowOut(5);
    export let quintInOut:Function = getPowInOut(5);

    export function sineIn(t):number
    {
        return 1 - Math.cos(t * Math.PI / 2);
    }
    export function sineOut(t):number
    {
        return Math.sin(t * Math.PI / 2);
    }
    export function sineInOut(t):number
    {
        return -0.5 * (Math.cos(Math.PI * t) - 1)
    }
    export function getBackIn(amount):Function
    {
        return function (t) {
            return t * t * ((amount + 1) * t - amount);
        }
    }

    export let backIn:Function = getBackIn(1.7);
    export function getBackOut(amount):Function
    {
        return function (t) {
            return (--t * t * ((amount + 1) * t + amount) + 1);
        }
    }


    export let backOut:Function = getBackOut(1.7);
    export function getBackInOut(amount):Function
    {
        amount *= 1.525;
        return function (t) {
            if ((t *= 2) < 1) return 0.5 * (t * t * ((amount + 1) * t - amount));
            return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
        }
    }

    export let backInOut:Function = getBackInOut(1.7);

    export function circIn(t):number
    {
        return -(Math.sqrt(1 - t * t) - 1);
    }
    export function circOut(t):number
    {
        return Math.sqrt(1 - (--t) * t);
    }
    export function circInOut(t):number
    {
        if ((t *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - t * t) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    }
    export function bounceIn(t):number
    {
        return 1 - bounceOut(1 - t);
    }
    export function bounceOut(t):number
    {
        if (t < 1 / 2.75) {
            return (7.5625 * t * t);
        } else if (t < 2 / 2.75) {
            return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
        } else if (t < 2.5 / 2.75) {
            return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
        } else {
            return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
        }
    }
    export function bounceInOut(t):number
    {
        if (t < 0.5) return bounceIn(t * 2) * .5;
        return bounceOut(t * 2 - 1) * 0.5 + 0.5;
    }

    export function getElasticIn(amplitude, period):Function
    {
        let pi2 = Math.PI * 2;
        let s = period / pi2 * Math.asin(1 / amplitude);
        return function (t) {
            if (t == 0 || t == 1) return t;
            return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
        }
    }

    export let elasticIn:Function = getElasticIn(1, 0.3);

    export function getElasticOut(amplitude, period):Function
    {
        let pi2 = Math.PI * 2;
        let s = period / pi2 * Math.asin(1 / amplitude);
        return function (t) {
            if (t == 0 || t == 1) return t;
            return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
        }
    }


    export let elasticOut:Function = getElasticOut(1, 0.3);

    export function getElasticInOut(amplitude, period):Function
    {
        let pi2 = Math.PI * 2;
        let s = period / pi2 * Math.asin(1 / amplitude);
        return function (t) {
            if ((t *= 2) < 1) return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
            return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
        }
    }

    export let elasticInOut:Function = getElasticInOut(1, 0.3 * 1.5);

    //decayPer  衰减百分比
    export function getQuakeFun(waveCnt:number, decayPer:number):Function
    {
        let pi2 = 2*Math.PI;
        decayPer = decayPer/100;
        if( decayPer>1 ) decayPer = 1;
        return function (t) {
            let tmp = t*waveCnt;
            let radian = (tmp - Math.floor(tmp))*pi2;
            return Math.sin(radian) * (1-decayPer*t);
        }
    }

    export let waveRandFun = function (t:number):number
    {
        if( t===0||t===1 ) return 0;
        return (Math.random()<0.5)?Math.random():-Math.random();
    }
}