/*global $, body*/

$(function () {

    var win = $(window),
    winWidth = $(window).width(),
    winHeight = $(window).height();
    win.on("resize", function () {
        winWidth = $(window).width(),
            winHeight = $(window).height();
    })


    /*Start Loading Spinner*/
    win.on("load", function () {
        $("#loading .load-shap").fadeOut(2000, function () {
            $(this).parent().fadeOut(1000, function () {
                $(this).remove();
            });
        });

        //Disappear the alert after ti   me in home page
        $('.alert').delay    (1000).animate({ height: '52px' }, 1000).delay(4000).animate({height: 0}, 1000);

    });

    if (localStorage['color'] == null) {
        $('link[href*="theme"]').attr('href', "css/default_theme.css");
    }
    else {
        $('link[href*="theme"]').attr('href', localStorage['color']);
    }

    /************************* Start Nice Scroll and scroll top Script *************************/
    function niceScroll() {
        if (winWidth >= 767) {
            $("body").css('overflow','hidden').niceScroll({
                cursorcolor: "rgb(45, 54, 76)",
                cursorwidth: "7px",
                cursorborder: "0",
                cursorborderradius: '0',
                zIndex: '999999'
            });

            $("#endContent").niceScroll({
                cursorcolor: "rgb(45, 54, 76)",
                cursorwidth: "5px",
            });
        } else {
            $("body, #endContent").niceScroll({cursorwidth: "0", cursorborder: "0"});
            $("body").css('overflow', 'visible');
        }
    }
    niceScroll();
    win.on('resize', function () {
        niceScroll();
    });



    function scroll_to(clicked_link, nav_height) {
        var element_class = clicked_link.attr('href').replace('#', '.');
        var scroll_to = 0;
        if (element_class != '.top-content') {
            element_class += '-container';
            scroll_to = $(element_class).offset().top - nav_height;
        }
        if ($(window).scrollTop() != scroll_to) {
            $('html, body').stop().animate({ scrollTop: scroll_to }, 1000);
        }
    }

    $('a.scroll-link').on('click', function (e) {
        e.preventDefault();
        scroll_to($(this), $('nav').outerHeight());
    });

    /************************* Start Nice Scroll and scroll top Script *************************/

    //show the logo when screen become mobile
    var brand = $('.navbar .navbar-header a');
    if (winWidth <= 767) {
        brand.html('<img src="ico/brand.png" style = "width: 37px;"/>');
    } else {
        brand.html('');
    }

    win.on('resize', function () {
        if (winWidth <= 767) {
            brand.html('<img src="ico/brand.png" style = "width: 37px;"/>');
        } else {
            brand.html('');
        }
    });


    //Make The Screen responsive to the whole screen
    var ResponsiveImg = $(".slide-show .carousel-inner .item img");

    if (winWidth >= 992) {
        ResponsiveImg.height($(window).height() - 50);
    }

    /*Make The Header Of The User Responsive*/
    var HeaderTitels = $(".navbar .collapse .nav li a"),
        ContainerTitels = $(" ul.navbar-nav");

    if (winWidth >= 992 && winWidth <= 1199) {
        ContainerTitels.css("margin-left", "-12px");
        HeaderTitels.css("font-size", "12px");
    }

    else if (winWidth >= 751 && winWidth <= 991) {
        HeaderTitels.css("font-size", "12px");
    }
    else {
        HeaderTitels.css("font-size", "inherit");
    }


    $(window).on("resize", function () {
        if (winWidth >= 992) {
            ResponsiveImg.height($(window).height() - 50);
        }
        else {
            ResponsiveImg.css("height", "auto");
        }

        /*Make The Header Of The User Responsive*/
        if (winWidth >= 992 && winWidth <= 1199) {
            ContainerTitels.css("margin-left", "-12px");
            HeaderTitels.css("font-size", "12px");
        }

        else if (winWidth >= 751 && winWidth <= 991) {
            HeaderTitels.css("font-size", "12px");
        }
        else {
            HeaderTitels.css("font-size", "inherit");
        }
    });

    //Start Footer Login register
    $(".footer-log").height(winHeight);
    win.on("resize", function () {
        $(".footer-log").height(winHeight);
    });




    /*Start Script of footer page */
    var foot1 = $('footer .footer-bottom > div:nth-of-type(1)'),
        foot2 = $('footer .footer-bottom > div:nth-of-type(2)'),
        foot3 = $('footer .footer-bottom > div:nth-of-type(3)');

    if (winWidth > 767) {
        foot2.height(foot1.height());
        foot3.height(foot1.height());

        foot1.css("border-right", "1px solid #fff");
        foot2.css("border-right", "1px solid #fff");

    } else {
        foot2.css("border-right", "none");
        foot1.css("border-right", "none");
    }
    win.on("resize", function () {
        if (winWidth > 767) {
            foot2.height(foot1.height());
            foot3.height(foot1.height());

            foot1.css("border-right", "1px solid #fff");
            foot2.css("border-right", "1px solid #fff");
        } else {
            foot2.height("auto");
            foot3.height("auto");

            foot2.css("border-right", "none");
            foot1.css("border-right", "none");
        }
    });


    /************************ Start Colors Of Website ************************/
    var tick = 1,
        colors = $('.web_colors'),
        icon = $('.web_colors .settings .icon i');
    $('.web_colors .settings .icon i').on("click", function () {
        if (tick) {
            colors.animate({ left: 0 }, 200);
            icon.css("transform", "rotate(360deg)");
            tick = 0;
        } else {
            colors.animate({ left: '-225px' }, 200);
            icon.css("transform", "rotate(0deg)");
            tick = 1;
        }
    });

    $('.web_colors .colors> span').on('click', function () {
        $('link[href*="theme"]').attr('href', $(this).attr('data-value'));
        localStorage['color'] = $(this).attr('data-value');
    });

    /************************ End Colors Of Website ************************/

    /************************ start user-info Page ************************/
    //when click on ech button
    var LButton = $('.user-info .edit button:first-child'),
        RButton = $('.user-info .edit button:last-child');

    LButton.on('click', function () {
        $('.user-info .edit-fellings').show();
        $('.user-info .edit-settings').hide();

    });

    RButton.on('click', function () {
        $('.user-info .edit-fellings').hide();
        $('.user-info .edit-settings').show();

    });


    /************************ End user-info Page ************************/

    /************************ End MyPage Page ************************/
    var ico_img = $('.mypage .sender .emoji .emoji-img img'),
        shapes = $('.mypage .sender .emoji .emoji-icons'),
        emoji = $('.mypage .sender .emoji .emoji-icons img'),
        textarea = $('.sender textarea'),
        //test = $('.mypage .sender .test'),
        //endContent = document.getElementById('endContent');
        testIMG = $('.mypage .sender .test img'),
        open_close = true;

    ico_img.on('click', function () {
        
        if (open_close) {
            shapes.css("display", 'block');
            open_close = false;
        }
        else {
            shapes.css("display", 'none');
            open_close = true;
        }
    });

    emoji.on('click', function () {
        var text = textarea.val();
        text += $(this).attr('data-value');
        textarea.val(text).focus();

        //emotion = '<img src="' + $(this).attr('src') + '" />';
        //emotion = emotion.replace('~/', '/');

        //test.html(test.html() + emotion);
        //setEndOfContenteditable(endContent);


        //testIMG = $('.mypage .sender .test img');
        //testIMG.css({ width: 16, height: 16, margin:0});
    });
    /************************ End MyPage Page ************************/



});


function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
    }
}