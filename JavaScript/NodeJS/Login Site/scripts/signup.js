$(document).ready(()=>{
    $('#password_confirm').focus(()=>{
        $('#label-password_confirm').addClass("input-selected");
    });
    $('#password_confirm').focusout(()=>{
        $('#label-password_confirm').removeClass("input-selected");
    });

    $('#password_confirm').keyup(()=>{
        var password_confirm = document.getElementById("password_confirm");
        if($('#password').val() != $('#password_confirm').val()){
            $('#bar-password_confirm').addClass('bar-red');
            $('#label-password_confirm').addClass('red');
            password_confirm.setCustomValidity("Passwords do not match!");
        }else{
            $('#bar-password_confirm').removeClass('bar-red');
            $('#label-password_confirm').removeClass('red');
            password_confirm.setCustomValidity("");
        }
    });

    $('#password').keyup(()=>{
        var password_confirm = document.getElementById("password_confirm");
        if($('#password').val() == $('#password_confirm').val()){
            $('#bar-password_confirm').removeClass('bar-red');
            $('#label-password_confirm').removeClass('red');
            password_confirm.setCustomValidity("");
        }
    });
});