declare class Howl{
    constructor( data:{src:string[], loop:boolean, volume:number, autoplay:boolean} );
    play();
    stop();
}