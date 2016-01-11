;
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.OpenSense = factory();
    }

})(this, function(){
    var OpenSense = {};
    var $container,
        $mask,
        $goAgain,
        $showEnd,
        Settings = OpenSense.settings = {
            container: 'openSense',
            mask: 'maskSense',
            skip: 'openSkip',
            imgArr: [
                './asset/map/skyland/cloud1.png',
                './asset/map/skyland/cloud2.png',
                './asset/map/skyland/cloud3.png',
                './asset/map/skyland/cloud4.png',
                './asset/map/skyland/cloud7.png',
                './asset/img/ag.png'
            ],
            AudioPath: './audio/logo.mp3',
            imgLent: 6,
            loadingAudio: 1,
            isStart: false,
            isEnd: false,
            isDejavu: false,
            EndingAnimatedName: 'openEnding',
            MaskAnimatedName: 'lighting',
            AudioPlayer: null,
            isVoice: true,
            eventStat:false
        };

    OpenSense.configure = function(options) {
        var key, value;
        for (key in options) {
            value = options[key];
            if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
        }

        return this;
    };

    OpenSense.init = function() {
        $container = Settings.$container = document.getElementById(Settings.container);
        $mask = Settings.$mask = document.getElementById(Settings.mask);
        // $skip = Settings.$skip = document.getElementById(Settings.skip);
        // if(Settings.goAgain){
        //     $goAgain = document.getElementById(Settings.goAgain);
        //     $goAgain.addEventListener("click", function() {
        //         //动画开始时候播放
        //         OpenSense.loadAgain();
        //     }, false);
        // }

        // $skip.addEventListener('click', function() {
        //     OpenSense.pass();
        // });
        if(Settings.showEnd){
            $showEnd = document.getElementById(Settings.showEnd);
        }
        Settings.start = new Date().getTime();

        preloadIMG();
        loadAudio(Settings.AudioPath);
        kickCheck();

        if ((localStorage && localStorage.getItem('isDejavu')) || Settings.isDejavu) {
            //$skip.className += ' show';
        }
    };

    // 跳过
    OpenSense.pass = function() {
        if (!Settings.isEnd) {
            Settings.isStart = true;
            Settings.isEnd = true;
            OpenSense.paused();
            $container.className = 'open-sense hide';
            // $container.parentNode.removeChild($container);
            if (localStorage) {
                localStorage.setItem('isDejavu', true);
            }
            /*setTimeout(function() { //直接在很短时间内调用可能会无法播出声音，这里先做一下hack，后续改进
                TS.Home.initBGMusic(); // 初始化声音
            }, 0);*/
        }
    }

    OpenSense.paused = function() {
        if(Settings.AudioPlayer) {
            Settings.AudioPlayer.pause();
        }
        $container.className += ' pause';
    }

    OpenSense.loadAgain = function() {
        if(Settings.isStart){
            reset();
            OpenSense.pass();
            $container.className = 'open-sense';
            loadOpenSenseAnimation();
        }
        
    }

    var loadOpenSenseAnimation = function(){
        Settings.isStart = true;
        Settings.isEnd = false;
        $container.className += ' animated';
        if(Settings.goAgain) {
            $goAgain.className = 'game-button2 disable';
        }

        if(!Settings.eventStat){
            Settings.eventStat = true;
            $mask.addEventListener('webkitAnimationStart', function(){
                // animate start
                if (Settings.isVoice && Settings.loadingAudio === 0) {
                    Settings.AudioPlayer.currentTime = 0;
                    Settings.AudioPlayer.play();
                }
            }, false);

            $container.addEventListener("webkitAnimationStart", function(animation) {
                //animate start
                if (animation.animationName === Settings.EndingAnimatedName) {
                    $container.className += ' ending';
                    $container.innerHtml = '';
                }
        
            }, false);

            $container.addEventListener("webkitAnimationEnd", function(animation) {
                //animate stop
                if (animation.animationName === Settings.EndingAnimatedName) {
                    OpenSense.pass();
                    if(Settings.goAgain){
                        $goAgain.className = 'game-button2 activity';
                    }
                    if(Settings.showEnd){
                        $showEnd.style.display = '';
                    }
                }
            }, false);

        }
    };

    var reset = function(){
        Settings.loadingAudio = 0;
    };

    var preloadIMG = function() {
        for (var i = 0; i < Settings.imgLent; i++) {
            loadIMG(Settings.imgArr[i]);
        }
    };

    var loadIMG = function(src) {
        var newImg = new Image;
        newImg.onload = function(){
            loadingStore('IMG');
        }
        newImg.src = src;
    };

    var loadAudio = function(uri) {
        var audio = new Audio();
        audio.addEventListener('canplaythrough', function() {
            loadingStore('AUDIO');
        }, false);
        audio.src = uri;
        audio.volume = getSetting('voiceVolume', 1);

        Settings.isVoice = getSetting('isVoice', true);
        Settings.AudioPlayer = audio;
    };

    var loadingStore = function(_type) {
        if (_type === 'IMG') {
            Settings.imgLent--;
        } else if (_type === 'AUDIO') {
            Settings.loadingAudio--;
        }

        if (Settings.imgLent === 0 && Settings.loadingAudio === 0 && !Settings.isStart) {
            setTimeout(function() {
                $container.className = 'open-sense';
                console.log(' start by loadend');
                loadOpenSenseAnimation();
            }, 0);
        }
    };

    var kickCheck = function() {
        if (((new Date().getTime() - Settings.start) / 1000) > 15 && !Settings.isStart) {
            setTimeout(function() {
                $container.className = 'open-sense';
                console.log(' start by kickCheck');
                loadOpenSenseAnimation();
            }, 0);
            return;
        }
        setTimeout(function() {
            if (Settings.imgLent || Settings.loadingAudio) {
                kickCheck();
            }
        }, 50);
    };

    var getSetting = function(item, defaultVal) {
        var setting = localStorage.getItem('setting');

        try {
            setting = JSON.parse(setting);
            if (setting[item] !== undefined) {
                return setting[item];
            } else {
                return defaultVal;
            }
        } catch (err) {
            return defaultVal;
        }
    };

    return OpenSense;
})