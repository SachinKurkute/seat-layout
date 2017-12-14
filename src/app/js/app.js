$(document).ready(function () {

    function loadGrid() {
        var seatData = $('.inputBox').val();
        var nuberOfSeat = $('.nuberOfSeat').val();
        seatData = JSON.parse(seatData);

        $('.selectMove').seatLayout({
            data: seatData,
            showActionButtons:true,
            classes : {
                doneBtn : '',
                cancelBtn : '',
                row:'',
                area:'',
                screen:'',
                seat:''
            },
            numberOfSeat: nuberOfSeat,
            selectedArea : ['6a535381-ecf6-4b4c-908b-baa27dd1399e'],
 
            callOnSeatSelect: function (_event, _data, _element) {
                console.log(_event);
                console.log(_data);
                console.log(_element);
            },
            selectionDone: function (_array) {
                console.log(_array);
            },
            cancel: function () {
                return false;
            }
        });
    }
    loadGrid();

    $('.call-load-function').click(function(){
        loadGrid();
    });
});