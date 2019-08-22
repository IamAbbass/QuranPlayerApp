var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        this.receivedEvent('deviceready');



        try{
          window.HeadsetDetection.registerRemoteEvents(function(status) {
              switch (status) {
                  case 'headsetAdded':
                      $(".handset_details").text("🎧 Headphone Connected ✔️");
                  break;
                  case 'headsetRemoved':
                      $(".handset_details").text("🎧 Sounds best with headphone !");
                  break;
              };
          });
        }catch(e){
          $(".handset_details").text("🎧 Sounds best with headphone !");
        }


        //localStorage.clear();
        $(document).ready(function(){

          $(".para_view").show();

          var global_audio  = null;
          var total_audio   = arr.length;
          var downloading_arr = [];
          var audio_player  = $("#audio_player")[0];
          audio_player.volume = 1;
          var count_download_files = 0;

          function check_downloaded(index){
            var downloaded = localStorage.getItem("downloaded_"+index);
            if(downloaded == null || downloaded == "null"){
              return false;
            }else{
              return true;
            }
          }
          function secondsTimeSpanToHMS(s) {
              var h = Math.floor(s/3600); //Get whole hours
              s -= h*3600;
              var m = Math.floor(s/60); //Get remaining minutes
              s -= m*60;
              s = Math.floor(s);

              if(h == 0){
                return (m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s);
              }else{
                return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s);
              }
          }
          function modifyOffset() {
              var el, newPoint, newPlace, offset, siblings, k;
              width    = this.offsetWidth;
              newPoint = (this.value - this.getAttribute("min")) / (this.getAttribute("max") - this.getAttribute("min"));
              offset   = -1;
              if (newPoint < 0) { newPlace = 0;  }
              else if (newPoint > 1) { newPlace = width; }
              else { newPlace = width * newPoint + offset; offset -= newPoint;}
              siblings = this.parentNode.childNodes;
              for (var i = 0; i < siblings.length; i++) {
                  sibling = siblings[i];
                  if (sibling.id == this.id) { k = true; }
                  if ((k == true) && (sibling.nodeName == "OUTPUT")) {
                      outputTag = sibling;
                  }
              }


              var screen_width = $(window).width();
              var safe_screen  = 50;
              var difference = (screen_width-newPlace);
              var foot_percentage = 30;

              if(difference < safe_screen){
                newPlace = screen_width-safe_screen;
                var foot_percentage = 130-(difference*100)/safe_screen;
                if(foot_percentage > 70){
                  foot_percentage = 70;
                }
                $("#after_here").html("output:after{left:"+foot_percentage+"%}");
              }else{
                $("#after_here").html("output:after{left:"+foot_percentage+"%}");
              }

              offset = offset*2.3;
              outputTag.style.left       = newPlace + "px";
              outputTag.style.marginLeft = offset + "%";
              //outputTag.innerHTML        = "Add Note"; //secondsTimeSpanToHMS(this.value)



          }
          function height_setting(){
            var window_height = $(window).height();
            //$(".thumb").css("height",(window_height/2)+"px");
          }
          function modifyInputs() {

            var inputs = document.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].getAttribute("type") == "range") {
                    inputs[i].onchange = modifyOffset;
                    if ("fireEvent" in inputs[i]) {
                        inputs[i].fireEvent("onchange");
                    } else {
                        var evt = document.createEvent("HTMLEvents");
                        evt.initEvent("change", false, true);
                        inputs[i].dispatchEvent(evt);
                    }
                }
            }
          }
          function play_now(base_url,audio_number,arr,seek,start){

            audio_player.volume = 1;
            global_audio = audio_number;
            display_saved_notes(global_audio);
            height_setting();
            var arr_index = audio_number-1;
            //console.log({arr_index});
            var thumb_title = arr[arr_index];
            $(".now_playing_name_en, .bottom_name_en").html(chapter+" "+(global_audio)+" "+thumb_title.name_eng);
            $(".now_playing_name_ar, .bottom_name_ar").html(thumb_title.name_arb);


            if(check_downloaded(audio_number) == true){
              var url = localStorage.getItem("downloaded_"+audio_number);
              $(".download_offline").hide();
            }else{
              var url = base_url+audio_number+".mp3";
              $(".download_offline").html('<img src="img/download.png" alt=""/> Download').show();
            }

            //console.log({url});
            audio_player.src = url;
            audio_player.pause();
            audio_player.load();
            audio_player.currentTime = seek;
            if(start == true){
              audio_player.play();
            }
          }
          function get_permission(){
            var Permission = window.plugins.Permission;
            var permission = 'android.permission.WRITE_EXTERNAL_STORAGE';
            Permission.has(permission, function(results) {
                if (!results[permission]) {
                    Permission.request(permission, function(results) {
                        if (results[permission]) {
                            alert("has permission");
                        }else{
                          swal({
                            icon: "warning",
                            title: "Please Allow Storage Permission",
                            text: "Storage permission is required to download file",
                          });
                        }
                    }, alert);
                }else{
                  alert("has permission");
                }
            }, alert)
          }
          function download_file(base_url,audio_number){

            var networkState = navigator.connection.type;
            if(networkState == "none"){
              swal({
                icon: "warning",
                title: "No Internet",
                text: "Please check your internet and try again",
              });
            }else{
              if(check_downloaded(audio_number) == false){ //local storage

                if($.inArray(audio_number,downloading_arr) == -1){
                  downloading_arr.push(audio_number);

                  //UI list
                  $(".para_li[key='"+audio_number+"']").find(".para_index").html(audio_number+' <span class="label label-primary"><img src="img/load.gif" alt=""/></span>');
                  //UI individual
                  if(global_audio == audio_number){
                    $(".download_offline").html('<img src="img/load.gif" alt=""/> Downloading ..').show();
                  }

                  var assetURL = base_url+audio_number+".mp3";
                  //console.log({assetURL});
                  var store = cordova.file.externalRootDirectory;
                  //var store = cordova.file.externalApplicationStorageDirectory;
                  // output in android: file:///storage/emulated/0/
                  // or
                  // var store = "cdvfile://localhost/persistent/";
                  var fileName = "Quran_App_Data/Surah/"+audio_number+".mp3";
                  var fileTransfer = new FileTransfer();
                  fileTransfer.download(assetURL, store + fileName,
                  function(entry) {
                      //SUCCESS
                      downloading_arr.splice($.inArray(audio_number,downloading_arr),1);
                      localStorage.setItem("downloaded_"+audio_number,"file:///storage/emulated/0/"+fileName);
                      $(".para_li[key='"+audio_number+"']").find(".para_index").html(audio_number+' <span class="label label-success">Offline</span>');
                      $(".para_li[key='"+audio_number+"']").find(".progress-download").fadeOut(2000);
                      if(global_audio == audio_number){
                        $(".download_offline").html('File Downloaded').delay(1000).fadeOut();
                        //dynamically change the file from online to offline
                        if(audio_player.paused == false){
                          play_now(base_url,global_audio,arr,audio_player.currentTime,true);
                        }
                      }

                      //display_download_all_button();
                   },
                  function(err) {
                      //ERROR
                      downloading_arr.splice($.inArray(audio_number,downloading_arr),1);
                      $(".para_li[key='"+audio_number+"']").find(".para_index").html(audio_number);
                      $(".para_li[key='"+audio_number+"']").find(".progress-download").fadeOut(2000);
                      if(global_audio == audio_number){
                        $(".download_offline").html('<img src="img/download.png" alt=""/> Download').show();
                      }

                      var code      = err.code;
                      var exception = err.exception;

                      swal({
                        icon: "warning",
                        title: "Unable to download file!",
                        text: "Please check your internet connection",//Error Code "+code+": "+exception,
                      });

                      display_download_all_button();
                  });
                  fileTransfer.onprogress = function(result){
                     var percent =  result.loaded / result.total * 100;
                     percent = Math.round(percent);
                     $(".para_li[key='"+audio_number+"']").find(".para_index").html(audio_number+' <span class="label label-primary"><img src="img/load.gif" alt=""/> '+percent+'%</span>');

                     $(".para_li[key='"+audio_number+"']").find(".progress-download").show();
                     $(".para_li[key='"+audio_number+"']").find(".progress-bar-download").css("width",percent+"%").slideDown();
                     if(global_audio == audio_number){
                       $(".download_offline").html('<img src="img/load.gif" alt=""/> Downloading '+percent+'%').show();
                     }
                  };
                }else{
                  //Already Downloading
                }
              }else{ //already have
                $(".para_li[key='"+audio_number+"']").find(".para_index").html(audio_number+' <span class="label label-success">Offline</span>');
                $(".para_li[key='"+audio_number+"']").find(".progress-download").fadeOut(2000);
                if(global_audio == audio_number){
                  $(".download_offline").hide().fadeIn().html('File Downloaded').delay(1000).fadeOut();
                }
              }
            }
          }
          function download_all(){


              var count_download_files = 0;
              for(i=1; i<=total_audio; i++){
                if(check_downloaded(i) == false){
                  $(".download_all").fadeIn();
                  count_download_files++;
                }
              }

              if(count_download_files > 0){
                if(count_download_files == total_audio){
                  count_download_files = "All";
                }
                swal({
                  title: "Download "+(count_download_files)+" Files ?",
                  text: "You can still listen online. But after downloading "+(count_download_files)+" files, you can listen Quran when you have no access to internet",
                  buttons: ["No","Yes"],
                }).then(function(button){
                  if(button == true){
                    var networkState = navigator.connection.type;
                    if(networkState == "none"){
                      swal({
                        icon: "warning",
                        title: "No Internet",
                        text: "Sorry, can not download file.",
                      });
                    }else{
                      $(".download_all").hide();
                      for(i=1; i<=total_audio; i++){
                        if(check_downloaded(i) == false){
                          download_file(base_url,i);
                        }
                      }
                    }
                  }
                });
              }else{
                swal({
                  icon: "success",
                  title: "All files are downloaded!",
                  text: "You can listen Quran when you have no access to internet",
                });
              }

          }
          function display_saved_notes(global_audio){

            var prevous_notes = localStorage.getItem("notes_"+global_audio);
            if(prevous_notes != null){
              prevous_notes = $.parseJSON(prevous_notes);

              if(prevous_notes.length > 0){
                var new_note = prevous_notes;

                $(".notes_title").show();
                $("#note_list").empty();
                $(".notes_title span").html(new_note.length+" saved note for "+chapter+" "+global_audio);

                $.each(new_note,function(key,data){
                  //console.log(data);
                  var mins  = secondsTimeSpanToHMS(data.mins);
                  var note  = data.note;

                  $("#note_list").append('<li key="'+(key)+'" class="note_li list-group-item">'+
                  '<span key="'+(key)+'" class="note_delete"><img src="img/delete.png" alt="" /></span>'+
                  '<span class="note_text english_font">'+(key+1)+'. <span key="'+(key)+'" class="note_seek gold">'+mins+'</span>: '+note+'</span>'+
                  '</li>');
                });
              }else{
                $(".notes_title").hide();
                $("#note_list").empty();
                $(".notes_title span").html("No saved note for "+chapter+" "+global_audio);

                $("#note_list").append('<li class="note_li note_hint list-group-item">'+
                '<span class="english_font"><img src="img/notes.png" /> Notes will appear here</span>'+
                '</li>');
              }
            }else{
              $(".notes_title").hide();
              $("#note_list").empty();
              $(".notes_title span").html("No saved note for "+chapter+" "+global_audio);

              $("#note_list").append('<li class="note_li note_hint list-group-item">'+
              '<span class="english_font"><img src="img/notes.png" /> Notes will appear here</span>'+
              '</li>');
            }


          }
          function display_download_all_button(){
			count_download_files = 0;
			
            $(".download_all").hide();
            for(i=1; i<=total_audio; i++){
              if(check_downloaded(i) == false){
                $(".download_all").show();
                count_download_files++;
                if(count_download_files == total_audio){
                  $(".count_download_files").html("All");
                }else{
                  $(".count_download_files").html("Remaining "+count_download_files);
                }
              }else{
                $(".para_li[key='"+i+"']").find(".para_index").html(i+' <span class="label label-success">Offline</span>');
              }
            }
          }
          //check download button
          display_download_all_button();

          height_setting();

          var last_played_key   = localStorage.getItem("last_played_key");
          var last_played_time  = localStorage.getItem("last_played_time");

          if(last_played_key != null && last_played_time != null){
            last_played_key   = +last_played_key;
            last_played_time  = +last_played_time;

            if(last_played_time > 0){
              var resume_mins = secondsTimeSpanToHMS(last_played_time);
              play_now(base_url,last_played_key,arr,last_played_time,false);
              swal({
                title: "Resume "+chapter+last_played_key+" from "+(resume_mins)+" mins ?",
                text: "Continue listening from where you left ?",
                buttons: ["Back", "Yes, Resume!"],
              }).then(function(button){
                if(button == true){
                  play_now(base_url,last_played_key,arr,last_played_time,true);
                }
              });

              $(".bottom_bar").animate({bottom:"-70px"},0);
              $(".bottom_bar").animate({bottom:"0px"},500);
            }
          }else{
            //console.log({last_played_key,arr,last_played_time});
          }

          audio_player.addEventListener("play", function(){
            $(".para_li").removeClass("active").children(".para_play")
            .children("img").attr("src","img/play.png");

            $(".para_li[key='"+global_audio+"']").addClass("active").children(".para_play")
            .children("img").attr("src","img/pause.png");

            $(".btn_play_pause").removeClass("play").addClass("pause");
            $(".btn_play_pause, .bottom_play_pause").children("img").attr("src","img/pause.png");
            /*
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: 'Listen Quran',
                text: chapter+' '+global_audio,
                attachments: ['../img/bg-quran.png'],
                  actions: [
                      { id: 'pause', title: 'Pause' },
                      { id: '10_sec',  title: '- 10 secs' },
                      {
                          id: 'reply',
                          type: 'input',
                          title: 'Add Note',
                          emptyText: 'Enter note',
                      }
                  ],
                vibrate: false,
                sound: false
            });
            */
          });
          audio_player.addEventListener("loadedmetadata", function(){
            var max_duration = secondsTimeSpanToHMS(audio_player.duration);
            $(".max_duration").text(max_duration);
            $(".input_seekbar").attr("max",audio_player.duration);
          });
          audio_player.addEventListener("pause", function(){
            $(".btn_play_pause").removeClass("pause").addClass("play");
            $(".btn_play_pause, .bottom_play_pause").children("img").attr("src","img/play.png");
            $(".para_li").children(".para_play").children("img").attr("src","img/play.png");

            /*
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: 'Listen Quran',
                text: chapter+' '+global_audio,
                smallIcon: ['../img/bg-quran.png'],
                icon: ['../img/bg-quran.png'],
                  actions: [
                      { id: 'play', title: 'Play' },
                      { id: '10_sec',  title: '- 10 secs' },
                      {
                          id: 'note',
                          type: 'input',
                          title: 'Add Note',
                          emptyText: 'Enter note',
                      }
                  ],
                vibrate: false,
                sound: false
            });
            */
          });
          audio_player.addEventListener("timeupdate", function(){
            if(audio_player.paused == false){
              if($("output").is(":visible") == false){
                $("output").slideDown();
              }
            }
            var played_duration = secondsTimeSpanToHMS(audio_player.currentTime);
            $(".played_duration").text(played_duration);
            $(".input_seekbar").val(audio_player.currentTime);
            modifyInputs();
            var percentage = (audio_player.currentTime*100)/audio_player.duration;
            $(".progress-bar-inner").attr("style","width: "+percentage+"%;");
            $(".progress-bar-outer[key='"+global_audio+"']").attr("style","width: "+percentage+"%;");
            $(".progress-bar-bottom").attr("style","width: "+percentage+"%;");

            if(audio_player.paused == false){
              //last played
              localStorage.setItem("last_played_key", global_audio);
              localStorage.setItem("last_played_time", audio_player.currentTime);
              //console.log(localStorage.getItem("last_played_time"));
              //remember played
              localStorage.setItem("listened_time_"+global_audio,audio_player.currentTime);
              localStorage.setItem("listened_percentage_"+global_audio,percentage);
            }
          });
          audio_player.addEventListener("ended", function(){
            localStorage.setItem("listened_percentage_"+global_audio,null);
            localStorage.setItem("listened_time_"+global_audio,null);

            if(global_audio < total_audio){
              global_audio = global_audio+1;
              play_now(base_url,global_audio,arr,0,true);
            }
          });
          audio_player.addEventListener("waiting", function(){
            $(".hint_placeholder p.hint").html("<img src=img/load.gif /> Loading ..").show();
            $(".bottom_play_pause").hide();
            $(".bottom_icon_loading").show();
          });
          audio_player.addEventListener("loadstart", function(){
            $(".hint_placeholder p.hint").html("<img src=img/load.gif /> Loading ...").show();
            $(".bottom_play_pause").hide();
            $(".bottom_icon_loading").show();
          });
          audio_player.addEventListener("canplay", function(){
            $(".hint_placeholder p.hint").hide();
            $(".bottom_icon_loading").hide();
            $(".bottom_play_pause").show();
            //console.log("Start: " + audio_player.buffered.start(0)+ " End: " + audio_player.buffered.end(0));
            //console.log("Start: " + audio_player.seekable.start(0) + " End: " + audio_player.seekable.end(0));
          });
          audio_player.addEventListener("playing", function(){
            //console.log("playing -> some animation");
          });
          audio_player.addEventListener("error", function(){
            if(audio_player.readyState == 0 && audio_player.networkState == 3){
              if(check_downloaded(global_audio) == true){
                //file doesn't exists or currupt
                swal({
                  icon: "warning",
                  title: "Offline file doesn't exists",
                  text: "You can still listen Quran from online",
                });

                //show options to download again
                $(".para_li[key='"+global_audio+"']").find(".para_index").html(global_audio);
                $(".download_offline").html('<img src="img/download.png" alt=""/> Download').show();

                //mark as not downloaded
                localStorage.setItem("downloaded_"+global_audio,null);

                //play from online for now
                play_now(base_url,global_audio,arr,0,true);

              }
            }
            //alert("audio_player.readyState"+audio_player.readyState);0
            //alert("audio_player.networkState"+audio_player.networkState);

            //$(".hint_placeholder p.hint").html("No Internet !").show();
            /*

            */


            /*
            console.log(audio_player.readyState);
            0 = HAVE_NOTHING - no information whether or not the audio/video is ready
            1 = HAVE_METADATA - metadata for the audio/video is ready
            2 = HAVE_CURRENT_DATA - data for the current playback position is available, but not enough data to play next frame/millisecond
            3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
            4 = HAVE_ENOUGH_DATA - enough data available to start playing
            */
            /*
            console.log(audio_player.networkState);
            0 = NETWORK_EMPTY - audio/video has not yet been initialized
            1 = NETWORK_IDLE - audio/video is active and has selected a resource, but is not using the network
            2 = NETWORK_LOADING - browser is downloading data
            3 = NETWORK_NO_SOURCE - no audio/video source found
            */
          });
          audio_player.addEventListener("stalled", function(){
            console.log("not able to get data");
          });

          /*
          cordova.plugins.notification.local.on('play', function (notification, eopts) {
            cordova.plugins.notification.local.update({
                id: 1,
                text: [{ person: 'Irish', message: 'Bye bye' }]
            });
          });
          cordova.plugins.notification.local.on('pause', function (notification, eopts) {

            console.log("2");
          });
          cordova.plugins.notification.local.on('note', function (notification, eopts) {
            console.log("3");

          });
          cordova.plugins.notification.local.on('10_sec', function (notification, eopts) {
            console.log("4");

          });
          */

          //not used events
          /*
          audio_player.addEventListener("abort", function(){
            console.log("abort");
          });
          audio_player.addEventListener("ratechange", function(){
            console.log("ratechange");
          });
          audio_player.addEventListener("volumechange", function(){
            console.log("volume change");
          });
          audio_player.addEventListener("volume", function(){
            console.log("volume");
          });
          audio_player.addEventListener("progress", function(){
            console.log("progress");
          });
          audio_player.addEventListener("loadeddata", function(){
            console.log("loaded data but not enough to play");
          });
          audio_player.addEventListener("canplaythrough", function(){
            console.log("can play through");
          });
          audio_player.addEventListener("durationchange", function(){
            console.log("durationchange");
          });
          audio_player.addEventListener("suspend", function(){
            console.log("suspend");
          });
          audio_player.addEventListener("seeked", function(){
            console.log("seeked");
          });
          audio_player.addEventListener("seeking", function(){
            console.log("seeking");
          });
          */

          $("#para_list").delegate(".para_li","click",function(){
            var key   = +$(this).attr("key");



            if(key == global_audio){
              if(audio_player.paused){
                audio_player.play();
              }
            }else{
              var listened_percentage = localStorage.getItem("listened_percentage_"+key);

              if(listened_percentage != null && listened_percentage <= 99){
                var listened_time_secs  = localStorage.getItem("listened_time_"+key);
                var listened_time       = secondsTimeSpanToHMS(listened_time_secs);
                //console.log({listened_percentage,listened_time});
                listened_percentage = Math.round(listened_percentage);

                swal({
                  title: "Resume from "+(listened_time)+" mins ?",
                  text: "Continue listening from where you left ?",
                  buttons: ["No", "Yes, Resume!"],
                }).then(function(button){
                  if(button == true){
                    play_now(base_url,key,arr,listened_time_secs,true);
                  }else{
                    play_now(base_url,key,arr,0,true);
                  }
                });
              }else{
                play_now(base_url,key,arr,0,true);
              }
            }
            $(".para_view").hide();
            $(".player_view").fadeIn();
            $('html, body').animate({scrollTop: 0},250);
            display_saved_notes(key);

          });
          $(".back_btn").click(function(){
            $(".bottom_bar").animate({bottom:"-70px"},0);
            $(".bottom_bar").animate({bottom:"0px"},500);

            $(".player_view").hide();
            $(".para_view").fadeIn(function(){
              try{
                var top_px = ($("#li_"+global_audio).offset().top)-(($(window).height())-70)/2;
                $('html, body').animate({
                    scrollTop: top_px
                },0);
              }catch(e){
                $(".para_view").fadeIn();
              }
            });
          });
          $(".bottom_name_ar, .bottom_name_en").click(function(){
            $(".para_view").hide();
            $(".player_view").fadeIn();
            $('html, body').animate({scrollTop: 0},250);
            display_saved_notes(global_audio);
          });
          $(".input_seekbar").on("input",function(){
            audio_player.currentTime = $(this).val();
          });
          $(".btn_play_pause, .bottom_play_pause").click(function(){
            if(audio_player.paused){
              audio_player.play();
            }else{
              audio_player.pause();
            }
          });
          $(".btn_replay_10").click(function(){
            audio_player.currentTime -= 10;
          });
          $(".btn_forward_10").click(function(){
            audio_player.currentTime += 10;
          });
          $(".btn_next").click(function(){
            if(global_audio < total_audio){
              global_audio = global_audio+1;
              play_now(base_url,global_audio,arr,0,true);
            }
          });
          $(".btn_prev").click(function(){
            if(global_audio > 1){
              global_audio = global_audio-1;
              play_now(base_url,global_audio,arr,0,true);
            }
          });
          $("#para_list").delegate(".download_all","click",function(){

            var Permission = window.plugins.Permission;
            var permission = 'android.permission.WRITE_EXTERNAL_STORAGE';
            Permission.has(permission, function(results) {
                if (!results[permission]) {
                    Permission.request(permission, function(results) {
                        if (results[permission]) {
                          download_all();
                        }else{
                          swal({
                            icon: "warning",
                            title: "Please Allow Storage Permission",
                            text: "Storage permission is required to download file",
                          });
                        }
                    }, alert);
                }else{
                  download_all();
                }
            }, alert)




          });
          $(".download_offline").click(function(){
            var Permission = window.plugins.Permission;
            var permission = 'android.permission.WRITE_EXTERNAL_STORAGE';
            Permission.has(permission, function(results) {
                if (!results[permission]) {
                    Permission.request(permission, function(results) {
                        if (results[permission]) {
                          download_file(base_url,global_audio);
                        }else{
                          swal({
                            icon: "warning",
                            title: "Please Allow Storage Permission",
                            text: "Storage permission is required to download file",
                          });
                        }
                    }, alert);
                }else{
                  download_file(base_url,global_audio);
                }
            }, alert)
          });

          $(".add_note").click(function(){

            audio_player.pause();

            var note_time = audio_player.currentTime;
            var note_mins = secondsTimeSpanToHMS(note_time);

            swal({
              text: "Add Note at "+note_mins+" mins:",
              content: "input",
              button: {
                text: "Save",
              },
            })
            .then(note => {
              audio_player.play();
              if(note != null){
                if(note.length > 0){
                  var prevous_notes = localStorage.getItem("notes_"+global_audio);
                  if(prevous_notes != null){
                    prevous_notes = $.parseJSON(prevous_notes);
                    if(prevous_notes.length > 0){
                      var new_note = prevous_notes;
                    }else{
                      var new_note = [];
                    }
                  }else{
                    var new_note = [];
                  }
                  new_note.push({mins:note_time,note:note});
                  localStorage.setItem("notes_"+global_audio,JSON.stringify(new_note));

                  display_saved_notes(global_audio);

                  $('html, body').animate({
                      scrollTop: $(window).height()
                  },250);

                  /*
                  swal({
                    icon: "success",
                    title: "Note Saved",
                    text: "Your note '"+note+"' saved at '"+note_mins+"'",
                    buttons: false,
                    timer: 3000,
                  });
                  */

                }
              }


            });
          });


          $(".notes_here").delegate(".note_seek","click",function(){
              var key = $(this).attr("key");
              var prevous_notes = localStorage.getItem("notes_"+global_audio);
              prevous_notes = $.parseJSON(prevous_notes);
              var seek = prevous_notes[key].mins;
              audio_player.currentTime = seek;
          });
          $(".notes_here").delegate(".note_delete","click",function(){
            var key = $(this).attr("key");
            var prevous_notes = localStorage.getItem("notes_"+global_audio);
            prevous_notes = $.parseJSON(prevous_notes);
            prevous_notes.splice(key,1);
            localStorage.setItem("notes_"+global_audio,JSON.stringify(prevous_notes));
            display_saved_notes(global_audio);
          });

          document.addEventListener('backbutton', function(e){
            e.preventDefault();
            if($(".player_view").is(':visible')){
              $(".bottom_bar").animate({bottom:"-70px"},0);
              $(".bottom_bar").animate({bottom:"0px"},500);

              $(".player_view").hide();
              $(".para_view").fadeIn(function(){
                try{
                  var top_px = ($("#li_"+global_audio).offset().top)-(($(window).height())-70)/2;
                  $('html, body').animate({
                      scrollTop: top_px
                  },0);
                }catch(e){
                  $(".para_view").fadeIn();
                }
              });
            }
            if($('.para_view').is(':visible')){
              //app minimize
            }
          }, false);

        });


    },
    receivedEvent: function(id) {

    }
};
app.initialize();
