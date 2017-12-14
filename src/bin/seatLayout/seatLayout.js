/*!
* Seat Layout Library v0.01
* Copyright (c) 2017 Sachin Kurkute
* MIT License : https://github.com/SachinKurkute/movie-seat-layout/blob/master/LICENSE
*/
(function ($) {
    function Movieseat(_paramObject) {
        var maxSeat, minSeat, pluginOptions = $.extend({},_paramObject.options);
        var getMainLayoutFunc = function (_obj) {
        //    maxSeat = _obj.intMaxSeatId;
        //    minSeat = _obj.intMinSeatId;
            var _html = "<div class='seat-selection' style='width:" + (41 + 1) * 25.5 + "px'>";
            for (var i = 0; i < _obj.SeatAreas.length; i++) {
                _html += getAreaLayoutFunc(_obj.SeatAreas[i]);
            }
            var indicators = '<div class="seat-indicators">\
            <span class="indicator"><span class="available"></span> Available </span>\
            <span class="indicator"><span class="booked"></span> Booked </span>\
            <span class="indicator"><span class="selected"></span> Selected </span>\
            <span class="indicator"><span class="not-allowed"></span> Not Allowed </span>\
            </div>'
            var actionPanel = pluginOptions.showActionButtons?"<div class='seat-proccess-panel'> <button  type='button' class='layout-action-btn layout-btn-cancel  "+ pluginOptions.classes.cancelBtn +"'> Cancel </button> <button type='button' class='layout-action-btn layout-btn-done "+ pluginOptions.classes.doneBtn +"'> Done </button> </div>":"";
            _html += "<div class='movie-screen "+ pluginOptions.classes.screen +"'>-- Screen --</div>" + indicators + actionPanel +"</div>";
            return _html;
        }
        var getAreaLayoutFunc = function (_obj) {
            var _html = "<div class='seat-area "+ pluginOptions.classes.area +"'>";
            _html += "<div class='seat-area-desc'>" + _obj.AreaDescription + "</div>";
            for (var i = 0; i < _obj.Rows.length; i++) {
                _html += getRowLayoutFunc(_obj.Rows[i], _obj);
            }
            _html += "</div>";
            return _html;
        }
        var getRowLayoutFunc = function (_obj, _area) {
            var _html = "<ul class='seat-area-row "+ pluginOptions.classes.row +"'> <li class='seat-row-seat row-indicator'>" + _obj.RowId + "</li>";
            var totalSpace = 0;
            for (var i = 0; i < _obj.Seats.length; i++) {
                if (_obj.Seats[i].Status == 'NoSeat') {
                    _html += getSeatLayoutFunc({}, false, _obj, _area);
                }else{
                    _html += getSeatLayoutFunc(_obj.Seats[i], true, _obj, _area);
                }
            }
            _html += "</ul>";
            return _html;
        }
        getSeatLayoutFunc = function (_obj, isSeat, _row, _area) {
            _obj.RowId = _row.RowId;
            _obj.RowNo = _row.RowNo;
            _obj.AreaId = _area.AreaId;
            _obj.AreaCode = _area.AreaCode;
            _obj.AreaNumber = _area.AreaNumber;
            _obj = _paramObject.callSeatRender(_obj);
            if (_obj) {
                var dataString = JSON.stringify(_obj);
                var classes = pluginOptions.classes.seat;
                if (isSeat) {
                    if (_obj && _obj.Status == "Available" && pluginOptions.selectedArea.indexOf(_area.AreaId) > -1) {
                        classes += " can-select";
                    }
                    if(_obj && _obj.Status == "Booked"){
                        classes += " seat-booked";
                    }
                    return "<li data-seatdefination='" + dataString + "' class='seat-row-seat seat-yes " + classes + " '><span> </span></li>";
                } else {
                    return "<li class='seat-row-seat " + classes + "'></li>";
                }
            }
        }
        return {
            getAreaLayout: getAreaLayoutFunc,
            getRowLayout: getRowLayoutFunc,
            getSeatLayout: getSeatLayoutFunc,
            getMainLayout: getMainLayoutFunc
        }
    }
    $.fn.seatLayout = function (_options) {
        var _optionsObj = $.extend(true,{},{
            type:'movie',
            showActionButtons:true,
            classes : {
                doneBtn : '',
                cancelBtn : '',
                seat:'',
                row:'',
                area:'',
                screen:''
            },
            numberOfSeat:1
        },_options);
        var selectedSeats = [];
        var nuberOfSeat = _optionsObj.numberOfSeat;
        var tempSelected = 0;
        var _el = this;
        var _html = "";
        var seatInstance = new Movieseat({
            callSeatRender: function (_seatObj) {
                if (_optionsObj.callOnSeatRender) {
                    return _optionsObj.callOnSeatRender(_seatObj);
                }
                return _seatObj;
            },
            options : _optionsObj
        });
        _html = seatInstance.getMainLayout(_optionsObj.data);
        _el.html(_html);
        function getObjData(_ele) {
            return _ele.data('seatdefination');
        }
        _el.find('li').click(function (e) {
            if ($(this).hasClass('can-select')) {
                var seatData = getObjData($(this))
                var nextAll = $(this).nextAll().andSelf();
                if (selectedSeats.length == nuberOfSeat) {
                    tempSelected = 0;
                    selectedSeats = [];
                    _el.find('li.current-selected').removeClass('current-selected');
                }
                var count = tempSelected;
                for (var i = 0; i < nuberOfSeat - tempSelected; i++) {
                    if (nextAll[i] && $(nextAll[i]).hasClass('can-select') && !$(nextAll[i]).hasClass('current-selected')) {
                        selectedSeats.push(getObjData($(nextAll[i])));
                        $(nextAll[i]).addClass('current-selected');
                        count++;
                    } else {
                        break;
                    }
                }
                tempSelected = count;
                _el.find('.layout-btn-done').prop('disabled', !(nuberOfSeat == selectedSeats.length));
                var dataToPass = $.extend({}, getObjData($(this)));
                dataToPass.selected = selectedSeats;
                _optionsObj.callOnSeatSelect(e, dataToPass, this);
            }
        });

        _el.find('.layout-btn-done').prop('disabled', true);
        _el.find('.layout-btn-done').click(function (e) {
            if (_optionsObj.selectionDone) {
                _optionsObj.selectionDone({ "selected": selectedSeats });
            }
        });
        _el.find('.layout-btn-cancel').click(function (e) {
            returnFlag = true;
            if (_optionsObj.cancel) {
                returnFlag = _optionsObj.cancel(e) == false ? false : true;
            }
            if (returnFlag) {
                $(_el).remove();
                seatInstance = null;
                _optionsObj = null;
            }
        });
        return this;
    };
})(jQuery);
