$(document).ready(()=>{

    $('label').click(()=>{
        labelID = $(this).attr('for');
        $("#" +labelID).focus();
    });

    $('#username').focus(()=>{
        $('#label-username').addClass("input-selected");
    });
    $('#username').focusout(()=>{
        $('#label-username').removeClass("input-selected");
    });

    $('#password').focus(()=>{
        $('#label-password').addClass("input-selected");
    });
    $('#password').focusout(()=>{
        $('#label-password').removeClass("input-selected");
    });

    /*if(document.getElementsByClassName('toast') != undefined){
        setTimeout(()=>{
            $('.toast').fadeIn(250);
        }, 500);
    }*/
});