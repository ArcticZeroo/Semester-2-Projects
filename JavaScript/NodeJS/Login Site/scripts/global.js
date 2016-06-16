class Toast{
    constructor(message, autocreate){
        this.autocreate = autocreate || false;
        var divStart = "<div class=\"toast\">";
        var toastMessage = "<div class=\"message\">" + message + "</div>";
        var divStop = "</div>";
        if(autocreate){
            $('.toasts').append(divStart+toastMessage+divStop);
        }
    }


    create(appendTo){
        $(appendTo).append(divStart+toastMessage+divStop);
    }
}