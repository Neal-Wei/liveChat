window.onload = function(){
    var hichat = new hiChit()
    hichat.init()
}
var hiChit = function (){
    this.socket = null ;
} 

hiChit.prototype = {
    init:function (){
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect',function(){
             //连接到服务器后，显示昵称输入框
           $('#info').text("请输入登录名称");
            $('#nickWrapper').css("display" , 'block');
            $('#nicknameInput').focus();
            //昵称设置的确定按钮
            $('#loginBtn').on('click', function() {
                var nickName = $('#nicknameInput').val();
                //检查昵称输入框是否为空
                if (nickName.trim().length != 0) {
                    //不为空，则发起一个login事件并将输入的昵称发送到服务器
                    that.socket.emit('login', nickName);
                } else {
                    //否则输入框获得焦点
                    $('#nicknameInput').focus();
                };
            });
        })

        this.socket.on('nickExisted', function() {
            $('#info').text('!nickname is taken, choose another pls') //显示昵称被占用的提示
        });
    
        this.socket.on('loginSuccess', function() {
            document.title = 'hichat | ' + $('#nicknameInput').val();
            $('#loginWrapper').css("display",'none');//隐藏遮罩层显聊天界面
            $('.live_chat_textarea').focus();//让消息输入框获得焦点
        });

        // this.socket.on('system',function(nickName,userCount,type){
        //     // 判断用户是连接还是离开以显示不同的信息
        //     var msg = nickName + (type == 'login' ? ' joined' : ' left');
        //     var p = document.createElement('p');
        //     p.textContent = msg;
        //     that._myMsg('system ', msg, 'red');
        //    $('.live_chat_area_chat').after(p);
        //     //将在线人数显示到页面顶部
        //     // document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        // });


        // 发送消息
        $('#btn-send').on('click', function() {
            var msgInput = $('#btn-send');
            var messageInput = $('.live_chat_textarea'),
            msg = messageInput.val();
            messageInput.val("")
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); //把消息发送到服务器
                that._myMsg('我', msg); //把自己的消息显示到自己的窗口中
            };
        })
        
        this.socket.on('newMsg',function(user,msg){
            that._askMsg(user, msg);
        })

        $('#sendImage').on('change', function() {
             //检查是否有文件被选中
            if (this.files.length != 0) {
                 //获取文件并用FileReader进行读取
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._myMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    //读取成功，显示到页面并发送到服务器
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        })
        this.socket.on('newImg',function(user,img){
             that._displayImage(user, img);
        })

       $('nicknameInput').on('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = $('#nicknameInput').val();
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        });
        $('.live_chat_textarea').on('keyup', function(e) {
            var messageInput = $('.live_chat_textarea'),
                msg = messageInput.val()
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg);
                that._myMsg('我', msg);
            };
        });
        $(document).on("click","#resend",function(){
             var msg = $(this).closest(".chat_replay").find(".chat_msg .chat_msg_txt").text();
            that._myMsg('我', msg); //把自己的消息显示到自己的窗口中
        })
    },

    // 我的信息
    _myMsg:function(user,msg,color){
        var container = $(".live_chat_area_chat"),
            date = new Date().toTimeString().substr(0, 8);
            msgToDisplay = $(`<div class="chat_replay">
                                <div class="chat_heading">
                                    <img src="img/kobe1.jpg" alt="">
                                </div>
                                <div class="chat_name">
                                ${user}  ${date}
                                </div>
                                <div class="chat_msg">
                                    <span class="chat_msg_txt">${msg}</span>
                                </div>
                                  <p class="chat_msg_err pull-right">发送失败，<a id="resend">重新发送</a> <span style="color:#999">${date}</span></p>
                            </div>`)
        container.append(msgToDisplay);
        container.scrollTop = container.scrollHeight;               
    },

    // 用户信息
     _askMsg:function(user,msg,color){
        var container = $(".live_chat_area_chat"),
            date = new Date().toTimeString().substr(0, 8);
            msgToDisplay =  `<div class="chat_ask clearfix">
                            <div class="chat_heading">
                                <img src="img/kobe2.jpg" alt="">
                            </div>
                            <div class="chat_name">
                                    ${user} ${date}
                            </div>
                            <div class="chat_msg clearfix">
                                <span class="chat_msg_txt pull-right">${msg}</span>                                
                            </div>
                          
                        </div>`
            container.append(msgToDisplay);
        container.scrollTop = container.scrollHeight;                 
    },
    // 图片渲染
    _displayImage: function(user, imgData, color) {
        var container = $(".live_chat_area_chat"),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
    
}

