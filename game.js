/*
*
*
*   P1X, Krzysztof Jankowski
*   Tribes Life
*
*   abstract: Simple game for the js3kGames compo
*   engine: P1X Engine V4
*   created: 07-09-2014
*   license: do what you want and dont bother me
*
*   webpage: http://p1x.in
*   twitter: @w84death
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/*
*
*   custom GUI draw functions
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
Gui.prototype.draw_intro = function(params){
    var ctx = game.gfx.layers[this.layer].ctx,
        _w = game.gfx.screen.width*game.gfx.screen.scale,
        _h = game.gfx.screen.height*game.gfx.screen.scale;

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.font = "900 "+(4*game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";

    ctx.fillText('P1X PRESENTS',
        _w*0.5 << 0,
        (_h*0.5 << 0 ) - 128
    );

    this.draw_image({
        name: 'logo',
        x:(game.world.width*0.5 << 0),
        y:(game.world.height*0.5 << 0)-2,
        center: true
    });


    ctx.fillText('8X8 SPRITES; 16 COLOUR PALETTE',
        (_w*0.5 << 0),
        (_h*0.5 << 0)
    );

    game.gfx.layers[this.layer].ctx.fillText('#js13kGames compo',
        (_w*0.5 << 0),
        (_h*0.5 << 0)+24
    );

    ctx.fillText('@W84DEATH',
        (_w*0.5 << 0),
        (_h*0.5 << 0)+48
    );


    if(game.timer % 2 == 1){
        ctx.fillStyle = '#fff';
        ctx.fillText('CLICK TO START',
            _w*0.5 << 0,
            (_h*0.5 << 0)+128
        );
    }
};

/*
*
*   game virtual world
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var World = function(){
    width = 0;
    height = 0;
    data = [];
    entities = [];
};
World.prototype.init = function(params){
    var x,y;

    this.width = params.width;
    this.height = params.height;
    this.data = [this.width];
    for (x = 0; x < this.width; x++) {
        this.data[x] = [this.height]
        for (y = 0; y < this.height; y++) {
            this.data[x][y] = {
                type: 0, // 0 - sea, 1 - land
                sprite: 0, // see spritesheet
                growing: 30, // growing factor (0-100)
                grass: false,
                tree: false,
                target: false // targeted for tribe to move there
            };
        };
    };
};
World.prototype.init_island = function(){
    var i,w,h,x,y,sx,sy,bp,
        boilerplate = [
        [0,0,1,1,1,1,0,0,1,1,0],
        [1,1,1,1,2,1,1,0,0,1,0],
        [1,1,1,2,3,2,1,1,0,0,0],
        [0,1,2,3,2,2,2,1,0,0,0],
        [1,1,2,2,3,2,1,1,0,1,0],
        [1,1,1,2,2,1,1,1,0,0,0],
        [0,0,1,1,1,1,0,0,1,1,1],
        [1,0,0,0,0,0,0,1,1,2,1],
        [0,0,0,1,1,0,0,0,1,1,1],
        [0,0,0,1,1,0,0,0,0,0,0]];

    // 0 - sea
    // 1 - clear land
    // 2 - grass
    // 3 - tree
    // 4 - house

    w = boilerplate[0].length;
    h = boilerplate.length;
    sx = ((this.width*0.5)<<0)-(w*0.5)<<0;
    sy = ((this.height*0.5)<<0)-(h*0.5)<<0;

    for (x = 0; x < w; x++) {
        for (y = 0; y < h; y++) {
            bp = boilerplate[y][x];
            if(bp == 0 || bp == 1){
                this.data[x+sx][y+sy].type = boilerplate[y][x];
            }
            if(bp == 2){
                this.data[x+sx][y+sy].type = 1;
                this.data[x+sx][y+sy].grass = true;
                this.data[x+sx][y+sy].sprite = Math.random()<0.5? 15 : 16;
            }
            if(bp == 3){
                this.data[x+sx][y+sy].type = 1;
                this.data[x+sx][y+sy].tree = true;
                this.data[x+sx][y+sy].sprite = Math.random()<0.5? 21 : 22;
            }
        };
    };
};
World.prototype.binary_neigbours = function(x,y,t){
    var bn = 0;
    if(this.data[x-1][y-1].type == t) bn+= 1;
    if(this.data[x][y-1].type == t) bn+= 2;
    if(this.data[x+1][y-1].type == t) bn+= 4;
    if(this.data[x+1][y].type == t) bn+= 8;
    if(this.data[x+1][y+1].type == t) bn+= 16;
    if(this.data[x][y+1].type == t) bn+= 32;
    if(this.data[x-1][y+1].type == t) bn+= 64;
    if(this.data[x-1][y].type == t) bn+= 128;
    return bn;
};
World.prototype.generate_sprites = function(){
    var bin;

    for (x = 1; x < this.width-1; x++) {
        for (y = 1; y < this.height-1; y++) {
            if(this.data[x][y].type == 1){
                bin = this.binary_neigbours(x,y,1);
                if(
                    bin == 60 || bin == 120 || bin == 56 || bin == 124 ||
                    bin == 40 || bin == 108 || bin == 44 || bin == 104 ||
                    bin == 121
                ){
                    this.data[x][y].sprite = 6;
                }else
                if(
                    bin == 14 || bin == 15 || bin == 30 || bin == 31 ||
                    bin == 10 || bin == 95 || bin == 79 || bin == 78
                ){
                    this.data[x][y].sprite = 8;
                }else
                if(
                    bin == 240 || bin == 241 || bin == 224 || bin == 225 ||
                    bin == 160 || bin == 176 || bin == 177 || bin == 245 ||
                    bin == 228 || bin == 229 || bin == 161
                ){
                    this.data[x][y].sprite = 7;
                }else
                if(
                    bin == 198 || bin == 199 || bin == 135 || bin == 195 ||
                    bin == 131 || bin == 130 || bin == 134 || bin == 194 ||
                    bin == 147 || bin == 151 || bin == 215
                ){
                    this.data[x][y].sprite = 9;
                }else
                if(
                    bin == 112 || bin == 48 || bin == 96 || bin == 32
                ){
                    this.data[x][y].sprite = 12;
                }else
                if(
                    bin == 6 || bin == 7 || bin == 3 || bin == 2
                ){
                    this.data[x][y].sprite = 13;
                }else
                if(
                    bin == 28 || bin == 8 || bin == 24 || bin == 12 ||
                    bin == 29 || bin == 88
                ){
                    this.data[x][y].sprite = 10;
                }else
                if(
                    bin == 128 || bin == 129 || bin == 192 || bin == 193 ||
                    bin == 209
                ){
                    this.data[x][y].sprite = 11;
                }else
                if(
                    bin == 143 || bin == 207 || bin == 159 || bin == 223 ||
                    bin == 158
                ){
                    this.data[x][y].sprite = (x%2==0)? 4 : 5;
                }else
                if(
                    bin == 0 || bin == 64 || bin == 1 || bin == 5 ||
                    bin == 21 || bin == 85 || bin == 16 || bin == 4 ||
                    bin == 20 || bin == 68
                ){
                   this.data[x][y].sprite = 14;
                }else{
                    if(this.data[x][y].sprite != 2 && this.data[x][y].sprite != 3){
                        if(this.data[x][y].sprite < 15){
                            this.data[x][y].sprite = Math.random()>0.5? 2 : 3;
                        }
                    }
                }
            }
        };
    };
};
/*
*
*   main game mechanics
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


var game = {

    gfx: new Gfx({
        tiles_wide:40,
        tiles_high:22
    }),
    gui: new Gui(),
    input: new Input(),
    moog: new Moog(),
    messages: new Messages(),
    world: new World(),

    fps: 0,
    state: 'loading',
    timer: 0,

    settings:{
        debug_world: false,
        game_clock: 500,
        conversation_time: 30,
        water_animations: 18
    },

    /*
    *   init the engine
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    init: function(){
        // init game timer
        window.setInterval(game.inc_timer,game.settings.game_clock);

        // graphics init
        this.gfx.init({
            layers: 4
        });

        // gui init
        this.gui.init({
            layer: 3
        });

        // messages init
        this.messages.init({
            layer: 3
        });

        // mouse events
        this.input.init();

        // play some sound
        this.moog.play({
            freq: 5000,
            attack: 80,
            decay: 400,
            oscilator: 3,
            vol: 0.2
        });

        this.world.init({
            width: (game.gfx.screen.width/game.gfx.screen.sprite_size)<<0,
            height: (game.gfx.screen.height/game.gfx.screen.sprite_size)<<0
        });

        game_loop();
    },

    /*
    *   game logic
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    inc_timer: function(){
        game.timer++;
    },

    new_game: function(){

        this.world.init_island();
        this.world.generate_sprites();
    },

    user_select_on_screen: function(){
        var px = (this.input.pointer.pos.x / this.gfx.screen.scale / this.gfx.screen.sprite_size )<<0,
            py = (this.input.pointer.pos.y / this.gfx.screen.scale / this.gfx.screen.sprite_size ) <<0;

        if(
            this.state == 'game' &&
            px > 0 && py > 0 &&
            px < this.world.width-1 && py < this.world.height-1
        ){
            this.world.data[px][py].type = 1;
            this.world.generate_sprites();
            this.gfx.layers[1].render = true;
        }
    },

    user_draw_on_screen: function(){
        var px,py;

        if(this.input.pointer.enable && this.state == 'game'){
            px = (this.input.pointer.pos.x / this.gfx.screen.scale / this.gfx.screen.sprite_size )<<0;
            py = (this.input.pointer.pos.y / this.gfx.screen.scale / this.gfx.screen.sprite_size ) <<0;
            if(
                px > 0 && py > 0 &&
                px < this.world.width-1 && py < this.world.height-1
            ){
                this.world.data[px][py].type = 1;
                this.world.generate_sprites();
                this.gfx.layers[1].render = true;
            }
        }
    },

    debug_binary_neighbors: function(x,y){
        var ctx = game.gfx.layers[2].ctx,
        xs = x*game.gfx.screen.scale*game.gfx.screen.sprite_size + (game.gfx.screen.sprite_size*0.5)*game.gfx.screen.scale,
        ys = y*game.gfx.screen.scale*game.gfx.screen.sprite_size + (game.gfx.screen.sprite_size*0.5)*game.gfx.screen.scale;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.font = "900 "+(3*game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";
        ctx.fillText(this.world.binary_neigbours(x,y,1),
            xs,ys
        );
    },

    update: function(delta_time){

        switch(this.state){
            case 'loading':
                if(this.gfx.load()){
                    this.gfx.layers[0].render = true;
                    this.state = 'intro';

                    this.gui.draw_box({
                        layer: 0,
                        width: 14,
                        height: 9,
                        x: ((this.world.width*0.5)<<0)-7,
                        y: ((this.world.height*0.5)<<0)-6,
                        sprites: [
                            18,19,20,
                            24,25,26,
                            30,31,32
                        ]
                    });
                    this.gfx.put_tile({
                        layer:0,
                        id:28,
                        x:((this.world.width*0.5)<<0)+6,
                        y:((this.world.height*0.5)<<0)+3
                    });
                }
            break;
            case 'intro':
                if(this.input.pointer.enable){
                    this.new_game();
                    this.gfx.layers[0].render = true;
                    this.gfx.layers[1].render = true;
                    this.state = 'game';
                }
            break;
            case 'game':

                // ?

            break;
            case 'game_over':
                if(this.input.pointer.enable){
                    this.new_game();
                    this.state = 'game';
                }
            break;
        }

    },

     render: function(delta_time){
        this.gui.clear();
        var i,x,y, sprite;

        switch(this.state){
            case 'loading':
            break;
            case 'intro':
                this.gui.draw_intro();
            break;
            case 'game':
                // WATER
                if(this.gfx.layers[0].render){
                    for (x = 0; x < this.world.width; x++) {
                        for (y = 0; y < this.world.height; y++) {
                            this.gfx.put_tile({
                                layer:0,
                                id:Math.random()<0.5 ? 0 : 1,
                                x:x,y:y
                            });
                        };
                    };
                    this.gfx.layers[0].render = false;
                }

                // WATER ANIMATIONS
                for (i = 0; i < this.settings.water_animations; i++) {
                    this.gfx.put_tile({
                        layer: 0,
                        id:Math.random()<0.5 ? 0 : 1,
                        x:(Math.random()*this.world.width)<<0,
                        y:(Math.random()*this.world.height)<<0
                    });
                };

                // ISLANDS
                if(this.gfx.layers[1].render){
                    this.gfx.clear(1);
                    if(this.settings.debug_world) this.gfx.clear(2);
                    for (x = 0; x < this.world.width; x++) {
                        for (y = 0; y < this.world.height; y++) {
                            if(this.world.data[x][y].type > 0){
                                this.gfx.put_tile({
                                    layer:1,
                                    id:this.world.data[x][y].sprite,
                                    x:x,y:y
                                });
                                if(this.settings.debug_world) this.debug_binary_neighbors(x,y);
                            }
                        };
                    };
                    this.gfx.layers[1].render = false;
                }

                // ENTITIES
                if(this.gfx.layers[2].render){
                    // ...
                    this.gfx.layers[2].render = false;
                }

                this.gui.draw_fps();
                this.gui.draw_image({
                    name: 'logo',
                    x:1,
                    y:this.world.height-3
                });
            break;
            case 'game_over':
                // ...
            break;
        }
        this.gui.draw_pointer();
    },


    /*
    *   main loop
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    loop: function(delta_time){
        this.update(delta_time);
        this.render(delta_time);
    },

};


/*
*   init game and loop
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
game.init();
