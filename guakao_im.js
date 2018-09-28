class Dialog {
    constructor(param) {
            //聊天系统文档
            let html = `
                <div id="fixed-box">
                <div id="fixed-version">
                    <p>系统检测到您的浏览器是IE10以下版本,无法正常运行此功能,请您先升级浏览器版本,您也可以扫描下图二维码,获得顾问专属服务.</p>
                    <p class="fixed-code"><img src=""></p>
                </div>
                <div id="fixed-icon">
                <span class="fixed-mark"></span>
                <span class="fixed-line"></span>
                <span class="fixed-txt">在线咨询</span>
                <span id="message-num">0</span>
                <span class="fixed-arrow"></span>
                </div>
                <!--浮框-->
                <div id="fixed-list">

                </div>
                </div>

                <div id="dialog-box">
                <div id="user-box">
                <div class="user-title">
                <span class="fixed-mark"></span>
                <span class="fixed-line"></span>
                <span class="fixed-txt">在线咨询</span>
                <span class="fixed-arrow"></span>
                </div>
                <div id="user-list">
                <ul class="user-list" id="contact-person">
                </ul>
                </div>
                </div>
                <div class="fl">
                <p class="dialog-title">
                <span class="dialog-name"></span>
                <span class="dialog-vipmark"></span>
                <span class="dialog-close">×</span>
                </p>
                <div class="dialog-rightbox">
                <div id="dialog-list" id="look-person">
                    <div class="dialog-content">

                    </div>
                    <div class="dialog-input">
                        <div class="oper-box">
                            <span id="emoji"></span>
                            <span id="image"><div id="file"></div></span>
                        </div>
                        <div id="message" contenteditable="true"></div>
                        <button type="button" id="sendMessage">发送</button>
                    </div>
                </div>
                <div id="recommoend-box">
                    <iframe src="/im/default/im-info"></iframe>
                </div>
                </div>
                </div>
                <div class="side-oper"></div>
                </div>
                <div id="drop-box">
                <div class="drop-cnt">

                </div>
                <div class="drop-editbox">
                <div pleacehold="输入回复" contenteditable="true" id="drop-msg"></div>
                <span id="drop-emoji" class="emoji-icon"></span>
                <span class="send-icon"></span>
                </div>
                </div>
                `;
            $("body").append(html); //初始化html
            this.apiUrl = "http://47.96.78.177:8083"; //通讯服务器地址
            this.uploadUrl = "http://47.96.78.177:8083"; //上传服务器地址

            //初始化表情（聊天体内）
            $("#emoji").emoji({
                content_el: "#message",
                list: [{
                    name: "QQ表情",
                    code: "qq_",
                    path: "/frontend/web/im_images/QQtouxiang/",
                    suffix: ".gif",
                    max_number: 120
                }]
            });
            //ajax发送前设置head信息
            jQuery.ajaxSetup({
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('Authentication', param.Authentication);
                }
            });
            let self = this;
            this.messageNum = 0; //未读信息数
            this.usersListNum = 0; //历史联系人个数
            this.userID = param.id; //当前登录人的imid
            this.userId = param.userId; //当前登录人的id
            this.userName = param.name; //当前登录人的名称
            this.userPic = param.pic; //当前登录人的头像
            this.userType = param.type; //当前登录人的身份类型
            this.recommend = param.recommend; //当前登录人的推荐顾问列表
            this.Authentication = param.Authentication;
            this.toUser = ""; //发送方ID
            this.toUserName = ""; //发送方姓名
            this.toUserPic = ''; //发送方头像路径
            this.toAdviserType = 0; //发送方身份类型
            this.toUserType = 0;


            this.adviser = []; //专属顾问列表
            this.online = []; //当前在线的回话用户列表
            this.underline = []; //当前不在的回话用户列表

            this.webID = param.WebID; //频道号
            this.current_user_channel = 'chat-one:' + self.webID + ':' + self.userID; //当前用户频道
            this.interval = null; //控制30分钟不操作退出房间
            this.loginF = param.loginF; //当没有登录人登录时，登录按钮执行的回调函数
            this.morePersonF = param.morePersonF; //企业用户登录时，更多个人按钮执行的回调函数
            this.moreTeamF = param.moreTeamF; //个人用户登录时，更多企业按钮执行的回调函数
            this.leavingMessageF = param.leavingMessageF; //当目标顾问未登录或繁忙时执行的留言回调函数
            this.settingAdviserF = param.settingAdviserF; //当收到对方申请绑定专属顾问请求时执行的回调
            this.fileF = param.fileF; //当传输文件按钮执行的回调函数
            this.picF = param.picF; //查看详细图片
            this.listClick = param.listClick;



            self.justGetUsers();
            //点击列表时，保存对方ID,对方名称以及调用chooseUser()
            setTimeout(function() {
                $(".user-list>li").click(function() {
                    let id = $(this).attr("data-id");
                    let name = $(this).find(".name").html();
                    let type = $(this).attr("data-usertype");
                    let toUserType = $(this).attr('data-tousertype');
                    self.toUser = id;
                    self.toUserName = name;
                    self.toAdviserType = type;
                    self.toUserType = toUserType;
                    if (self.adviser.length != 0) {
                        if (self.toAdviserType == self.adviser[0].id) {
                            $(".dialog-vipmark").addClass("active")
                        }
                    }
                    self.chooseUser($(this))
                })
            }, 400);

            //上传文件
            self.fileUpload();

            if (self.IEVersion()) {
                setTimeout(() => {
                    $("#fixed-version").show();
                    $.ajax({
                        url: "/im/default/saas-info",
                        type: "get",
                        dataType: "json",
                        data: {
                            user_id: self.userId
                        },
                        success: function(data) {
                            $(".fixed-code>img").attr("src", data.data);
                        },
                        error: function(erroe) {}
                    });
                }, 400);
                $('#fixed-icon').click(function() {
                    return false;
                })
            } else {
                //点击logo浮球
                $('#fixed-icon').click(function() {
                    //渲染列表页
                    self.getUsersList();
                    //图片上传
                    var uploader = WebUploader.create({
                        auto: true, // 选完文件后，是否自动上传。
                        swf: '../assets/js/Uploader.swf', // swf文件路径
                        server: self.uploadUrl + "/api/upload-image", // 文件接收服务端。
                        pick: '#file', // 选择文件的按钮。
                        // 只允许选择图片文件。
                        accept: {
                            title: 'Images',
                            extensions: 'gif,jpg,jpeg,bmp,png',
                            mimeTypes: 'image/*'
                        }
                    });
                    $('.webuploader-pick').html('');
                    uploader.on('uploadBeforeSend', function(obj, data, headers) {
                        headers["Authentication"] = "O4pH7suKVx2T9eDK6iN77pWj58nLxBJH";
                    });
                    uploader.on('uploadSuccess', function(file, res) {
                        let src = res.data.src;
                        let msgHtml = $('#message').html() + "<img src='" + src + "' />";
                        $('#message').html(msgHtml);
                    });

                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                    } else {
                        $(this).addClass('active');
                    }
                    $("#fixed-list").slideToggle(300); //聊天窗隐藏/显示

                });
            }


            //点击关闭聊天窗口
            $('.dialog-close').click(function() {
                $('#dialog-box').fadeOut();
            });

            //点击缩起按钮
            $('.user-title span').click(function() {
                $('#dialog-box').fadeOut(300);
                setTimeout(() => {
                    $("#fixed-list").slideToggle(300); //聊天窗隐藏/显示
                }, 300);
            });

            //侧边栏显示/收起
            $('#dialog-list').hover(function() {
                $('.side-oper').show();
            }, function() {
                $('.side-oper').hide();
            });
            $('.side-oper').hover(function() {
                $(this).show();
            });
            $('.side-oper').click(function() {
                if ($(this).hasClass('hide')) {
                    $(this).removeClass('hide');
                    $('#recommoend-box').show();
                } else {
                    $(this).addClass('hide');
                    $('#recommoend-box').hide();
                }
            });
            self.checkmessageNum(); //判断小浮球信息显示/隐藏
            self.showTime();


            $("#sendMessage").click(function() {
                    var content = $("#message").html().replace("<div><br></div>", "");
                    $("#message").html(content);
                    self.sendMessage();
                })
                //聊天框内输入框禁止输入回车键
            $("#message").keyup(function(e) {
                if (e.keyCode == 13) {
                    var content = $("#message").html().replace("<div><br></div>", "");
                    $("#message").html(content);
                    self.sendMessage();
                }
            });
            Echo.connector.options.auth.headers["id"] = self.userID;
            Echo.join("chat." + self.webID)
                .here((users) => {
                    //
                })
                .joining((user) => {
                    let self = this;

                    for (let i = 0; i < self.adviser.length; i++) {
                        if (self.adviser[i].contact_user_id == user.id) {
                            return;
                        }
                    }
                    for (let i = 0; i < self.underline.length; i++) {
                        if (self.underline[i].contact_user_id == user.id) {
                            self.underline.splice(i, 1);
                            user.last_contact_at = '';
                            user.contact_user_id = user.id;
                            self.online.unshift(user);
                            let contact = '',
                                dialog = "";

                            if (self.adviser.length != 0) {
                                for (let i = 0; i < self.adviser.length; i++) {
                                    self.adviser[i].last_contact_at = self.adviser[i].last_contact_at.substr(-8, 5);
                                    self.adviser[i].content == null ? self.adviser[i].content = "" : self.adviser[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.adviser[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.adviser[i].content ? msg = self.replace_em(self.adviser[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }
                                            contact += ` 
                    <li class="vip" data-id="` + self.adviser[i].contact_user_id + `" data-usertype="` + self.adviser[i].is_adviser + `" data-userType="` + self.adviser[i].contact_user_identity_id + `">
                        <img src="` + self.adviser[i].contact_user_head_img + `"/>
                        <span class="vip-mark"></span>
                        <div>
                            <p title="` + self.adviser[i].contact_user_name + `" class="name">` + self.adviser[i].contact_user_name + `</p>
                            <p title="` + msg + `" class="message">` + msg + `</p>
                        </div>
                        <p class="time">` + self.adviser[i].last_contact_at + `</p>
                        <span class="degree">` + length + `</span>
                    </li>
                `
                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").empty().append(contact);
                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            if (self.online.length != 0 && i == self.adviser.length - 1) {
                                                for (let i = 0; i < self.online.length; i++) {
                                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }

                                                            contact += `
                                    <li data-id="` + self.online[i].contact_user_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `" data-userType="` + self.online[i].contact_user_identity_id + `">
                                        <img src="` + self.online[i].contact_user_head_img + `"/>
                                        <div>
                                            <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                                            <p title="` + msg + `" class="message">` + msg + `</p>
                                        </div>
                                        <p class="time">` + self.online[i].last_contact_at + `</p>
                                        <span class="degree">` + length + `</span>
                                    </li>
                                `
                                                            self.messageNum += length;

                                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                                for (let i = 0; i < self.underline.length; i++) {
                                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                                    $.ajax({
                                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                                        type: "get",
                                                                        dataType: "json",
                                                                        headers: {
                                                                            "Authentication": self.Authentication,
                                                                        },
                                                                        success: function(resp) {
                                                                            let length = resp.data.length;
                                                                            let msg = '';
                                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                            if (msg.indexOf('{img_') != -1) {
                                                                                msg = '[图片]';
                                                                            }

                                                                            if (msg.indexOf('{file_') != -1) {
                                                                                msg = '[文件]';
                                                                            }
                                                                            contact += `

                                                    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                                                        <div>
                                                            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                            <p title="` + msg + `" class="message">` + msg + `</p>
                                                        </div>
                                                        <p class="time">` + self.underline[i].last_contact_at + `</p>
                                                        <span class="degree">` + length + `</span>
                                                    </li>
                                                `
                                                                            self.messageNum += length;
                                                                            $("#contact-person").find("li").remove();
                                                                            $("#contact-person").empty().append(contact);


                                                                            $('#message-num').html(self.messageNum);
                                                                            self.checkmessageNum();

                                                                            self.showTime();
                                                                        },
                                                                        error: function(err) {
                                                                            console.log(err)
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").empty().append(contact);
                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();
                                                                self.showTime();
                                                            }
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                if (self.underline.length != 0 && i == self.adviser.length - 1) {
                                                    for (let i = 0; i < self.underline.length; i++) {
                                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                        $.ajax({
                                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                            type: "get",
                                                            dataType: "json",
                                                            headers: {
                                                                "Authentication": self.Authentication,
                                                            },
                                                            success: function(resp) {
                                                                let length = resp.data.length;
                                                                let msg = '';
                                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                if (msg.indexOf('{img_') != -1) {
                                                                    msg = '[图片]';
                                                                }

                                                                if (msg.indexOf('{file_') != -1) {
                                                                    msg = '[文件]';
                                                                }
                                                                contact += `

                                        <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                            <img src="` + self.underline[i].contact_user_head_img + `"/>
                                            <div>
                                                <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                <p title="` + msg + `" class="message">` + msg + `</p>
                                            </div>
                                            <p class="time">` + self.underline[i].last_contact_at + `</p>
                                            <span class="degree">` + length + `</span>
                                        </li>
                                    `
                                                                self.messageNum += length;
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").empty().append(contact);


                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();

                                                                self.showTime();
                                                            },
                                                            error: function(err) {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    $("#contact-person").find("li").remove();
                                                    $("#contact-person").empty().append(contact);

                                                    $('#message-num').html(self.messageNum);
                                                    self.checkmessageNum();
                                                    self.showTime();
                                                }
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.online.length != 0) {
                                for (let i = 0; i < self.online.length; i++) {
                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                    <li data-id="` + self.online[i].contact_user_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                        <div>
                            <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                            <p title="` + msg + `" class="message">` + msg + `</p>
                        </div>
                        <p class="time">` + self.online[i].last_contact_at + `</p>
                        <span class="degree">` + length + `</span>
                    </li>
                `
                                            self.messageNum += length;

                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                for (let i = 0; i < self.underline.length; i++) {
                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }
                                                            contact += `
                                    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                                        <div>
                                            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                            <p title="` + msg + `" class="message">` + msg + `</p>
                                        </div>
                                        <p class="time">` + self.underline[i].last_contact_at + `</p>
                                        <span class="degree">` + length + `</span>
                                    </li>
                                `
                                                            self.messageNum += length;
                                                            $("#contact-person").find("li").remove();
                                                            $("#contact-person").empty().append(contact);


                                                            $('#message-num').html(self.messageNum);
                                                            self.checkmessageNum();

                                                            self.showTime();
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                $("#contact-person").find("li").remove();
                                                $("#contact-person").empty().append(contact);

                                                $('#message-num').html(self.messageNum);
                                                self.checkmessageNum();
                                                self.showTime();
                                            }
                                        },
                                        error: function(err) {
                                            dialog += `
                                                <div class="dialog-content-then" data-id="` + self.underline[i].contact_user_id + `"></div>
                                            `
                                            $(".dialog-content").empty().append(dialog);
                                            $(".dialog-content-then").each(function() {
                                                if ($(this).attr("data-id") == self.underline[i].contact_user_id) {
                                                    $(this).addClass("active");
                                                    let htmls = ""
                                                    for (let k = 0; k < resp.data.length; k++) {
                                                        htmls += `
                                                        <div class="dialog-left">
                                                            <img src="` + self.userPic + `" alt=""/>
                                                            <p>` + resp.data[k].content + `</p>
                                                        </div>
                                                    `
                                                    }
                                                    $(this).append(htmls);
                                                }
                                            })
                                        }
                                    })
                                }
                            } else if (self.underline.length != 0) {
                                for (let i = 0; i < self.underline.length; i++) {
                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                                            <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                                <img src="` + self.underline[i].contact_user_head_img + `"/>
                                                <div>
                                                    <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                                </div>
                                                <p class="time">` + self.underline[i].last_contact_at + `</p>
                                                <span class="degree">` + length + `</span>
                                            </li>
                                        `;

                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").empty().append(contact);

                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            self.showTime();
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            }



                            setTimeout(() => {
                                $("#contact-person li").each(function(ind, val) {
                                    dialog += `
                                    <div class="dialog-content-then" data-id="` + $(val).attr("data-id") + `"></div>
                                `
                                });
                                $(".dialog-content").empty().append(dialog);
                                $(".dialog-content-then").each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active');
                                    }
                                })
                                $('#contact-person li').each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active').siblings().removeClass('active');
                                        $.ajax({
                                            url: "/im/default/get-one-month-user-chat-info",
                                            type: "post",
                                            data: {
                                                userid: self.toUser
                                            },
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(res) {

                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        });
                                    }
                                });

                                $(".user-list>li").click(function() {
                                    let id = $(this).attr("data-id");
                                    let name = $(this).find(".name").html();
                                    let type = $(this).attr("data-usertype");
                                    let toUserType = $(this).attr("data-tousertype");
                                    self.toUser = id;
                                    self.toUserName = name;
                                    self.toAdviserType = type;
                                    self.toUserType = toUserType;

                                    if (self.adviser.length != 0) {
                                        if (self.toAdviserType == self.adviser[0].id) {
                                            $(".dialog-vipmark").addClass("active")
                                        }
                                    }
                                    self.chooseUser($(this))
                                });

                                let itemDialogContentThen = `<div class="dialog-content-then" data-id="` + self.toUser + `"></div>`;
                                $('.dialog-content').prepend(itemDialogContentThen);

                                //更新聊天对方姓名
                                $(".dialog-name").html(self.toUserName);
                                $("#message").focus();
                            }, 400)
                        }
                    }

                })
                .leaving((user) => {
                    let self = this;

                    for (let i = 0; i < self.adviser.length; i++) {
                        if (self.adviser[i].contact_user_id == user.id) {
                            return;
                        }
                    }

                    for (let i = 0; i < self.online.length; i++) {
                        if (self.online[i].contact_user_id == user.id) {
                            self.online.splice(i, 1);
                            user.last_contact_at = '';
                            user.contact_user_id = user.id;
                            self.underline.unshift(user);
                            let contact = '',
                                dialog = "";

                            if (self.adviser.length != 0) {
                                for (let i = 0; i < self.adviser.length; i++) {
                                    self.adviser[i].last_contact_at = self.adviser[i].last_contact_at.substr(-8, 5);
                                    self.adviser[i].content == null ? self.adviser[i].content = "" : self.adviser[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.adviser[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.adviser[i].content ? msg = self.replace_em(self.adviser[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                                            <li class="vip" data-id="` + self.adviser[i].contact_user_id + `" data-usertype="` + self.adviser[i].is_adviser + `" data-tousertype="` + self.adviser[i].contact_user_identity_id + `">
                                                <img src="` + self.adviser[i].contact_user_head_img + `"/>
                                                <span class="vip-mark"></span>
                                                <div>
                                                    <p title="` + self.adviser[i].contact_user_name + `" class="name">` + self.adviser[i].contact_user_name + `</p>
                                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                                </div>
                                                <p class="time">` + self.adviser[i].last_contact_at + `</p>
                                                <span class="degree">` + length + `</span>
                                            </li>
                                        `
                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").empty().append(contact);
                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            if (self.online.length != 0 && i == self.adviser.length - 1) {
                                                for (let i = 0; i < self.online.length; i++) {
                                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }

                                                            contact += `
                                                        <li data-id="` + self.online[i].contact_user_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                                                            <img src="` + self.online[i].contact_user_head_img + `"/>
                                                            <div>
                                                                <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                                                                <p title="` + msg + `" class="message">` + msg + `</p>
                                                            </div>
                                                            <p class="time">` + self.online[i].last_contact_at + `</p>
                                                            <span class="degree">` + length + `</span>
                                                        </li>
                                                    `
                                                            self.messageNum += length;

                                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                                for (let i = 0; i < self.underline.length; i++) {
                                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                                    $.ajax({
                                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                                        type: "get",
                                                                        dataType: "json",
                                                                        headers: {
                                                                            "Authentication": self.Authentication,
                                                                        },
                                                                        success: function(resp) {
                                                                            let length = resp.data.length;
                                                                            let msg = '';
                                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                            if (msg.indexOf('{img_') != -1) {
                                                                                msg = '[图片]';
                                                                            }

                                                                            if (msg.indexOf('{file_') != -1) {
                                                                                msg = '[文件]';
                                                                            }
                                                                            contact += `
                                                                        <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                                                            <img src="` + self.underline[i].contact_user_head_img + `"/>
                                                                            <div>
                                                                                <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                                                <p title="` + msg + `" class="message">` + msg + `</p>
                                                                            </div>
                                                                            <p class="time">` + self.underline[i].last_contact_at + `</p>
                                                                            <span class="degree">` + length + `</span>
                                                                        </li>
                                                                    `
                                                                            self.messageNum += length;
                                                                            $("#contact-person").find("li").remove();
                                                                            $("#contact-person").empty().append(contact);


                                                                            $('#message-num').html(self.messageNum);
                                                                            self.checkmessageNum();


                                                                            dialog += `
                                                    <div class="dialog-content-then" data-id="` + self.underline[i].contact_user_id + `"></div>
                                                `
                                                                            $(".dialog-content").empty().append(dialog);
                                                                            $(".dialog-content-then").each(function() {
                                                                                if ($(this).attr("data-id") == self.underline[i].contact_user_id) {
                                                                                    $(this).addClass("active");
                                                                                    let htmls = ""
                                                                                    for (let k = 0; k < resp.data.length; k++) {
                                                                                        htmls += `
                                                                <div class="dialog-left">
                                                                    <img src="` + self.toUserPic + `" alt=""/>
                                                                    <p>` + resp.data[k].content + `</p>
                                                                </div>
                                                            `
                                                                                    }
                                                                                    $(this).append(htmls);
                                                                                }
                                                                            })

                                                                            self.showTime();
                                                                        },
                                                                        error: function(err) {
                                                                            console.log(err)
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").empty().append(contact);
                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();
                                                                self.showTime();
                                                            }
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                if (self.underline.length != 0 && i == self.adviser.length - 1) {
                                                    for (let i = 0; i < self.underline.length; i++) {
                                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                        $.ajax({
                                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                            type: "get",
                                                            dataType: "json",
                                                            headers: {
                                                                "Authentication": self.Authentication,
                                                            },
                                                            success: function(resp) {
                                                                let length = resp.data.length;
                                                                let msg = '';
                                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                if (msg.indexOf('{img_') != -1) {
                                                                    msg = '[图片]';
                                                                }

                                                                if (msg.indexOf('{file_') != -1) {
                                                                    msg = '[文件]';
                                                                }
                                                                contact += `

                                        <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                            <img src="` + self.underline[i].contact_user_head_img + `"/>
                                            <div>
                                                <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                <p title="` + msg + `" class="message">` + msg + `</p>
                                            </div>
                                            <p class="time">` + self.underline[i].last_contact_at + `</p>
                                            <span class="degree">` + length + `</span>
                                        </li>
                                    `
                                                                self.messageNum += length;
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").empty().append(contact);


                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();


                                                                dialog += `
                                        <div class="dialog-content-then" data-id="` + self.underline[i].contact_user_id + `"></div>
                                    `
                                                                $(".dialog-content").empty().append(dialog);
                                                                $(".dialog-content-then").each(function() {
                                                                    if ($(this).attr("data-id") == self.underline[i].contact_user_id) {
                                                                        $(this).addClass('active');
                                                                        let htmls = ""
                                                                        for (let k = 0; k < resp.data.length; k++) {
                                                                            htmls += `
                                                    <div class="dialog-left">
                                                        <img src="` + self.toUserPic + `" alt=""/>
                                                        <p>` + resp.data[k].content + `</p>
                                                    </div>
                                                `
                                                                        }
                                                                        $(this).append(htmls);
                                                                    }
                                                                })

                                                                self.showTime();
                                                            },
                                                            error: function(err) {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    $("#contact-person").find("li").remove();
                                                    $("#contact-person").empty().append(contact);

                                                    $('#message-num').html(self.messageNum);
                                                    self.checkmessageNum();
                                                    self.showTime();
                                                }
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.online.length != 0) {
                                for (let i = 0; i < self.online.length; i++) {
                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                    <li data-id="` + self.online[i].contact_user_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                        <img src="` + self.online[i].contact_user_head_img + `"/>
                        <div>
                            <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                            <p title="` + msg + `" class="message">` + msg + `</p>
                        </div>
                        <p class="time">` + self.online[i].last_contact_at + `</p>
                        <span class="degree">` + length + `</span>
                    </li>
                `
                                            self.messageNum += length;

                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                for (let i = 0; i < self.underline.length; i++) {
                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }
                                                            contact += `
                                    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                                        <div>
                                            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                            <p title="` + msg + `" class="message">` + msg + `</p>
                                        </div>
                                        <p class="time">` + self.underline[i].last_contact_at + `</p>
                                        <span class="degree">` + length + `</span>
                                    </li>
                                `
                                                            self.messageNum += length;
                                                            $("#contact-person").find("li").remove();
                                                            $("#contact-person").empty().append(contact);


                                                            $('#message-num').html(self.messageNum);
                                                            self.checkmessageNum();

                                                            self.showTime();
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                $("#contact-person").find("li").remove();
                                                $("#contact-person").empty().append(contact);

                                                $('#message-num').html(self.messageNum);
                                                self.checkmessageNum();
                                                self.showTime();
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.underline.length != 0) {
                                for (let i = 0; i < self.underline.length; i++) {
                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                        <div>
                            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                            <p title="` + msg + `" class="message">` + msg + `</p>
                        </div>
                        <p class="time">` + self.underline[i].last_contact_at + `</p>
                        <span class="degree">` + length + `</span>
                    </li>
                `

                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").empty().append(contact);

                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            self.showTime();
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            }

                            setTimeout(() => {
                                $("#contact-person li").each(function(ind, val) {
                                    dialog += `
        <div class="dialog-content-then" data-id="` + $(val).attr("data-id") + `"></div>
    `
                                })
                                $(".dialog-content").empty().append(dialog);
                                $(".dialog-content-then").each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active');
                                    }
                                })
                                $('#contact-person li').each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active').siblings().removeClass('active');
                                        $.ajax({
                                            url: "/im/default/get-one-month-user-chat-info",
                                            type: "post",
                                            data: {
                                                userid: self.toUser
                                            },
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(res) {

                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        });
                                    }
                                });

                                $(".user-list>li").click(function() {
                                    let id = $(this).attr("data-id");
                                    let type = $(this).attr("data-usertype");
                                    let toUserType = $(this).attr("data-tousertype");
                                    self.toUser = id;
                                    self.toUserName = name;
                                    self.toAdviserType = type;
                                    self.toUserType = toUserType;

                                    if (self.adviser.length != 0) {
                                        if (self.toAdviserType == self.adviser[0].id) {
                                            $(".dialog-vipmark").addClass("active")
                                        }
                                    }
                                    self.chooseUser($(this))
                                });

                                let itemDialogContentThen = `<div class="dialog-content-then" data-id="` + self.toUser + `"></div>`;
                                $('.dialog-content').prepend(itemDialogContentThen);

                                //更新聊天对方姓名
                                $(".dialog-name").html(self.toUserName);
                                $("#message").focus();
                            }, 400)
                        }
                    }

                })
                //监听房间，接收到信息时触发
            Echo.channel(self.current_user_channel)
                .listen('Chat', (e) => {
                    var companyName = "";
                    var isAdviser = "";
                    if (e.msg.event_type != 2) {
                        let self = this;
                        if (e.msg.content_type == 1) {
                            let isHasUser = false;
                            let date = new Date(e.msg.created_at * 1000);
                            let hour = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours();
                            let min = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes();
                            e.msg.created_at = hour + ':' + min;
                            e.msg.content == null ? e.msg.content = "" : e.msg.content;
                            if ($("#contact-person>li").length == 0) { //最近联系人列表为空时
                                self.messageNum++;
                            } else { //最近联系人列表不为空时
                                $("#contact-person>li").each(function() {
                                    if ($(this).attr("data-id") == e.msg.from_id) {
                                        if ($(this).hasClass("active")) { //当前联系人已激活
                                            $(this).find(".degree").html(0);
                                            $.ajax({
                                                url: self.apiUrl + "/api/read/" + self.userID + "/" + e.msg.from_id + "",
                                                type: "get",
                                                dataType: "json",
                                                headers: {
                                                    "Authentication": self.Authentication,
                                                }
                                            })
                                        } else { //当前联系人未激活
                                            self.messageNum++;
                                            $(this).find(".degree").html(parseInt($(this).find(".degree").html()) + 1);
                                        }
                                        let content = '';
                                        e.msg.content ? content = self.replace_em(e.msg.content) : content;
                                        let userCnt = '';
                                        let htmlCnt = '';

                                        $(this).find(".time").html(e.msg.created_at);
                                        isHasUser = true;
                                        self.showTime();
                                        $(".dialog-content-then").each(function() {
                                            if (content.indexOf('{img_') != -1) {
                                                var reg = new RegExp('{img_', "g");
                                                var reg2 = new RegExp('img_}', "g");
                                                htmlCnt = content.replace(reg, '<img src="');
                                                htmlCnt = htmlCnt.replace(reg2, '">');
                                                userCnt = '[图片]';
                                            } else if (content.indexOf('{file_') != -1) {
                                                userCnt = '[文件]';
                                                content = content.replace("{file_", "{").replace("_file}", "}");
                                                var obj = JSON.parse(content);
                                                htmlCnt = `
                            <span class="file-title" title=` + obj.title + `>` + obj.title + `</span>
                            <span class="file-content">` + obj.content + `</span>
                            `
                                            } else {
                                                userCnt = htmlCnt = content;
                                            }

                                            $(this).find(".message").html(userCnt);
                                            $(this).find(".message").attr("title", userCnt);

                                            let html = `
                    <div class="dialog-left">
                        <img src="` + self.toUserPic + `" alt=""/>
                        <p>` + htmlCnt + `</p>
                    </div>
                `;
                                            $(this).html($(this).html() + html);
                                            let height = 20;
                                            if (e.msg.tips) {
                                                let tips = `<p class="warn-tips"><span></span>` + e.msg.tips + `</p>`;
                                                $(this).append(tips);
                                                $(this).children('p').each(function() {
                                                    height += $(this).height();
                                                })
                                            }
                                            $(this).children("div").each(function() {
                                                height += $(this).height() + parseInt($(this).css('marginTop'));
                                            });
                                            console.log(height);
                                            $(this).scrollTop(height - 300);
                                        })
                                        return false;
                                    } else {
                                        isHasUser = false;
                                    }
                                })
                            }
                            if (!isHasUser) { //没有当前联系人
                                e.msg.content == null ? e.msg.content = "" : e.msg.content;
                                let content = '';
                                e.msg.content ? content = self.replace_em(e.msg.content) : content;
                                let userCnt = '';
                                let htmlCnt = '';
                                if (content.indexOf('{img_') != -1) {
                                    var reg = new RegExp('{img_', "g");
                                    var reg2 = new RegExp('img_}', "g");
                                    htmlCnt = content.replace(reg, '<img src="');
                                    htmlCnt = htmlCnt.replace(reg2, '>');
                                    userCnt = '[图片]';
                                } else if (content.indexOf('{file_') != -1) {
                                    userCnt = '[文件]';
                                    var obj = jQuery.parseJSON(content);
                                    htmlCnt = `
                <span class="file-title" title=` + obj.title + `>` + obj.title + `</span>
                <span class="file-content">` + obj.content + `</span>
                `
                                } else {
                                    userCnt = htmlCnt = content;
                                }
                                let user = `
                            <li data-id="` + e.msg.from_id + `">
                                <img src="` + self.userPic + `"/>
                                <div>
                                    <p title="` + e.msg.from_name + `" class="name">` + e.msg.from_name + `</ptoUserName>
                                    <p title="` + userCnt + `" class="message">` + userCnt + `</p>
                                </div>
                                <p class="time">` + e.msg.created_at + `</p>
                                <span class="degree">1</span>
                            </li>
                        `
                                $("#contact-person").html(user);
                                let html = `
                            <div class="dialog-content-then" data-id="` + e.msg.from_id + `">
                                <div class="dialog-left">
                                    <img src="` + self.toUserPic + `" alt=""/>
                                    <p>` + htmlCnt + `</p>
                                </div>
                            </div>
                        `
                                $(".dialog-content").html(html);
                                let height = 20;
                                if (e.msg.tips) {
                                    let tips = `<p class="warn-tips"><span></span>` + e.msg.tips + `</p>`;
                                    $(this).append(tips);
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                                $(".user-list>li").click(function() {
                                    let id = $(this).attr("data-id");
                                    let name = $(this).find(".name").html();
                                    let type = $(this).attr("data-usertype");
                                    let toUserType = $(this).attr("data-tousertype");
                                    self.toUser = id;
                                    self.toUserName = name;
                                    self.toAdviserType = type;
                                    self.toUserType = toUserType;

                                    if (self.adviser.length != 0) {
                                        if (self.toAdviserType == self.adviser[0].id) {
                                            $(".dialog-vipmark").addClass("active")
                                        }
                                    }
                                    self.chooseUser($(this));
                                });
                                self.showTime();
                            }
                        } else if (e.msg.content_type == 3) {
                            //判断当前用户是否有专属顾问
                            if (self.userType == 1) {
                                $.ajax({
                                    url: "/im/default/get-adviser",
                                    get: "get",
                                    data: {
                                        zhanghao: self.userName,
                                        leixing: self.userType
                                    },
                                    success: function(res) {
                                        if (res.code == 200) {
                                            isAdviser = res.data.content.erweima;
                                        } else {
                                            isAdviser = "";
                                        }
                                    },
                                    error: function() {}
                                })
                            } else if (self.userType == 2) {
                                $.ajax({
                                    url: "/im/default/get-user-info",
                                    type: "post",
                                    dataType: "json",
                                    data: {
                                        userid: self.userId
                                    },
                                    success: function(res) {
                                        companyName = res.data.companyName;
                                        $.ajax({
                                            url: "/im/default/get-adviser",
                                            get: "get",
                                            data: {
                                                zhanghao: self.userName,
                                                leixing: self.userType,
                                                qiyemingcheng: companyName
                                            },
                                            success: function(res) {
                                                if (res.code == 200) {
                                                    isAdviser = res.data.content.erweima;
                                                } else {
                                                    isAdviser = "";
                                                }
                                            },
                                            error: function() {}
                                        })
                                    }
                                })
                            }
                            if (e.msg.content == "您给对方发送了专属顾问申请" && isAdviser == "") {
                                let html = `<div class="getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>`;
                                $(".dialog-content-then.active").append(html);
                                if ($(".setting-box").length <= 0) {
                                    let setObj = self.settingAdviserF();
                                    Object.defineProperty(setObj, 'setId', {
                                        set: function(val) {
                                            if (setObj.setAdviserId) {
                                                $.ajax({
                                                    url: self.apiUrl + "/api/sendMsg?from_id=" + self.userID + "&to_id=" + self.toUser + "&content=同意&content_type=3&user_identity_id=" + self.userType + "&from_user_head_img=" + self.userPic + "&from_user_name=" + self.userName,
                                                    type: "get",
                                                    dataType: "json",
                                                    headers: {
                                                        "Authentication": self.Authentication,
                                                    }
                                                })
                                            } else {
                                                $.ajax({
                                                    url: self.apiUrl + "/api/sendMsg?from_id=" + self.userID + "&to_id=" + self.toUser + "&content=拒绝&content_type=3&user_identity_id=" + self.userType + "&from_user_head_img=" + self.userPic + "&from_user_name=" + self.userName,
                                                    type: "get",
                                                    dataType: "json",
                                                    headers: {
                                                        "Authentication": self.Authentication,
                                                    }
                                                })
                                            }
                                        }
                                    });
                                } else {
                                    return false;
                                }
                            } else if (e.msg.content == "同意") {
                                let html = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div>`;
                                $(".dialog-content-then.active").append(html);
                            } else if (e.msg.content == "拒绝") {
                                let html = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>`;
                                $(".dialog-content-then.active").append(html);
                            }
                        } else if (e.msg.content_type == 2) {
                            if (e.msg.content == "成功") {
                                let html = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div>`;
                                $(".dialog-content-then.active").append(html);
                            } else if (e.msg.content == '失败') {
                                let html = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>`;
                                $(".dialog-content-then.active").append(html);
                            }
                        }

                    }
                });
        }
        //检测是否是IE10及以下浏览器
    IEVersion() {
            //取得浏览器的userAgent字符串
            var userAgent = navigator.userAgent;
            //判断是否IE浏览器
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
            if (isIE) {
                var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
                reIE.test(userAgent);
                var fIEVersion = parseFloat(RegExp["$1"]);
                if (fIEVersion < 10 || !isSupportPlaceholder()) {
                    return true;
                } else {
                    return false;
                }
            };
        }
        //仅仅获取联系人
    justGetUsers() {
        let self = this;
        $.ajax({
            url: self.apiUrl + "/api/users?user_id=" + self.userID,
            type: "get",
            dataType: "json",
            headers: {
                "Authentication": self.Authentication,
            },
            success: function(res) {
                if (res.status === 400) {
                    return;
                }
                self.usersListNum = res.data.contact.length;
            },
            error: function(err) {
                console.log(err)
            }
        })
    }

    //获取联系人并渲染列表
    getUsersList() {
        let self = this;
        if (self.userID == 0) {
            //没有登录
            let html = `
            <div class="fixed-nologin">
            <p>未登录查看新信息！</p>
            <div class="go-login">去登录&gt;&gt;</div>
            </div>
            `;
            $('#fixed-list').append(html);
        } else if (self.usersListNum == 0) {
            //建企/人才未咨询过任何人
            let html = `
            <div class="fixed-nohistory">
            <p class="tip">您还没有咨询过任何人～</p>
            <p class="title">` + self.recommend.title + `</p><ul>
            `;
            for (let i = 0; i < self.recommend.list.length; i++) {
                html += `
                <li>
                <div>
                    <div class="title" title="` + self.recommend.list[i].title + `">` + self.recommend.list[i].title + `</div>
                    <div>
                        <span class="msg">` + self.recommend.list[i].price + `</span>
                        <span class="msg" title="` + self.recommend.list[i].address + `">` + self.recommend.list[i].address + `</span>
                    </div>
                </div>
                <div class="fixed-btn" data-id="` + self.recommend.list[i].id + `" data-name="` + self.recommend.list[i].name + `" data-pic="` + self.recommend.list[i].pic + `" data-zhanghao="` + self.recommend.list[i].zhanghao + `"></div>
                </li>
                `;
            }

            html += `
            </ul>
            <div class="fixed-more">` + self.recommend.button + `</div></div>
            `;
            $('#fixed-list').append(html);
        } else if (self.usersListNum > 0) {
            //建企/人才咨询列表
            let html = `
            <div id="user-list-box"></div>
            `;
            $('#fixed-list').append(html);
            $.ajax({
                url: self.apiUrl + "/api/users?user_id=" + self.userID,
                type: "get",
                dataType: "json",
                headers: {
                    "Authentication": self.Authentication,
                },
                success: function(resp) {
                    if (resp.status === 400) {
                        return;
                    }
                    self.drawUserList(resp, '#user-list-box');

                },
                error: function(err) {
                    console.log(err)
                }
            })
        }

        //点击登录
        $('.go-login').click(function() {
            self.loginF();
        });

        //点击推荐联系人
        $('.fixed-btn').click(function() {
            //self.toUser = $(this).attr('data-id');
            self.toUserName = $(this).attr('data-name');
            // self.toUserPic = $(this).attr('data-pic');
            let zhanghao = $(this).attr("data-zhanghao");
            $.ajax({
                url: "/im/default/get-adviser",
                type: "get",
                data: {
                    zhanghao: zhanghao,
                    leixing: 0
                },
                success: function(res) {
                    res = JSON.parse(res);
                    self.open(res.data.content.weiliaoid, self.toUserName, res.data.content.touxiangdizhi);
                },
                error: function() {}
            })

        });

        //点击推荐联系下的更多按钮
        $('.fixed-more').click(function() {
            if (self.userType == 1) {
                //当前登录人为人才
                self.moreTeamF();

            } else if (self.userType == 2) {
                //当前登录人为建企
                self.morePersonF();
            }
        });
    }

    //渲染列表
    drawUserList(res, box) {
        let self = this;
        let arr = res.data.contact;
        self.adviser = [];
        self.online = [];
        self.underline = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].is_adviser == 1) {
                self.adviser.push(arr[i]);
                arr.remove(arr[i]);
                i = i - 1;
            } else if (arr[i].online == 1) {
                self.online.push(arr[i]);
                arr.remove(arr[i])
                i = i - 1;
            } else {
                self.underline.push(arr[i]);
                arr.remove(arr[i])
                i = i - 1;
            }
        }
        let contact = "",
            dialog = "";
        if (self.adviser.length != 0) {
            for (let i = 0; i < self.adviser.length; i++) {
                self.adviser[i].last_contact_at = self.adviser[i].last_contact_at.substr(-8, 5);
                self.adviser[i].content == null ? self.adviser[i].content = "" : self.adviser[i].content;
                $.ajax({
                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.adviser[i].contact_user_id + "",
                    type: "get",
                    dataType: "json",
                    headers: {
                        "Authentication": self.Authentication,
                    },
                    success: function(resp) {
                        let length = resp.data.length;
                        let msg = '';
                        self.adviser[i].content ? msg = self.replace_em(self.adviser[i].content) : msg;

                        if (msg.indexOf('{img_') != -1) {
                            msg = '[图片]';
                        }

                        if (msg.indexOf('{file_') != -1) {
                            msg = '[文件]';
                        }
                        contact += `
                            <li class="vip" data-id="` + self.adviser[i].contact_user_id + `" data-usertype="` + self.adviser[i].is_adviser + `" data-tousertype="` + self.adviser[i].contact_user_identity_id + `">
                                <img src="` + self.adviser[i].contact_user_head_img + `"/>
                                <span class="vip-mark"></span>
                                <div>
                                    <p title="` + self.adviser[i].contact_user_name + `" class="name">` + self.adviser[i].contact_user_name + `</p>
                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                </div>
                                <p class="time">` + self.adviser[i].last_contact_at + `</p>
                                <span class="degree">` + length + `</span>
                            </li>
                        `
                        self.messageNum += length;
                        if (self.online.length != 0 && i == self.adviser.length - 1) {
                            for (let i = 0; i < self.online.length; i++) {
                                self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                $.ajax({
                                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                    type: "get",
                                    dataType: "json",
                                    headers: {
                                        "Authentication": self.Authentication,
                                    },
                                    success: function(resp) {
                                        let length = resp.data.length;
                                        let msg = '';
                                        self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;

                                        if (msg.indexOf('{img_') != -1) {
                                            msg = '[图片]';
                                        }

                                        if (msg.indexOf('{file_') != -1) {
                                            msg = '[文件]';
                                        }
                                        contact += `
                        <li data-id="` + self.online[i].contact_user_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                            <img src="` + self.online[i].contact_user_head_img + `"/>
                            <div>
                                <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                                <p title="` + msg + `" class="message">` + msg + `</p>
                            </div>
                            <p class="time">` + self.online[i].last_contact_at + `</p>
                            <span class="degree">` + length + `</span>
                        </li>
                    `
                                        self.messageNum += length;
                                        if (self.underline.length != 0 && i == self.online.length - 1) {
                                            for (let i = 0; i < self.underline.length; i++) {
                                                self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                self.underline[i].content == null ? self.underline[i].content = "" : self.online[i].content;
                                                $.ajax({
                                                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                    type: "get",
                                                    dataType: "json",
                                                    headers: {
                                                        "Authentication": self.Authentication,
                                                    },
                                                    success: function(resp) {
                                                        let length = resp.data.length;
                                                        let msg = '';
                                                        self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                        if (msg.indexOf('{img_') != -1) {
                                                            msg = '[图片]';
                                                        }

                                                        if (msg.indexOf('{file_') != -1) {
                                                            msg = '[文件]';
                                                        }
                                                        contact += `
                                    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                                        <div>
                                            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                            <p title="` + msg + `" class="message">` + msg + `</p>
                                        </div>
                                        <p class="time">` + self.underline[i].last_contact_at + `</p>
                                        <span class="degree">` + length + `</span>
                                    </li>
                                `
                                                        self.messageNum += length;
                                                        $(box).empty().append(contact);
                                                        $('#message-num').html(self.messageNum);
                                                        self.checkmessageNum();
                                                        self.showTimeList();

                                                        //点击某一具体聊天人
                                                        $(box).find('li').click(function() {
                                                            self.toUser = $(this).attr('data-id');
                                                            self.toUserName = $(this).find('.name').text();
                                                            self.toUserPic = $(this).find('img').attr('src');
                                                            self.toUserType = $(this).attr("data-tousertype");
                                                            self.open(self.toUser, self.toUserName, self.toUserPic, self.toUserType);
                                                        })
                                                    },
                                                    error: function(err) {
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        } else {
                                            $(box).empty().append(contact);
                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();
                                            self.showTimeList();

                                            //点击某一具体聊天人
                                            $(box).find('li').click(function() {
                                                self.toUser = $(this).attr('data-id');
                                                self.toUserName = $(this).find('.name').text();
                                                self.toUserPic = $(this).find('img').attr('src');
                                                self.toUserType = $(this).attr("data-tousertype");
                                                self.open(self.toUser, self.toUserName, self.toUserPic, self.toUserType);
                                            })
                                        }
                                    },
                                    error: function(err) {
                                        console.log(err)
                                    }
                                })
                            }
                        } else if (self.underline.length != 0 && i == self.adviser.length - 1) {
                            for (let i = 0; i < self.underline.length; i++) {
                                self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                self.underline[i].content == null ? self.underline[i].content = "" : self.online[i].content;
                                $.ajax({
                                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                    type: "get",
                                    dataType: "json",
                                    headers: {
                                        "Authentication": self.Authentication,
                                    },
                                    success: function(resp) {
                                        let length = resp.data.length;
                                        let msg = '';
                                        self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;

                                        if (msg.indexOf('{img_') != -1) {
                                            msg = '[图片]';
                                        }

                                        if (msg.indexOf('{file_') != -1) {
                                            msg = '[文件]';
                                        }
                                        contact += `
                        <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype"` + self.underline[i].contact_user_identity_id + `">
                            <img src="` + self.underline[i].contact_user_head_img + `"/>
                            <div>
                                <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                <p title="` + msg + `" class="message">` + msg + `</p>
                            </div>
                            <p class="time">` + self.underline[i].last_contact_at + `</p>
                            <span class="degree">` + length + `</span>
                        </li>
                    `
                                        self.messageNum += length;
                                        $(box).empty().append(contact);
                                        $('#message-num').html(self.messageNum);
                                        self.checkmessageNum();
                                        self.showTimeList();

                                        //点击某一具体聊天人
                                        $(box).find('li').click(function() {
                                            self.toUser = $(this).attr('data-id');
                                            self.toUserName = $(this).find('.name').text();
                                            self.toUserPic = $(this).find('img').attr('src');
                                            self.toUserType = $(this).attr("data-tousertype");
                                            self.open(self.toUser, self.toUserName, self.toUserPic, self.toUserType);
                                        })
                                    },
                                    error: function(err) {
                                        console.log(err)
                                    }
                                })
                            }
                        } else {
                            $(box).empty().append(contact);
                            $('#message-num').html(self.messageNum);
                            self.checkmessageNum();
                            self.showTimeList();

                            //点击某一具体聊天人
                            $(box).find('li').click(function() {


                                self.toUser = $(this).attr('data-id');
                                self.toUserName = $(this).find('.name').text();
                                self.toUserPic = $(this).find('img').attr('src');
                                self.open(self.toUser, self.toUserName, self.toUserPic);
                            })
                        }
                    },
                    error: function(err) {
                        console.log(err)
                    }
                })
            }
        } else if (self.online.length != 0) {
            for (let i = 0; i < self.online.length; i++) {
                self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                $.ajax({
                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                    type: "get",
                    dataType: "json",
                    headers: {
                        "Authentication": self.Authentication,
                    },
                    success: function(resp) {
                        let length = resp.data.length;
                        let msg = '';
                        self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;

                        if (msg.indexOf('{img_') != -1) {
                            msg = '[图片]';
                        }

                        if (msg.indexOf('{file_') != -1) {
                            msg = '[文件]';
                        }
                        contact += `
                        <li data-id="` + self.online[i].contact_user_id + `" data-tousertype="` + self.online[i].contact_user_identity_id + `"  class="online" data-usertype="` + self.online[i].is_adviser + `">
                            <img src="` + self.online[i].contact_user_head_img + `"/>
                            <div>
                                <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                                <p title="` + msg + `" class="message">` + msg + `</p>
                            </div>
                            <p class="time">` + self.online[i].last_contact_at + `</p>
                            <span class="degree">` + length + `</span>
                        </li>
                        `
                        self.messageNum += length;
                        if (self.underline.length != 0 && i == self.online.length - 1) {
                            for (let i = 0; i < self.underline.length; i++) {
                                self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                $.ajax({
                                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                    type: "get",
                                    dataType: "json",
                                    headers: {
                                        "Authentication": self.Authentication,
                                    },
                                    success: function(resp) {
                                        let length = resp.data.length;
                                        let msg = '';
                                        self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                        if (msg.indexOf('{img_') != -1) {
                                            msg = '[图片]';
                                        }

                                        if (msg.indexOf('{file_') != -1) {
                                            msg = '[文件]';
                                        }
                                        contact += `
                <li data-id="` + self.underline[i].contact_user_id + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `"  class="underline" data-usertype="` + self.underline[i].is_adviser + `">
                    <img src="` + self.underline[i].contact_user_head_img + `"/>
                    <div>
                        <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                        <p title="` + msg + `" class="message">` + msg + `</p>
                    </div>
                    <p class="time">` + self.underline[i].last_contact_at + `</p>
                    <span class="degree">` + length + `</span>
                </li>
            `
                                        self.messageNum += length;
                                        $(box).empty().append(contact);
                                        $('#message-num').html(self.messageNum);
                                        self.checkmessageNum();
                                        self.showTimeList();

                                        //点击某一具体聊天人
                                        $(box).find('li').click(function() {
                                            self.toUser = $(this).attr('data-id');
                                            self.toUserName = $(this).find('.name').text();
                                            self.toUserPic = $(this).find('img').attr('src');
                                            self.open(self.toUser, self.toUserName, self.toUserPic);
                                        })
                                    },
                                    error: function(err) {
                                        console.log(err)
                                    }
                                })
                            }
                        } else {
                            $(box).empty().append(contact);
                            $('#message-num').html(self.messageNum);
                            self.checkmessageNum();
                            self.showTimeList();

                            //点击某一具体聊天人
                            $(box).find('li').click(function() {


                                self.toUser = $(this).attr('data-id');
                                self.toUserName = $(this).find('.name').text();
                                self.toUserPic = $(this).find('img').attr('src');
                                self.open(self.toUser, self.toUserName, self.toUserPic);
                            })
                        }
                    },
                    error: function(err) {
                        console.log(err)
                    }
                })
            }
        } else if (self.underline.length != 0) {
            for (let i = 0; i < self.underline.length; i++) {
                self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                $.ajax({
                    url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                    type: "get",
                    dataType: "json",
                    headers: {
                        "Authentication": self.Authentication,
                    },
                    success: function(resp) {
                        let length = resp.data.length;
                        let msg = '';
                        self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;

                        if (msg.indexOf('{img_') != -1) {
                            msg = '[图片]';
                        }

                        if (msg.indexOf('{file_') != -1) {
                            msg = '[文件]';
                        }
                        contact += `
    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
        <img src="` + self.underline[i].contact_user_head_img + `"/>
        <div>
            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
            <p title="` + msg + `" class="message">` + msg + `</p>
        </div>
        <p class="time">` + self.underline[i].last_contact_at + `</p>
        <span class="degree">` + length + `</span>
    </li>
`
                        self.messageNum += length;

                        $(box).empty().append(contact);
                        $('#message-num').html(self.messageNum);
                        self.checkmessageNum();
                        self.showTimeList();

                        //点击某一具体聊天人
                        $(box).find('li').click(function() {
                            self.toUser = $(this).attr('data-id');
                            self.toUserName = $(this).find('.name').text();
                            self.toUserPic = $(this).find('img').attr('src');
                            self.toUserType = $(this).attr("data-tousertype");

                            self.open(self.toUser, self.toUserName, self.toUserPic, self.toUserType);
                        })
                    },
                    error: function(err) {
                        console.log(err)
                    }
                })
            }
        }

        setTimeout(function() {
            $("#contact-person li").each(function(ind, val) {
                dialog += `
                <div class="dialog-content-then" data-id="` + $(val).attr("data-id") + `"></div>
                `
            })
            $(".dialog-content").empty().append(dialog);
            $(".dialog-content-then").each(function() {
                if ($(this).attr("data-id") == self.toUser) {
                    $(this).addClass('active');
                }
            })
        }, 400)

    }

    //选择联系人
    chooseUser(ele) {
            let self = this;
            sessionStorage.setItem("nowContact", this.toUser);
            setTimeout(function() {
                $("#recommoend-box").empty().append("<iframe src='/im/default/im-info'></iframe>");
            }, 400)

            $(".user-list>li").each(function() {
                if ($(this).hasClass("active")) {
                    $.ajax({
                        url: self.apiUrl + "/api/update-or-create-last-contact-time?user_id=" + self.userID + "&contact_user_id=" + self.toUser,
                        type: "get",
                        dataType: "json"
                    })
                }
            })
            ele.addClass("active").siblings().removeClass("active").parent().siblings().find("li").removeClass("active");
            if (self.toUserType == 5 && ele.hasClass("underline")) {
                if ($(".leaving-mark").length > 0) {
                    $(".leaving-mark").remove();
                    self.leavingMessageF()
                } else {
                    self.leavingMessageF()
                }
            }
            $.ajax({
                url: "/im/default/get-one-month-user-chat-info",
                type: "post",
                data: {
                    userid: self.toUser
                },
                dataType: "json",
                headers: {
                    "Authentication": self.Authentication,
                },
                success: function(res) {

                },
                error: function(err) {
                    console.log(err)
                }
            });
            let viewedNum = ele.find(".degree").html();
            self.messageNum = self.messageNum - viewedNum;
            $('#message-num').html(self.messageNum);
            self.checkmessageNum();

            $.ajax({
                url: self.apiUrl + "/api/read/" + self.userID + "/" + self.toUser + "",
                type: "get",
                dataType: "json",
                headers: {
                    "Authentication": self.Authentication,
                }
            })
            ele.find(".degree").html(0);
            self.showTime();

            let html = '';
            let dataList = [];
            let chatHtml = '';
            let page = 1;
            $(".dialog-content-then").each(function() {
                if ($(this).attr("data-id") == self.toUser) {
                    $(this).addClass("active").siblings().removeClass('active');
                    html = $(this).html();
                }
            });
            $(".getMessage").remove();

            function getUserChat(from_id, to_id, page) {
                $.ajax({
                    url: self.apiUrl + "/api/get-messages/" + from_id + "/" + to_id + "?page=" + page,
                    type: "get",
                    dataType: "json",
                    headers: {
                        "Authentication": self.Authentication,
                    },
                    success: function(res) {
                        dataList = res.data.data;
                        setTimeout(() => {
                            if (res.data.total > 20) {
                                if (res.data.current_page == Math.ceil(res.data.total / res.data.per_page)) {
                                    for (var i = 0; i < dataList.length; i++) {
                                        if (dataList[i].from_id == self.userID) {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                let arr = [];
                                                if (dataList[i].content.indexOf("{url_") != -1) {
                                                    arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                    msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p class="dialog-resume">` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                } else {
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p>` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                }

                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '同意') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '拒绝') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        } else {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                chatHtml =
                                                    `<div class="dialog-left getMessage ">
                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                        <p>` + msg + `</p>
                        </div>` + chatHtml;
                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        }
                                    }
                                    $(".dialog-content-then.active").html(chatHtml);
                                    $(".dialog-content-then.active").prepend("<div class='no-more'>没有聊天记录了</div>");
                                } else {
                                    for (var i = 0; i < dataList.length; i++) {
                                        if (dataList[i].from_id == self.userID) {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                let arr = [];
                                                if (dataList[i].content.indexOf("{url_") != -1) {
                                                    arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                    msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p class="dialog-resume">` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                } else {
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p>` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                }

                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '同意') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '拒绝') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        } else {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                chatHtml =
                                                    `<div class="dialog-left getMessage ">
                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                        <p>` + msg + `</p>
                        </div>` + chatHtml;
                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        }
                                    }
                                    $(".dialog-content-then.active").html(chatHtml);
                                    $(".dialog-content-then.active").prepend("<div class='read-more'>查看更多消息</div>");
                                    page++;
                                    var list = $(".dialog-content-then.active>div");
                                    var height = 0;
                                    for (var i = 0; i <= res.data.data.length; i++) {
                                        height += $(list[i]).height();
                                    }
                                    $(".dialog-content-then.active").scrollTop(height - 300);
                                    $(".read-more").on("click", function() {
                                        getUserChat(self.userID, self.toUser, page);
                                        $(this).remove();
                                        $(this).nextAll(".read-more").remove();
                                    });
                                }
                            } else {
                                for (var i = 0; i < dataList.length; i++) {
                                    if (dataList[i].from_id == self.userID) {
                                        if (dataList[i].content_type == 1) {
                                            let msg = "";
                                            let arr = [];
                                            if (dataList[i].content.indexOf("{url_") != -1) {
                                                arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                chatHtml = `
                                                <div class="dialog-right getMessage ">
                                                    <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                    <p class="dialog-resume">` + msg + `</p>
                                                </div> 
                                                ` + chatHtml;
                                            } else {
                                                dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                chatHtml = `
                                                <div class="dialog-right getMessage ">
                                                    <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                    <p>` + msg + `</p>
                                                </div> 
                                                ` + chatHtml;
                                            }

                                        } else if (dataList[i].content_type == 2) {
                                            if (dataList[i].content == '成功') {
                                                chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                            } else if (dataList[i].content == '失败') {
                                                chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                            }
                                        } else if (dataList[i].content_type == 3) {
                                            if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                            } else if (dataList[i].content == '同意') {
                                                chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                            } else if (dataList[i].content == '拒绝') {
                                                chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                            }
                                        }
                                    } else {
                                        if (dataList[i].content_type == 1) {
                                            let msg = "";
                                            dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                            dataList[i].content = dataList[i].content.replace("img_}", '">');
                                            dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                            chatHtml =
                                                `<div class="dialog-left getMessage ">
                                                <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                <p>` + msg + `</p>
                                                </div>` + chatHtml;
                                        } else if (dataList[i].content_type == 2) {
                                            if (dataList[i].content == '成功') {
                                                chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                            } else if (dataList[i].content == '失败') {
                                                chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                            }
                                        } else if (dataList[i].content_type == 3) {
                                            if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                            } else if (dataList[i].content == '成功') {
                                                chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                            } else if (dataList[i].content == '失败') {
                                                chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                            }
                                        }
                                    }
                                    if (i == dataList.length - 1) {
                                        chatHtml = `<div>` + dataList[i].created_at + `</div>`;
                                    }
                                }
                                $(".dialog-content-then.active").html(chatHtml);
                                var list = $(".dialog-content-then.active>div");
                                var height = 0;
                                for (var i = 0; i <= res.data.data.length; i++) {
                                    height += $(list[i]).height();
                                }
                                $(".dialog-content-then.active").scrollTop(height);
                            }
                        }, 400);
                        setTimeout(() => { //查看聊天记录中是否含有未回复的专属顾问申请邀请
                            var a = dataList.some(val => {
                                if (val.content_type == 3 && val.content == '您给对方发送了专属顾问申请') {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                            var b = "";
                            if (a) {
                                b = dataList.some(v => {
                                    if (v.content_type == 3 && v.content == "同意" || v.content == "拒绝") {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                            }
                            if (a && !b) {
                                self.settingAdviserF();
                            }
                        });

                    },
                    error: function(res) {}
                });
            }
            getUserChat(self.userID, self.toUser, page);

            $(".dialog-name").html(self.toUserName);
            $("#message").focus();
        }
        //根据列表未读信息数，控制time的显示/隐藏
    showTime() {
            let self = this;
            $("#user-list li").each(function() {
                if ($(this).find(".degree").html() == 0) {
                    $(this).find(".degree").hide();
                    $(this).find(".time").show();
                } else {
                    $(this).find(".degree").show();
                    $(this).find(".time").hide();
                }
            })
        }
        //根据列表未读信息数，控制time的显示/隐藏
    showTimeList() {
        let self = this;
        $("#user-list-box li").each(function() {
            if ($(this).find(".degree").html() == 0) {
                $(this).find(".degree").hide();
                $(this).find(".time").show();
            } else {
                $(this).find(".degree").show();
                $(this).find(".time").hide();
            }
        })
    }
    searchLocal(str) {
            let self = this;
            let obj = {};
            for (let i = 0; i < str.length; i++) {
                var arr = str[i].split("=");
                obj[arr[0]] = arr[1];
            }
            return obj;
        }
        //发送信息
    sendMessage() {
            let self = this;
            var content = $("#message").html();
            var page = 1;
            //有值
            if (content != "") {
                if (content.indexOf('<img') != -1) { //有图片
                    if (content.indexOf("QQtouxiang") != -1) {
                        content = content.replace('<img src="/frontend/web/im_images/QQtouxiang/', '[qq_');
                        content = content.replace('.gif">', ']');
                    } else {
                        var reg = new RegExp('<img src="', "g");
                        var reg2 = new RegExp('">', "g");
                        content = content.replace(reg, '{img_');
                        content = content.replace(reg2, "img_}");
                    }
                } else {
                    content = $("#message").html();
                }
                $.ajax({
                    url: self.apiUrl + "/api/sendMsg?from_id=" + self.userID + "&to_id=" + self.toUser + "&content=" + content + "&content_type=1&user_identity_id=" + self.userType + "&from_user_head_img=" + self.userPic + "&from_user_name=" + self.userName,
                    type: "get",
                    dataType: "json",
                    headers: {
                        "Authentication": self.Authentication,
                    },
                    success: function(res) {
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                let editcnt = '';
                                $("#message").html() ? editcnt = self.replace_em($("#message").html()) : editcnt;
                                let html = `
                                    <div class="dialog-right">
                                        <img src="` + self.userPic + `" alt=""/>
                                        <p>` + editcnt + `</p>
                                    </div>
                                `;
                                $(this).html($(this).html() + html);
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    });
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                                $(".read-more").on("click", function() {
                                    getUserChat(self.userID, self.toUser, page);
                                });
                            }
                        });
                        $("#message").text("");

                    },
                    error: function(err) {
                        console.log(err)
                    }
                });
            }
        }
        //判断小浮球信息显示/隐藏
    checkmessageNum() {
            let self = this;
            if ($("#message-num").html() == 0) {
                $("#message-num").hide();
            } else {
                $("#message-num").show();
            }
        }
        //获取联系人
    getUsers() {
        let self = this;
        $.ajax({
            url: self.apiUrl + "/api/users?user_id=" + self.userID,
            type: "get",
            dataType: "json",
            headers: {
                "Authentication": self.Authentication,
            },
            success: function(res) {
                if (res.status === 400) {
                    return;
                }
                let contact = "",
                    dialog = "";
                let arr = res.data.contact;
                self.adviser = [];
                self.online = [];
                self.underline = [];
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].is_adviser == 1) {
                        self.adviser.push(arr[i]);
                        arr.remove(arr[i]);
                        i = i - 1;
                    } else if (arr[i].online == 1) {
                        self.online.push(arr[i]);
                        arr.remove(arr[i])
                        i = i - 1;
                    } else {
                        self.underline.push(arr[i]);
                        arr.remove(arr[i])
                        i = i - 1;
                    }
                }

                if (self.adviser.length != 0) {
                    for (let i = 0; i < self.adviser.length; i++) {
                        self.adviser[i].last_contact_at = self.adviser[i].last_contact_at.substr(-8, 5);
                        self.adviser[i].content == null ? self.adviser[i].content = "" : self.adviser[i].content;
                        $.ajax({
                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.adviser[i].contact_user_id + "",
                            type: "get",
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(resp) {
                                let length = resp.data.length;
                                let msg = '';
                                self.adviser[i].content ? msg = self.replace_em(self.adviser[i].content) : msg;
                                if (msg.indexOf('{img_') != -1) {
                                    msg = '[图片]';
                                }

                                if (msg.indexOf('{file_') != -1) {
                                    msg = '[文件]';
                                }

                                contact += `
            <li class="vip" data-id="` + self.adviser[i].contact_user_id + `" data-tousertype="` + self.adviser[i].contact_user_identity_id + `" data-usertype="` + self.adviser[i].is_adviser + `">
                <img src="` + self.adviser[i].contact_user_head_img + `"/>
                <span class="vip-mark"></span>
                <div>
                    <p title="` + self.adviser[i].contact_user_name + `" class="name">` + self.adviser[i].contact_user_name + `</p>
                    <p title="` + msg + `" class="message">` + msg + `</p>
                </div>
                <p class="time">` + self.adviser[i].last_contact_at + `</p>
                <span class="degree">` + length + `</span>
            </li>
        `
                                self.messageNum += length;
                                $("#contact-person").find("li").remove();
                                $("#contact-person").empty().append(contact);
                                $('#message-num').html(self.messageNum);
                                self.checkmessageNum();

                                if (self.online.length != 0 && i == self.adviser.length - 1) {
                                    for (let i = 0; i < self.online.length; i++) {
                                        self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                        self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                        $.ajax({
                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                            type: "get",
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(resp) {
                                                let length = resp.data.length;
                                                let msg = '';
                                                self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                                if (msg.indexOf('{img_') != -1) {
                                                    msg = '[图片]';
                                                }

                                                if (msg.indexOf('{file_') != -1) {
                                                    msg = '[文件]';
                                                }

                                                contact += `
                            <li data-id="` + self.online[i].contact_user_id + `" data-tousertype="` + self.online[i].contact_user_identity_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `">
                                <img src="` + self.online[i].contact_user_head_img + `"/>
                                <div>
                                    <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                </div>
                                <p class="time">` + self.online[i].last_contact_at + `</p>
                                <span class="degree">` + length + `</span>
                            </li>
                        `
                                                self.messageNum += length;
                                                if (self.underline.length != 0 && i == self.online.length - 1) {
                                                    for (let i = 0; i < self.underline.length; i++) {
                                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                        console.log(self.underline)
                                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                        $.ajax({
                                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                            type: "get",
                                                            dataType: "json",
                                                            headers: {
                                                                "Authentication": self.Authentication,
                                                            },
                                                            success: function(resp) {
                                                                let length = resp.data.length;
                                                                let msg = '';
                                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                if (msg.indexOf('{img_') != -1) {
                                                                    msg = '[图片]';
                                                                }

                                                                if (msg.indexOf('{file_') != -1) {
                                                                    msg = '[文件]';
                                                                }
                                                                contact += `
                                            <li data-id="` + self.underline[i].contact_user_id + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `" class="underline"  data-usertype="` + self.underline[i].is_adviser + `">
                                                <img src="` + self.underline[i].contact_user_head_img + `"/>
                                                <div>
                                                    <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                                </div>
                                                <p class="time">` + self.underline[i].last_contact_at + `</p>
                                                <span class="degree">` + length + `</span>
                                            </li>
                                        `
                                                                self.messageNum += length;
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").empty().append(contact);


                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();

                                                                self.showTime();
                                                            },
                                                            error: function(err) {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    $("#contact-person").find("li").remove();
                                                    $("#contact-person").append(contact);

                                                    $('#message-num').html(self.messageNum);
                                                    self.checkmessageNum();
                                                    self.showTime();
                                                }
                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        })
                                    }
                                } else if (self.underline.length != 0 && i == self.adviser.length - 1) {
                                    for (let i = 0; i < self.underline.length; i++) {
                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                        $.ajax({
                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                            type: "get",
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(resp) {
                                                let length = resp.data.length;
                                                let msg = '';
                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                if (msg.indexOf('{img_') != -1) {
                                                    msg = '[图片]';
                                                }

                                                if (msg.indexOf('{file_') != -1) {
                                                    msg = '[文件]';
                                                }
                                                contact += `
                            <li data-id="` + self.underline[i].contact_user_id + `" class="underline"  data-tousertype="` + self.underline[i].contact_user_identity_id + `"  data-usertype="` + self.underline[i].is_adviser + `">
                                <img src="` + self.underline[i].contact_user_head_img + `"/>
                                <div>
                                    <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                </div>
                                <p class="time">` + self.underline[i].last_contact_at + `</p>
                                <span class="degree">` + length + `</span>
                            </li>
                        `
                                                self.messageNum += length;
                                                $("#contact-person").find("li").remove();
                                                $("#contact-person").append(contact);


                                                $('#message-num').html(self.messageNum);
                                                self.checkmessageNum();

                                                self.showTime();
                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        })
                                    }
                                } else {
                                    $("#contact-person").find("li").remove();
                                    $("#contact-person").append(contact);

                                    $('#message-num').html(self.messageNum);
                                    self.checkmessageNum();
                                    self.showTime();
                                }
                            },
                            error: function(err) {
                                console.log(err)
                            }
                        })
                    }
                } else if (self.online.length != 0) {
                    for (let i = 0; i < self.online.length; i++) {
                        self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                        self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                        $.ajax({
                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                            type: "get",
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(resp) {
                                let length = resp.data.length;
                                let msg = '';
                                self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                if (msg.indexOf('{img_') != -1) {
                                    msg = '[图片]';
                                }

                                if (msg.indexOf('{file_') != -1) {
                                    msg = '[文件]';
                                }

                                contact += `
            <li data-id="` + self.online[i].contact_user_id + `"  data-tousertype="` + self.online[i].contact_user_identity_id + `" class="online" data-usertype="` + self.online[i].is_adviser + `">
                <img src="` + self.online[i].contact_user_head_img + `"/>
                <div>
                    <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                    <p title="` + msg + `" class="message">` + msg + `</p>
                </div>
                <p class="time">` + self.online[i].last_contact_at + `</p>
                <span class="degree">` + length + `</span>
            </li>
        `
                                self.messageNum += length;

                                if (self.underline.length != 0 && i == self.online.length - 1) {
                                    for (let i = 0; i < self.underline.length; i++) {
                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                        $.ajax({
                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                            type: "get",
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(resp) {
                                                let length = resp.data.length;
                                                let msg = '';
                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                if (msg.indexOf('{img_') != -1) {
                                                    msg = '[图片]';
                                                }

                                                if (msg.indexOf('{file_') != -1) {
                                                    msg = '[文件]';
                                                }
                                                contact += `
                            <li data-id="` + self.underline[i].contact_user_id + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `">
                                <img src="` + self.underline[i].contact_user_head_img + `"/>
                                <div>
                                    <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                    <p title="` + msg + `" class="message">` + msg + `</p>
                                </div>
                                <p class="time">` + self.underline[i].last_contact_at + `</p>
                                <span class="degree">` + length + `</span>
                            </li>
                        `
                                                self.messageNum += length;
                                                $("#contact-person").find("li").remove();
                                                $("#contact-person").append(contact);


                                                $('#message-num').html(self.messageNum);
                                                self.checkmessageNum();

                                                self.showTime();
                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        })
                                    }
                                } else {
                                    $("#contact-person").find("li").remove();
                                    $("#contact-person").append(contact);

                                    $('#message-num').html(self.messageNum);
                                    self.checkmessageNum();
                                    self.showTime();
                                }
                            },
                            error: function(err) {
                                console.log(err)
                            }
                        })
                    }
                } else if (self.underline.length != 0) {
                    for (let i = 0; i < self.underline.length; i++) {
                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                        $.ajax({
                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                            type: "get",
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(resp) {
                                let length = resp.data.length;
                                let msg = '';
                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                if (msg.indexOf('{img_') != -1) {
                                    msg = '[图片]';
                                }

                                if (msg.indexOf('{file_') != -1) {
                                    msg = '[文件]';
                                }

                                contact += `
            <li data-id="` + self.underline[i].contact_user_id + `" data-tousertype="` + self.underline[i].contact_user_identity_id + `" class="underline" data-usertype="` + self.underline[i].is_adviser + `">
                <img src="` + self.underline[i].contact_user_head_img + `"/>
                <div>
                    <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                    <p title="` + msg + `" class="message">` + msg + `</p>
                </div>
                <p class="time">` + self.underline[i].last_contact_at + `</p>
                <span class="degree">` + length + `</span>
            </li>
        `

                                self.messageNum += length;
                                $("#contact-person").find("li").remove();
                                $("#contact-person").append(contact);

                                $('#message-num').html(self.messageNum);
                                self.checkmessageNum();

                                self.showTime();
                            },
                            error: function(err) {
                                console.log(err)
                            }
                        })
                    }
                }
                setTimeout(function() {
                    $("#contact-person li").each(function(ind, val) {
                        dialog += `
<div class="dialog-content-then" data-id="` + $(val).attr("data-id") + `"></div>
`
                    })
                    $(".dialog-content").empty().append(dialog);
                    $(".dialog-content-then").each(function() {
                        if ($(this).attr("data-id") == self.toUser) {
                            $(this).addClass('active');
                        }
                    })
                }, 400)

            },
            error: function(err) {
                console.log(err)
            }
        })
    }

    //替换表情图片路径
    replace_em(str) {
        str = str.replace(/\[qq_([0-9]*)\]/g, "<img src='/frontend/web/im_images/QQtouxiang/$1.gif' />");
        return str;
    }

    //点击当前用户弹出对话框，并制定信息
    open(id, name, toUserPic, toUserType) {
            let self = this;
            self.toUser = id;
            self.toUserName = name;
            self.toUserPic = toUserPic;
            self.toUserType = toUserType;
            let bool = false;
            sessionStorage.setItem("nowContact", self.toUser);
            setTimeout(function() {
                $("#recommoend-box").empty().append("<iframe src='/im/default/im-info'></iframe>");
            }, 400)

            //获取联系人列表
            //self.getUsersList();
            self.getUsers();
            setTimeout(function() {
                for (let i = 0; i < self.adviser.length; i++) {
                    if (self.adviser[i].contact_user_id == self.toUser) {
                        $('#contact-person li').removeClass('active');
                        $('#contact-person li.vip').addClass('active');
                        $.ajax({
                            url: "/im/default/get-one-month-user-chat-info",
                            type: "post",
                            data: {
                                userid: self.toUser
                            },
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(res) {

                            },
                            error: function(err) {
                                console.log(err)
                            }
                        });
                        //显示对应聊天框
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                $(this).addClass('active').siblings().removeClass('active');
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                            }
                        });

                        $(".user-list>li").click(function() {
                            let id = $(this).attr("data-id");
                            let name = $(this).find(".name").html();
                            let type = $(this).attr("data-usertype");
                            let toUserType = $(this).attr("data-tousertype");
                            self.toUser = id;
                            self.toUserName = name;
                            self.toAdviserType = type;
                            self.toUserType = toUserType;

                            if (self.adviser.length != 0) {
                                if (self.toAdviserType == self.adviser[0].id) {
                                    $(".dialog-vipmark").addClass("active")
                                }
                            }
                            self.chooseUser($(this))
                        });

                        //更新聊天对方姓名
                        $(".dialog-name").html(self.toUserName);
                        $("#message").focus();
                        bool = true;
                    }
                }

                $("#dialog-box .online").each(function(ind, val) {
                    if ($(val).attr("data-id") == self.toUser) {
                        $(this).addClass("active").siblings().removeClass("active");
                        $.ajax({
                            url: "/im/default/get-one-month-user-chat-info",
                            type: "post",
                            data: {
                                userid: self.toUser
                            },
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(res) {

                            },
                            error: function(err) {
                                console.log(err)
                            }
                        });
                        //显示对应聊天框
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                $(this).addClass('active').siblings().removeClass('active');
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                            }
                        });

                        $(".user-list>li").click(function() {
                            let id = $(this).attr("data-id");
                            let name = $(this).find(".name").html();
                            let type = $(this).attr("data-usertype");
                            let toUserType = $(this).attr("data-tousertype");
                            self.toUser = id;
                            self.toUserName = name;
                            self.toAdviserType = type; //当前联系人是否是专属顾问
                            self.toUserType = toUserType;
                            if (self.adviser.length != 0) {
                                if (self.toAdviserType == self.adviser[0].id) {
                                    $(".dialog-vipmark").addClass("active")
                                }
                            }
                            self.chooseUser($(this));

                        });

                        //更新聊天对方姓名
                        $(".dialog-name").html(self.toUserName);
                        $("#message").focus();
                        bool = true;;
                    }
                });
                $("#dialog-box .underline").each(function(ind, val) {
                    if ($(val).attr("data-id") == self.toUser) {
                        if (self.toUserType == 5 && $(val).hasClass("active")) {
                            if ($(".leaving-mark").length > 0) {
                                $(".leaving-mark").remove();
                                self.leavingMessageF()
                            } else {
                                self.leavingMessageF();
                            }

                        }
                        $(this).addClass("active").siblings().removeClass("active");
                        $.ajax({
                            url: "/im/default/get-one-month-user-chat-info",
                            type: "post",
                            data: {
                                userid: self.toUser
                            },
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(res) {

                            },
                            error: function(err) {
                                console.log(err)
                            }
                        });
                        //显示对应聊天框
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                $(this).addClass('active').siblings().removeClass('active');
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                            }
                        });

                        $(".user-list>li").click(function() {
                            let id = $(this).attr("data-id");
                            let name = $(this).find(".name").html();
                            let type = $(this).attr("data-usertype");
                            let toUserType = $(this).attr("data-tousertype");
                            self.toUser = id;
                            self.toUserName = name;
                            self.toAdviserType = type;
                            self.toUserType = toUserType;

                            if (self.adviser.length != 0) {
                                if (self.toAdviserType == self.adviser[0].id) {
                                    $(".dialog-vipmark").addClass("active")
                                }
                            }
                            self.chooseUser($(this));
                        });

                        //更新聊天对方姓名
                        $(".dialog-name").html(self.toUserName);
                        $("#message").focus();
                        bool = true;;
                    }
                })

                if (!bool) {
                    let contact = '',
                        dialog = "";
                    $.ajax({
                        url: self.apiUrl + "/api/user-is-online/" + self.userID,
                        type: "get",
                        dataType: "json",
                        headers: {
                            "Authentication": self.Authentication,
                        },
                        success: function(res) {
                            if (res.data.is_online) {
                                self.online.unshift({ "id": "", "user_id": self.userID, "is_adviser": 0, "contact_user_name": self.toUserName, "contact_user_id": self.toUser, "content": "", "last_contact_at": "" });
                            } else {
                                self.underline.unshift({ "id": "", "user_id": self.userID, "is_adviser": 0, "contact_user_name": self.toUserName, "contact_user_id": self.toUser, "content": "", "last_contact_at": "" });
                            }
                            if (self.adviser.length != 0) {
                                for (let i = 0; i < self.adviser.length; i++) {
                                    self.adviser[i].last_contact_at = self.adviser[i].last_contact_at.substr(-8, 5);
                                    self.adviser[i].content == null ? self.adviser[i].content = "" : self.adviser[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.adviser[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.adviser[i].content ? msg = self.replace_em(self.adviser[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                <li class="vip" data-id="` + self.adviser[i].contact_user_id + `" data-tousertype="` + self.adviser[i].contact_user_identity_id + `">
                    <img src="` + self.adviser[i].contact_user_head_img + `"/>
                    <span class="vip-mark"></span>
                    <div>
                        <p title="` + self.adviser[i].contact_user_name + `" class="name">` + self.adviser[i].contact_user_name + `</p>
                        <p title="` + msg + `" class="message">` + msg + `</p>
                    </div>
                    <p class="time">` + self.adviser[i].last_contact_at + `</p>
                    <span class="degree">` + length + `</span>
                </li>
            `
                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").append(contact);
                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            if (self.online.length != 0 && i == self.adviser.length - 1) {
                                                for (let i = 0; i < self.online.length; i++) {
                                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }

                                                            contact += `
                                <li data-id="` + self.online[i].contact_user_id + `" class="online" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                                    <img src="` + self.online[i].contact_user_head_img + `"/>
                                    <div>
                                        <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                                        <p title="` + msg + `" class="message">` + msg + `</p>
                                    </div>
                                    <p class="time">` + self.online[i].last_contact_at + `</p>
                                    <span class="degree">` + length + `</span>
                                </li>
                            `
                                                            self.messageNum += length;

                                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                                for (let i = 0; i < self.underline.length; i++) {
                                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                                    $.ajax({
                                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                                        type: "get",
                                                                        dataType: "json",
                                                                        headers: {
                                                                            "Authentication": self.Authentication,
                                                                        },
                                                                        success: function(resp) {
                                                                            let length = resp.data.length;
                                                                            let msg = '';
                                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                            if (msg.indexOf('{img_') != -1) {
                                                                                msg = '[图片]';
                                                                            }

                                                                            if (msg.indexOf('{file_') != -1) {
                                                                                msg = '[文件]';
                                                                            }
                                                                            contact += `

                                                <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                                    <img src="` + self.underline[i].contact_user_head_img + `"/>
                                                    <div>
                                                        <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                                        <p title="` + msg + `" class="message">` + msg + `</p>
                                                    </div>
                                                    <p class="time">` + self.underline[i].last_contact_at + `</p>
                                                    <span class="degree">` + length + `</span>
                                                </li>
                                            `
                                                                            self.messageNum += length;
                                                                            $("#contact-person").find("li").remove();
                                                                            $("#contact-person").append(contact);


                                                                            $('#message-num').html(self.messageNum);
                                                                            self.checkmessageNum();

                                                                            self.showTime();
                                                                        },
                                                                        error: function(err) {
                                                                            console.log(err)
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").append(contact);

                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();
                                                                self.showTime();
                                                            }
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                if (self.underline.length != 0 && i == self.adviser.length - 1) {
                                                    for (let i = 0; i < self.underline.length; i++) {
                                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                        $.ajax({
                                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                            type: "get",
                                                            dataType: "json",
                                                            headers: {
                                                                "Authentication": self.Authentication,
                                                            },
                                                            success: function(resp) {
                                                                let length = resp.data.length;
                                                                let msg = '';
                                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                if (msg.indexOf('{img_') != -1) {
                                                                    msg = '[图片]';
                                                                }

                                                                if (msg.indexOf('{file_') != -1) {
                                                                    msg = '[文件]';
                                                                }
                                                                contact += `
                                    <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                        <img src="` + self.underline[i].contact_user_head_img + `"/>
                                        <div>
                                            <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                            <p title="` + msg + `" class="message">` + msg + `</p>
                                        </div>
                                        <p class="time">` + self.underline[i].last_contact_at + `</p>
                                        <span class="degree">` + length + `</span>
                                    </li>
                                `
                                                                self.messageNum += length;
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").append(contact);


                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();

                                                                self.showTime();
                                                            },
                                                            error: function(err) {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    $("#contact-person").find("li").remove();
                                                    $("#contact-person").append(contact);

                                                    $('#message-num').html(self.messageNum);
                                                    self.checkmessageNum();

                                                    self.showTime();
                                                }
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.online.length != 0) {
                                for (let i = 0; i < self.online.length; i++) {
                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                <li data-id="` + self.online[i].contact_user_id + `" class="online" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                    <img src="` + self.online[i].contact_user_head_img + `"/>
                    <div>
                        <p title="` + self.online[i].contact_user_name + `" class="name">` + self.online[i].contact_user_name + `</p>
                        <p title="` + msg + `" class="message">` + msg + `</p>
                    </div>
                    <p class="time">` + self.online[i].last_contact_at + `</p>
                    <span class="degree">` + length + `</span>
                </li>
            `
                                            self.messageNum += length;

                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                for (let i = 0; i < self.underline.length; i++) {
                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }
                                                            contact += `
                                <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                    <img src="` + self.underline[i].contact_user_head_img + `"/>
                                    <div>
                                        <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                                        <p title="` + msg + `" class="message">` + msg + `</p>
                                    </div>
                                    <p class="time">` + self.underline[i].last_contact_at + `</p>
                                    <span class="degree">` + length + `</span>
                                </li>
                            `
                                                            self.messageNum += length;
                                                            $("#contact-person").find("li").remove();
                                                            $("#contact-person").append(contact);


                                                            $('#message-num').html(self.messageNum);
                                                            self.checkmessageNum();

                                                            self.showTime();
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                $("#contact-person").find("li").remove();
                                                $("#contact-person").append(contact);

                                                $('#message-num').html(self.messageNum);
                                                self.checkmessageNum();

                                                self.showTime();
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.underline.length != 0) {
                                for (let i = 0; i < self.underline.length; i++) {
                                    console.log(i);
                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += `
                <li data-id="` + self.underline[i].contact_user_id + `" class="underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                    <img src="` + self.underline[i].contact_user_head_img + `"/>
                    <div>
                        <p title="` + self.underline[i].contact_user_name + `" class="name">` + self.underline[i].contact_user_name + `</p>
                        <p title="` + msg + `" class="message">` + msg + `</p>
                    </div>
                    <p class="time">` + self.underline[i].last_contact_at + `</p>
                    <span class="degree">` + length + `</span>
                </li>
            `

                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").append(contact);

                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            self.showTime();
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            }

                            setTimeout(() => {
                                $("#contact-person li").each(function(ind, val) {
                                    dialog += `
    <div class="dialog-content-then" data-id="` + $(val).attr("data-id") + `"></div>
`
                                })
                                $(".dialog-content").empty().append(dialog);
                                $(".dialog-content-then").each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active').siblings().removeClass("active");
                                    }
                                })
                                $('#contact-person li').each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active').siblings().removeClass('active');
                                        $.ajax({
                                            url: "/im/default/get-one-month-user-chat-info",
                                            type: "post",
                                            data: {
                                                userid: self.toUser
                                            },
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(res) {

                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        });
                                    }
                                });

                                $(".user-list>li").click(function() {
                                    let id = $(this).attr("data-id");
                                    let name = $(this).find(".name").html();
                                    let type = $(this).attr("data-usertype");
                                    let toUserType = $(this).attr("data-tousertype");
                                    self.toUser = id;
                                    self.toUserName = name;
                                    self.toAdviserType = type;
                                    self.toUserType = toUserType;

                                    if (self.adviser.length != 0) {
                                        if (self.toAdviserType == self.adviser[0].id) {
                                            $(".dialog-vipmark").addClass("active")
                                        }
                                    }
                                    self.chooseUser($(this))
                                });

                                let itemDialogContentThen = `<div class="dialog-content-then" data-id="` + self.toUser + `"></div>`;
                                $('.dialog-content').prepend(itemDialogContentThen);

                                //更新聊天对方姓名
                                $(".dialog-name").html(self.toUserName);
                                $("#message").focus();
                            }, 400)
                        },
                        error: function(err) {
                            console.log(err);
                        }
                    })
                }
            }, 400);
            setTimeout(() => {
                //点击某一具体聊天人
                $('#user-list-box li').click(function() {
                    self.toUser = $(this).attr('data-id');
                    self.toUserName = $(this).find('.name').text();
                    self.toUserPic = $(this).find('img').attr('src');
                    self.toUserType = $(this).attr("data-tousertype");
                    $.ajax({
                        url: "/im/default/get-web-user-info",
                        type: "get",
                        data: {
                            imid: self.toUser
                        },
                        dataType: "json",
                        success: function(res) {
                            if (res.status == 200) {
                                self.open(self.toUser, self.toUserName, self.toUserPic, res.data.group_id);
                            }
                        },
                        error: function() {}
                    })

                });
                //图片上传
                var uploader = WebUploader.create({
                    auto: true, // 选完文件后，是否自动上传。
                    swf: '../assets/js/Uploader.swf', // swf文件路径
                    server: self.uploadUrl + "/api/upload-image", // 文件接收服务端。
                    pick: '#file', // 选择文件的按钮。
                    // 只允许选择图片文件。
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    }
                });
                $('.webuploader-pick').html('');
                uploader.on('uploadBeforeSend', function(obj, data, headers) {
                    headers["Authentication"] = "O4pH7suKVx2T9eDK6iN77pWj58nLxBJH";
                });
                uploader.on('uploadSuccess', function(file, res) {
                    let src = res.data.src;
                    let msgHtml = $('#message').html() + "<img src='" + src + "' />";
                    $('#message').html(msgHtml);
                });
                $("#fixed-list").slideDown(300); //聊天窗显示
            }, 500);
            $("#dialog-box").fadeIn(300); //聊天窗隐藏/显示
            $('#drop-box').fadeOut(300); //快速回复窗隐藏

            setTimeout(() => {
                let html = '';
                let dataList = [];
                let chatHtml = '';
                let page = 1;
                $(".dialog-content-then").each(function() {
                    if ($(this).attr("data-id") == self.toUser) {
                        $(this).addClass("active").siblings().removeClass('active');
                        html = $(this).html();
                    }
                });
                $(".getMessage").remove();

                function getUserChat(from_id, to_id, page) {

                    $.ajax({
                        url: self.apiUrl + "/api/get-messages/" + from_id + "/" + to_id + "?page=" + page,
                        type: "get",
                        dataType: "json",
                        headers: {
                            "Authentication": self.Authentication,
                        },
                        success: function(res) {
                            dataList = res.data.data;
                            setTimeout(() => {
                                if (res.data.total > 20) {
                                    if (res.data.current_page == Math.ceil(res.data.total / res.data.per_page)) {
                                        for (var i = 0; i < dataList.length; i++) {
                                            if (dataList[i].from_id == self.userID) {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    let arr = [];
                                                    if (dataList[i].content.indexOf("{url_") != -1) {
                                                        arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                        msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p class="dialog-resume">` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    } else {
                                                        dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                        dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                        dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p>` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    console.log(dataList[i].content);
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '同意') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '拒绝') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            } else {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml =
                                                        `<div class="dialog-left getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p>` + msg + `</p>
                                                        </div>` + chatHtml;
                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            }

                                        }
                                        $(".dialog-content-then.active").html(chatHtml);
                                        $(".dialog-content-then.active").prepend("<div class='no-more'>没有聊天记录了</div>");
                                    } else {
                                        for (var i = 0; i < dataList.length; i++) {
                                            if (dataList[i].from_id == self.userID) {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    let arr = [];
                                                    if (dataList[i].content.indexOf("{url_") != -1) {
                                                        arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                        msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p class="dialog-resume">` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    } else {
                                                        dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                        dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                        dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p>` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    }

                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '同意') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '拒绝') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            } else {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml =
                                                        `<div class="dialog-left getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p>` + msg + `</p>
                                                            </div>` + chatHtml;
                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            }
                                        }
                                        $(".dialog-content-then.active").html(chatHtml);
                                        $(".dialog-content-then.active").prepend("<div class='read-more'>查看更多消息</div>");
                                        page++;
                                        var list = $(".dialog-content-then.active>div");
                                        var height = 0;
                                        for (var i = 0; i <= res.data.data.length; i++) {
                                            height += $(list[i]).height();
                                        }
                                        $(".dialog-content-then.active").scrollTop(height - 300);
                                        $(".read-more").on("click", function() {
                                            getUserChat(self.userID, self.toUser, page);
                                            $(this).remove();
                                            $(this).nextAll(".read-more").remove();
                                        });
                                    }
                                } else {
                                    for (var i = 0; i < dataList.length; i++) {
                                        if (dataList[i].from_id == self.userID) {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                let arr = [];
                                                if (dataList[i].content.indexOf("{url_") != -1) {
                                                    arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                    msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p class="dialog-resume">` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                } else {
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p>` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                }

                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '同意') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '拒绝') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        } else {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                chatHtml =
                                                    `<div class="dialog-left getMessage ">
                                                    <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                    <p>` + msg + `</p>
                                                    </div>` + chatHtml;
                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        }
                                    }
                                    $(".dialog-content-then.active").html(chatHtml);
                                    var list = $(".dialog-content-then.active>div");
                                    var height = 0;
                                    for (var i = 0; i <= res.data.data.length; i++) {
                                        height += $(list[i]).height();
                                    }
                                    $(".dialog-content-then.active").scrollTop(height);
                                    $(".read-more").on("click", function() {
                                        getUserChat(self.userID, self.toUser, page);
                                        $(this).remove();
                                        $(this).nextAll(".read-more").remove();
                                    });
                                }
                                $(".dialog-content-then.active>div>p>img").dblclick(function() {
                                    var url = $(this).attr("src");
                                    self.picF(url);
                                });
                            }, 400);
                            setTimeout(() => { //查看聊天记录中是否含有未回复的专属顾问申请邀请
                                var a = dataList.some(val => {
                                    if (val.content_type == 3 && val.content == '您给对方发送了专属顾问申请') {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });

                                var b = "";
                                if (a) {
                                    b = dataList.some(v => {
                                        if (v.content_type == 3 && v.content == "同意" || v.content == "拒绝") {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    });
                                }
                                if (a && !b) {
                                    self.settingAdviserF();
                                }
                            });

                        },
                        error: function(res) {}
                    });
                }
                getUserChat(self.userID, self.toUser, page);

            }, 500)


        }
        //点击当前用户弹出对话框，并制定信息
    openUrl(id, name, toUserPic, toUserType, resumeDetail) {
            let self = this;
            self.toUser = id;
            self.toUserName = name;
            self.toUserPic = toUserPic;
            self.toUserType = toUserType;
            self.resumeDetail = resumeDetail;
            let bool = false;
            sessionStorage.setItem("nowContact", self.toUser);
            setTimeout(function() { $("#recommoend-box").empty().append("<iframe src='/im/default/im-info'></iframe>"); }, 400)
                //获取联系人列表
                //self.getUsersList();
            self.getUsers();

            setTimeout(function() {
                for (let i = 0; i < self.adviser.length; i++) {
                    if (self.adviser[i].contact_user_id == self.toUser) {
                        $('#contact-person li').removeClass('active');
                        $('#contact-person li.vip').addClass('active');
                        $.ajax({
                            url: "/im/default/get-one-month-user-chat-info",
                            type: "post",
                            data: {
                                userid: self.toUser
                            },
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(res) {

                            },
                            error: function(err) {
                                console.log(err)
                            }
                        });
                        //显示对应聊天框
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                $(this).addClass('active').siblings().removeClass('active');
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                            }
                        });

                        $(".user-list>li").click(function() {
                            let id = $(this).attr("data-id");
                            let name = $(this).find(".name").html();
                            let type = $(this).attr("data-usertype");
                            let toUserType = $(this).attr("data-tousertype");
                            self.toUser = id;
                            self.toUserName = name;
                            self.toAdviserType = type;
                            self.toUserType = toUserType;

                            if (self.adviser.length != 0) {
                                if (self.toAdviserType == self.adviser[0].id) {
                                    $(".dialog-vipmark").addClass("active")
                                }
                            }
                            self.chooseUser($(this));
                        });

                        //更新聊天对方姓名
                        $(".dialog-name").html(self.toUserName);
                        $("#message").focus();
                        bool = true;
                    }
                }

                $(".online").each(function(ind, val) {
                    if ($(val).attr("data-id") == self.toUser) {
                        $(this).addClass("active").siblings().removeClass("active");
                        $.ajax({
                            url: "/im/default/get-one-month-user-chat-info",
                            type: "post",
                            data: {
                                userid: self.toUser
                            },
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(res) {

                            },
                            error: function(err) {
                                console.log(err)
                            }
                        });
                        //显示对应聊天框
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                $(this).addClass('active').siblings().removeClass('active');
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                            }
                        });

                        $(".user-list>li").click(function() {
                            let id = $(this).attr("data-id");
                            let name = $(this).find(".name").html();
                            let type = $(this).attr("data-usertype");
                            let toUserType = $(this).attr("data-tousertype");
                            self.toUser = id;
                            self.toUserName = name;
                            self.toAdviserType = type;
                            self.toUserType = toUserType;

                            if (self.adviser.length != 0) {
                                if (self.toAdviserType == self.adviser[0].id) {
                                    $(".dialog-vipmark").addClass("active")
                                }
                            }
                            self.chooseUser($(this))
                        });

                        //更新聊天对方姓名
                        $(".dialog-name").html(self.toUserName);
                        $("#message").focus();
                        bool = true;;
                    }
                });


                $("#dialog-box  .underline").each(function(ind, val) {
                    if ($(val).attr("data-id") == self.toUser) {
                        if (self.toUserType == 5 && $(val).hasClass("active")) {
                            if ($(".leaving-mark").length > 0) {
                                $(".leaving-mark").remove();
                                self.leavingMessageF()
                            } else {
                                self.leavingMessageF();
                            }
                        }
                        $(this).addClass("active").siblings().removeClass("active");
                        $.ajax({
                            url: "/im/default/get-one-month-user-chat-info",
                            type: "post",
                            data: {
                                userid: self.toUser
                            },
                            dataType: "json",
                            headers: {
                                "Authentication": self.Authentication,
                            },
                            success: function(res) {

                            },
                            error: function(err) {
                                console.log(err)
                            }
                        });
                        //显示对应聊天框
                        $(".dialog-content-then").each(function() {
                            if ($(this).attr("data-id") == self.toUser) {
                                $(this).addClass('active').siblings().removeClass('active');
                                let height = 20;
                                if ($(this).children('p').length > 0) {
                                    $(this).children('p').each(function() {
                                        height += $(this).height();
                                    })
                                }
                                $(this).children("div").each(function() {
                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                });
                                console.log(height);
                                $(this).scrollTop(height - 300);
                            }
                        });

                        $(".user-list>li").click(function() {
                            let id = $(this).attr("data-id");
                            let name = $(this).find(".name").html();
                            let type = $(this).attr("data-usertype");
                            let toUserType = $(this).attr("data-tousertype");
                            self.toUser = id;
                            self.toUserName = name;
                            self.toAdviserType = type;
                            self.toUserType = toUserType;

                            if (self.adviser.length != 0) {
                                if (self.toAdviserType == self.adviser[0].id) {
                                    $(".dialog-vipmark").addClass("active")
                                }
                            }
                            self.chooseUser($(this))
                        });

                        //更新聊天对方姓名
                        $(".dialog-name").html(self.toUserName);
                        $("#message").focus();
                        bool = true;;
                    }
                });

                if (!bool) {
                    let contact = '',
                        dialog = "";
                    $.ajax({
                        url: self.apiUrl + "/api/user-is-online/" + self.userID,
                        type: "get",
                        dataType: "json",
                        headers: {
                            "Authentication": self.Authentication,
                        },
                        success: function(res) {
                            if (res.data.is_online) {
                                self.online.unshift({ "id": "", "user_id": self.userID, "is_adviser": 0, "contact_user_name": self.toUserName, "contact_user_id": self.toUser, "content": "", "last_contact_at": "" });
                            } else {
                                self.underline.unshift({ "id": "", "user_id": self.userID, "is_adviser": 0, "contact_user_name": self.toUserName, "contact_user_id": self.toUser, "content": "", "last_contact_at": "" });
                            }
                            if (self.adviser.length != 0) {
                                for (let i = 0; i < self.adviser.length; i++) {
                                    self.adviser[i].last_contact_at = self.adviser[i].last_contact_at.substr(-8, 5);
                                    self.adviser[i].content == null ? self.adviser[i].content = "" : self.adviser[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.adviser[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.adviser[i].content ? msg = self.replace_em(self.adviser[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += ` <li class = "vip"
                                                data-id = "` + self.adviser[i].contact_user_id + `" data-tousertype="` + self.adviser[i].contact_user_identity_id + `">
                                                <img src = "` + self.adviser[i].contact_user_head_img + `" / >
                                                <span class = "vip-mark" > </span>
                                                <div >
                                                <p title = "` + self.adviser[i].contact_user_name + `"class = "name" > ` + self.adviser[i].contact_user_name + ` </p>
                                                <p title = "` + msg + `"class = "message" > ` + msg + ` </p>
                                                </div> <p class = "time" > ` + self.adviser[i].last_contact_at + ` </p>
                                                <span class = "degree" > ` + length + ` </span>
                                                </li>
                                                `
                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").append(contact);
                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            if (self.online.length != 0 && i == self.adviser.length - 1) {
                                                for (let i = 0; i < self.online.length; i++) {
                                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }
                                                            contact += ` <li data-id = "` + self.online[i].contact_user_id + `"class = "online" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                                                               <img src = "` + self.online[i].contact_user_head_img + `" / >
                                                                <div >
                                                                <p title = "` + self.online[i].contact_user_name + `"class = "name" > ` + self.online[i].contact_user_name + ` </p>
                                                                <p title = "` + msg + ` "class = "message" > ` + msg + ` </p>
                                                                </div>
                                                                <p class = "time" > ` + self.online[i].last_contact_at + ` </p> 
                                                                <span class = "degree" > ` + length + ` </span> </li>
                                                                `
                                                            self.messageNum += length;

                                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                                for (let i = 0; i < self.underline.length; i++) {
                                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                                    $.ajax({
                                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                                        type: "get",
                                                                        dataType: "json",
                                                                        headers: {
                                                                            "Authentication": self.Authentication,
                                                                        },
                                                                        success: function(resp) {
                                                                            let length = resp.data.length;
                                                                            let msg = '';
                                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                            if (msg.indexOf('{img_') != -1) {
                                                                                msg = '[图片]';
                                                                            }

                                                                            if (msg.indexOf('{file_') != -1) {
                                                                                msg = '[文件]';
                                                                            }
                                                                            contact += `
                                            <li data-id = "` + self.underline[i].contact_user_id + `"class = "underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                            <img src = "` + self.underline[i].contact_user_head_img + `" / >
                                            <div>
                                            <p title = "` + self.underline[i].contact_user_name + `"class = "name" > ` + self.underline[i].contact_user_name + ` </p>
                                            <p title = "` + msg + `"class = "message" > ` + msg + ` </p></div> 
                                            <p class = "time" > ` + self.underline[i].last_contact_at + ` </p> 
                                            <span class = "degree" > ` + length + ` </span> </li>
                                            `;
                                                                            self.messageNum += length;
                                                                            $("#contact-person").find("li").remove();
                                                                            $("#contact-person").append(contact);


                                                                            $('#message-num').html(self.messageNum);
                                                                            self.checkmessageNum();

                                                                            self.showTime();
                                                                        },
                                                                        error: function(err) {
                                                                            console.log(err)
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").append(contact);

                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();
                                                                self.showTime();
                                                            }
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                if (self.underline.length != 0 && i == self.adviser.length - 1) {
                                                    for (let i = 0; i < self.underline.length; i++) {
                                                        self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                        self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                        $.ajax({
                                                            url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                            type: "get",
                                                            dataType: "json",
                                                            headers: {
                                                                "Authentication": self.Authentication,
                                                            },
                                                            success: function(resp) {
                                                                let length = resp.data.length;
                                                                let msg = '';
                                                                self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                                if (msg.indexOf('{img_') != -1) {
                                                                    msg = '[图片]';
                                                                }

                                                                if (msg.indexOf('{file_') != -1) {
                                                                    msg = '[文件]';
                                                                }
                                                                contact += `<li data-id = "` + self.underline[i].contact_user_id + `"class = "underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                            <img src = "` + self.underline[i].contact_user_head_img + `" / >
                            <div>
                            <p title = "` + self.underline[i].contact_user_name + `"class = "name" > ` + self.underline[i].contact_user_name + ` </p>
                            <p title = "` + msg + `"class = "message" > ` + msg + ` </p> 
                            </div>
                            <p class = "time" > ` + self.underline[i].last_contact_at + ` </p>
                            <span class = "degree" > ` + length + ` </span> </li>`;
                                                                self.messageNum += length;
                                                                $("#contact-person").find("li").remove();
                                                                $("#contact-person").append(contact);


                                                                $('#message-num').html(self.messageNum);
                                                                self.checkmessageNum();

                                                                self.showTime();
                                                            },
                                                            error: function(err) {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    $("#contact-person").find("li").remove();
                                                    $("#contact-person").append(contact);

                                                    $('#message-num').html(self.messageNum);
                                                    self.checkmessageNum();

                                                    self.showTime();
                                                }
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.online.length != 0) {
                                for (let i = 0; i < self.online.length; i++) {
                                    self.online[i].last_contact_at = self.online[i].last_contact_at.substr(-8, 5);
                                    self.online[i].content == null ? self.online[i].content = "" : self.online[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.online[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.online[i].content ? msg = self.replace_em(self.online[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }
                                            contact += ` <li data-id = "` + self.online[i].contact_user_id + `"class = "online" data-tousertype="` + self.online[i].contact_user_identity_id + `">
                            <img src = "` + self.online[i].contact_user_head_img + `" / >
                            <div >
                            <p title = "` + self.online[i].contact_user_name + `"
                            class = "name" > ` + self.online[i].contact_user_name + ` </p>
                            <p title = "` + msg + `"class = "message" > ` + msg + ` </p>
                            </div><p class = "time" > ` + self.online[i].last_contact_at + ` </p>
                            <span class = "degree" > ` + length + ` </span></li>
                            `
                                            self.messageNum += length;

                                            if (self.underline.length != 0 && i == self.online.length - 1) {
                                                for (let i = 0; i < self.underline.length; i++) {
                                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                                    $.ajax({
                                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                                        type: "get",
                                                        dataType: "json",
                                                        headers: {
                                                            "Authentication": self.Authentication,
                                                        },
                                                        success: function(resp) {
                                                            let length = resp.data.length;
                                                            let msg = '';
                                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                                            if (msg.indexOf('{img_') != -1) {
                                                                msg = '[图片]';
                                                            }

                                                            if (msg.indexOf('{file_') != -1) {
                                                                msg = '[文件]';
                                                            }
                                                            contact += ` <li data-id = "` + self.underline[i].contact_user_id + `" class = "underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                                            <img src = "` + self.underline[i].contact_user_head_img + `" / >
                                                            <div>
                                                            <p title = "` + self.underline[i].contact_user_name + `"class = "name" > ` + self.underline[i].contact_user_name + ` </p> 
                                                            <p title = "` + msg + `" class = "message" > ` + msg + ` </p>
                                                        </div>
                                                        <p class = "time" > ` + self.underline[i].last_contact_at + ` </p> 
                                                        <span class = "degree" > ` + length + ` </span>
                                                        </li>
                                                            `
                                                            self.messageNum += length;
                                                            $("#contact-person").find("li").remove();
                                                            $("#contact-person").append(contact);


                                                            $('#message-num').html(self.messageNum);
                                                            self.checkmessageNum();

                                                            self.showTime();
                                                        },
                                                        error: function(err) {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            } else {
                                                $("#contact-person").find("li").remove();
                                                $("#contact-person").append(contact);

                                                $('#message-num').html(self.messageNum);
                                                self.checkmessageNum();

                                                self.showTime();
                                            }
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            } else if (self.underline.length != 0) {
                                for (let i = 0; i < self.underline.length; i++) {
                                    self.underline[i].last_contact_at = self.underline[i].last_contact_at.substr(-8, 5);
                                    self.underline[i].content == null ? self.underline[i].content = "" : self.underline[i].content;
                                    $.ajax({
                                        url: self.apiUrl + "/api/not-read/" + self.userID + "/" + self.underline[i].contact_user_id + "",
                                        type: "get",
                                        dataType: "json",
                                        headers: {
                                            "Authentication": self.Authentication,
                                        },
                                        success: function(resp) {
                                            let length = resp.data.length;
                                            let msg = '';
                                            self.underline[i].content ? msg = self.replace_em(self.underline[i].content) : msg;
                                            if (msg.indexOf('{img_') != -1) {
                                                msg = '[图片]';
                                            }

                                            if (msg.indexOf('{file_') != -1) {
                                                msg = '[文件]';
                                            }

                                            contact += ` <li data-id = "` + self.underline[i].contact_user_id + `"class = "underline" data-tousertype="` + self.underline[i].contact_user_identity_id + `">
                                <img src = "` + self.underline[i].contact_user_head_img + `" / ><div>
                                <p title = "` + self.underline[i].contact_user_name + `"class = "name"> ` + self.underline[i].contact_user_name + ` </p>
                                 <p title = "` + msg + `"class = "message" > ` + msg + ` </p> </div> 
                                 <p class = "time" > ` + self.underline[i].last_contact_at + ` </p>
                                <span class = "degree" > ` + length + ` </span> </li>
                                `

                                            self.messageNum += length;
                                            $("#contact-person").find("li").remove();
                                            $("#contact-person").append(contact);

                                            $('#message-num').html(self.messageNum);
                                            self.checkmessageNum();

                                            self.showTime();
                                        },
                                        error: function(err) {
                                            console.log(err)
                                        }
                                    })
                                }
                            }

                            setTimeout(() => {
                                $("#contact-person li").each(function(ind, val) {
                                    dialog += ` <div class = "dialog-content-then" data-id = "` + $(val).attr("data-id ") + `"> </div>
`
                                })
                                $(".dialog-content").empty().append(dialog);
                                $(".dialog-content-then").each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active').siblings().removeClass("active");
                                    }
                                })
                                $('#contact-person li').each(function() {
                                    if ($(this).attr("data-id") == self.toUser) {
                                        $(this).addClass('active').siblings().removeClass('active');
                                        $.ajax({
                                            url: "/im/default/get-one-month-user-chat-info",
                                            type: "post",
                                            data: {
                                                userid: self.toUser
                                            },
                                            dataType: "json",
                                            headers: {
                                                "Authentication": self.Authentication,
                                            },
                                            success: function(res) {

                                            },
                                            error: function(err) {
                                                console.log(err)
                                            }
                                        });
                                    }
                                });

                                $(".user-list>li").click(function() {
                                    let id = $(this).attr("data-id");
                                    let name = $(this).find(".name").html();
                                    let type = $(this).attr("data-usertype");
                                    let toUserType = $(this).attr("data-tousertype");
                                    self.toUser = id;
                                    self.toUserName = name;
                                    self.toAdviserType = type;
                                    self.toUserType = toUserType;

                                    if (self.adviser.length != 0) {
                                        if (self.toAdviserType == self.adviser[0].id) {
                                            $(".dialog-vipmark").addClass("active")
                                        }
                                    }
                                    self.chooseUser($(this))
                                });
                                let itemDialogContentThen = ` <div class = "dialog-content-then" data-id = "` + self.toUser + `" > </div>`;
                                $('.dialog-content').prepend(itemDialogContentThen);

                                //更新聊天对方姓名
                                $(".dialog-name").html(self.toUserName);
                                $("#message").focus();
                            }, 400)
                        },
                        error: function(err) {
                            console.log(err);
                        }
                    })
                }
            }, 400);
            setTimeout(() => {
                //点击某一具体聊天人
                $('#user-list-box li').click(function() {
                    self.toUser = $(this).attr('data-id');
                    self.toUserName = $(this).find('.name').text();
                    self.toUserPic = $(this).find('img').attr('src');
                    self.toUserType = $(this).attr("data-tousertype");
                    $.ajax({
                        url: "/im/default/get-web-user-info",
                        type: "get",
                        data: {
                            imid: self.toUser
                        },
                        dataType: "json",
                        success: function(res) {
                            if (res.status == 200) {
                                self.open(self.toUser, self.toUserName, self.toUserPic, res.data.group_id);
                            }
                        },
                        error: function() {}
                    })

                });
                //图片上传
                var uploader = WebUploader.create({
                    auto: true, // 选完文件后，是否自动上传。
                    swf: '../assets/js/Uploader.swf', // swf文件路径
                    server: self.uploadUrl + "/api/upload-image", // 文件接收服务端。
                    pick: '#file', // 选择文件的按钮。
                    // 只允许选择图片文件。
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    }
                });
                $('.webuploader-pick').html('');
                uploader.on('uploadBeforeSend', function(obj, data, headers) {
                    headers["Authentication"] = "O4pH7suKVx2T9eDK6iN77pWj58nLxBJH";
                });
                uploader.on('uploadSuccess', function(file, res) {
                    let src = res.data.src;
                    let msgHtml = $('#message').html() + "<img src='" + src + "' />";
                    $('#message').html(msgHtml);
                });
                $("#fixed-list").slideDown(300); //聊天窗显示
            }, 500);
            $("#dialog-box").fadeIn(300); //聊天窗隐藏/显示
            $('#drop-box').fadeOut(300); //快速回复窗隐藏


            setTimeout(() => {
                let html = '';
                let dataList = [];
                let chatHtml = '';
                let page = 1;
                $(".dialog-content-then").each(function() {
                    if ($(this).attr("data-id") == self.toUser) {
                        $(this).addClass("active").siblings().removeClass('active');
                        html = $(this).html();
                    }
                });
                $(".getMessage").remove();


                function getUserChat(from_id, to_id, page) {

                    $.ajax({
                        url: self.apiUrl + "/api/get-messages/" + from_id + "/" + to_id + "?page=" + page,
                        type: "get",
                        dataType: "json",
                        headers: {
                            "Authentication": self.Authentication,
                        },
                        success: function(res) {
                            dataList = res.data.data;
                            setTimeout(() => {
                                if (res.data.total > 20) {
                                    if (res.data.current_page == Math.ceil(res.data.total / res.data.per_page)) {
                                        for (var i = 0; i < dataList.length; i++) {
                                            if (dataList[i].from_id == self.userID) {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    let arr = [];
                                                    if (dataList[i].content.indexOf("{url_") != -1) {
                                                        arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                        msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p class="dialog-resume">` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    } else {
                                                        dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                        dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                        dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p>` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    }

                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '同意') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '拒绝') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            } else {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml =
                                                        `<div class="dialog-left getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p>` + msg + `</p>
                                                        </div>` + chatHtml;
                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            }
                                        }
                                        $(".dialog-content-then.active").html(chatHtml);
                                        $(".dialog-content-then.active").prepend("<div class='no-more'>没有聊天记录了</div>");
                                    } else {
                                        for (var i = 0; i < dataList.length; i++) {
                                            if (dataList[i].from_id == self.userID) {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    let arr = [];
                                                    if (dataList[i].content.indexOf("{url_") != -1) {
                                                        arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                        msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p class="dialog-resume">` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    } else {
                                                        dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                        dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                        dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                        chatHtml = `
                                                        <div class="dialog-right getMessage ">
                                                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                            <p>` + msg + `</p>
                                                        </div> 
                                                        ` + chatHtml;
                                                    }

                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '同意') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '拒绝') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            } else {
                                                if (dataList[i].content_type == 1) {
                                                    let msg = "";
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml =
                                                        `<div class="dialog-left getMessage ">
                            <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                            <p>` + msg + `</p>
                            </div>` + chatHtml;
                                                } else if (dataList[i].content_type == 2) {
                                                    if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                    }
                                                } else if (dataList[i].content_type == 3) {
                                                    if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                        chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                    } else if (dataList[i].content == '成功') {
                                                        chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                    } else if (dataList[i].content == '失败') {
                                                        chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                    }
                                                }
                                            }

                                        }
                                        $(".dialog-content-then.active").html(chatHtml);
                                        $(".dialog-content-then.active").prepend("<div class='read-more'>查看更多消息</div>");
                                        page++;
                                        var list = $(".dialog-content-then.active>div");
                                        var height = 0;
                                        for (var i = 0; i <= res.data.data.length; i++) {
                                            height += $(list[i]).height();
                                        }
                                        $(".dialog-content-then.active").scrollTop(height - 300);
                                        $(".read-more").on("click", function() {
                                            getUserChat(self.userID, self.toUser, page);
                                            $(this).remove();
                                            $(this).nextAll(".read-more").remove();
                                        });
                                    }
                                } else {
                                    for (var i = 0; i < dataList.length; i++) {
                                        if (dataList[i].from_id == self.userID) {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                let arr = [];
                                                if (dataList[i].content.indexOf("{url_") != -1) {
                                                    arr = dataList[i].content.slice(5, dataList[i].content.length - 5).split(",");
                                                    msg = '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p class="dialog-resume">` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                } else {
                                                    dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                    dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                    dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                    chatHtml = `
                                                    <div class="dialog-right getMessage ">
                                                        <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                        <p>` + msg + `</p>
                                                    </div> 
                                                    ` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '同意') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '拒绝') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        } else {
                                            if (dataList[i].content_type == 1) {
                                                let msg = "";
                                                dataList[i].content = dataList[i].content.replace('{img_', '<img src="');
                                                dataList[i].content = dataList[i].content.replace("img_}", '">');
                                                dataList[i].content ? msg = self.replace_em(dataList[i].content) : msg;
                                                chatHtml =
                                                    `<div class="dialog-left getMessage ">
                                                    <img src="` + dataList[i].web_from_user.head_img + `" alt=""/>
                                                    <p>` + msg + `</p>
                                                    </div>` + chatHtml;
                                            } else if (dataList[i].content_type == 2) {
                                                if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>发送成功</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>发送失败</p></div>` + chatHtml;
                                                }
                                            } else if (dataList[i].content_type == 3) {
                                                if (dataList[i].content == '您给对方发送了专属顾问申请') {
                                                    chatHtml = `<div class=" getMessage "><p class="friendly-tips"><span></span>对方向您发送了专属顾问申请</p></div>` + chatHtml;
                                                } else if (dataList[i].content == '成功') {
                                                    chatHtml = `<div class=" getMessage "><p class="success-tips"><span></span>您已同意</p></div> ` + chatHtml;
                                                } else if (dataList[i].content == '失败') {
                                                    chatHtml = `<div class=" getMessage "><p class="fail-tips"><span></span>您已拒绝</p></div>` + chatHtml;
                                                }
                                            }
                                        }
                                    }
                                    $(".dialog-content-then.active").html(chatHtml);
                                    var list = $(".dialog-content-then.active>div");
                                    var height = 0;
                                    for (var i = 0; i <= res.data.data.length; i++) {
                                        height += $(list[i]).height();
                                    }

                                    $(".dialog-content-then.active").scrollTop(height);
                                }
                            }, 400)
                            setTimeout(() => { //查看聊天记录中是否含有未回复的专属顾问申请邀请
                                var a = dataList.some(val => {
                                    console.log(val.content_type);
                                    if (val.content_type == 3 && val.content == '您给对方发送了专属顾问申请') {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                                var b = "";
                                if (a) {
                                    b = dataList.some(v => {
                                        if (v.content_type == 3 && v.content == "同意" || v.content == "拒绝") {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    });
                                }
                                if (a && !b) {
                                    self.settingAdviserF();
                                }
                            });

                        },
                        error: function(res) {}
                    });
                }
                getUserChat(self.userID, self.toUser, page);

                setTimeout(() => {
                    $.ajax({
                        url: self.apiUrl + "/api/sendMsg?from_id=" + self.userID + "&to_id=" + self.toUser + "&content=" + resumeDetail + "&content_type=1&user_identity_id=" + self.userType + "&from_user_head_img=" + self.userPic + "&from_user_name=" + self.userName,
                        type: "get",
                        dataType: "json",
                        headers: {
                            "Authentication": self.Authentication,
                        },
                        success: function(res) {
                            $(".dialog-content-then").each(function() {
                                if ($(this).attr("data-id") == self.toUser) {
                                    let arr = [];
                                    let contentEdit = "";
                                    arr = resumeDetail.slice(5, resumeDetail.length - 5).split(",");
                                    contentEdit += '<a href="' + arr[2] + '" target="_blank" class="resume-box"><span>' + arr[0] + '</span><span>' + arr[1] + '</span></a>'
                                    let contentHtml = `
                                    <div class="dialog-right getMessage">
                                        <img src="` + self.userPic + `" alt=""/>
                                        <p class="dialog-resume">` + contentEdit + `</p>
                                    </div>`;
                                    $(this).html($(this).html() + contentHtml);
                                    let height = 20;
                                    if ($(this).children('p').length > 0) {
                                        $(this).children('p').each(function() {
                                            height += $(this).height();
                                        })
                                    }
                                    $(this).children("div").each(function() {
                                        height += $(this).height() + parseInt($(this).css('marginTop'));
                                    });
                                    console.log(height);
                                    $(this).scrollTop(height - 300);
                                }
                            });
                            $(".read-more").on("click", function() {
                                getUserChat(self.userID, self.toUser, page);
                                $(this).remove();
                                $(this).nextAll(".read-more").remove();
                            });
                        },
                        error: function(err) {
                            console.log(err)
                        }
                    });
                }, 500)

            }, 500);
        }
        //文件上传功能
    fileUpload() {
        let self = this;
        //判断是否开启上传功能
        if (true) {
            var fileHtml = `<span id="docu"></span>`;
            $('.oper-box').append(fileHtml);
            $('#docu').click(function() {
                let obj = self.fileF();
                Object.defineProperty(obj, "then_id", {
                    set: function(value) {
                        if (obj.src != '') {
                            let src = JSON.stringify(obj);
                            src = src.replace("{", "{file_").replace("}", "_file}");
                            $.ajax({
                                url: self.apiUrl + "/api/sendMsg?from_id=" + self.userID + "&to_id=" + self.toUser + "&content=" + content + "&content_type=1&user_identity_id=" + self.userType + "&from_user_head_img=" + self.userPic + "&from_user_name=" + self.userName,
                                type: "get",
                                dataType: "json",
                                headers: {
                                    "Authentication": self.Authentication,
                                },
                                success: function(res) {
                                    if (res.status == 200) {
                                        $(".dialog-content-then").each(function() {
                                            if ($(this).attr("data-id") == self.toUser) {
                                                let html = `
                                                <div class="dialog-right">
                                                    <img src="` + self.userPic + `" alt=""/>
                                                    <p>
                                                        <span class="file-title" title=` + obj.title + `>` + obj.title + `</span>
                                                        <span class="file-content">` + obj.content + `</span>
                                                    </p>
                                                </div>
                                            `
                                                $(this).html($(this).html() + html);
                                                let height = 20;
                                                if ($(this).children('p').length > 0) {
                                                    $(this).children('p').each(function() {
                                                        height += $(this).height();
                                                    })
                                                }
                                                $(this).children("div").each(function() {
                                                    height += $(this).height() + parseInt($(this).css('marginTop'));
                                                });
                                                $(this).scrollTop(height - 300);
                                            }
                                        })
                                    }
                                },
                                error: function(err) {
                                    console.log(err)
                                }
                            });
                        }
                    }
                })

            });
        }
    }

    getID() {
        let obj = {
            id: 0,
            then_id: 0,
            data_id: 0,
        }
        setTimeout(() => {
            $(".user-list>li").each(function(ind, val) {
                if ($(val).hasClass("active")) {
                    obj.data_id = parseInt($(val).attr("data-id"));
                    obj.then_id = 1;
                    obj.id = 1;
                }
            })
        }, 500)
        Object.defineProperty(obj, "id", {
            set: function(value) {
                return obj;
            }
        })
        return obj;
    }

}

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};