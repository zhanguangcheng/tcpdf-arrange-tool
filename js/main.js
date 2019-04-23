(function() {
    // 当前类型
    var type = 'global';
    // 当前选中组件
    var current = null;
    var global = {
        creator: 'CLF',
        author: 'Grass',
        title: 'Title',
        fontFamily: 'simfang',
        paper: 'A4'
    };

    // 字体列表
    var fontFamily = {
        simfang:"仿宋",
        simhei:"黑体",
        simkai:"楷体",
        msungstdlight:"Sung",
    };

    var alignMap = {
        L: 'flex-start',
        C: 'center',
        R: 'flex-end',
        T: 'flex-start',
        M: 'center',
        B: 'flex-end',
    };

    var runtime = {
        fontFamily: global.fontFamily,
        fontSize: null,
        fontStyleB: false,
        fontStyleI: false,
        fontStyleU: false,
        background: '#ffffff',
        cellPadding: 0,
    };
    var runtimeCopy = $.extend({}, runtime);

    var $form = $('#form');
    var $html = $('#html');
    var $size = $('#size');
    var $output = $('#output');
    var $container = $('#container');
    var $toolBarTitle = $('#tool-bar-title');
    var $toolBarContent = $('#tool-bar-content');

    var actions = {
        text: {
            create: function (opt) {
                var element = document.createElement('div');
                element.className = 'item';
                element.dataset.type = 'text';
                element.style.left = opt['text.x'] + 'mm';
                element.style.top = opt['text.y'] + 'mm';
                element.style.fontSize = opt['text.font.size'] + 'pt';
                element.innerHTML = opt['text.text'];
                element.style.fontFamily = fontFamily[opt['text.font.family']] || '';
                element.dataset.fontFamily = opt['text.font.family'] || '';
                element.style.fontWeight = opt['text.font.style.b'] ? 'bold' : 'normal';
                element.style.fontStyle = opt['text.font.style.i'] ? 'italic' : 'normal';
                element.style.textDecoration = opt['text.font.style.u'] ? 'underline' : 'none';
                return element;
            },
            loadConfig: function (element) {
                $('[value=text').prop('checked', true).change();
                $('[name="text.x"]').val(parseInt(element.style.left));
                $('[name="text.y"]').val(parseInt(element.style.top));
                $('[name="text.font.size"]').val(parseInt(element.style.fontSize));
                $('[name="text.text"]').val(element.innerHTML);
                $('[name="text.font.family"]').val(element.dataset.fontFamily || '');
                $('[name="text.font.style.b"]').prop('checked', element.style.fontWeight === 'bold');
                $('[name="text.font.style.i"]').prop('checked', element.style.fontStyle === 'italic');
                $('[name="text.font.style.u"]').prop('checked', element.style.textDecoration === 'underline');
                $('[name="text.var"]').val(element.dataset.var);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['text.x'] + 'mm';
                element.style.top = opt['text.y'] + 'mm';
                element.style.fontSize = opt['text.font.size'] + 'pt';
                element.style.fontFamily = fontFamily[opt['text.font.family']] || '';
                element.dataset.fontFamily = opt['text.font.family'] || '';
                element.style.fontWeight = opt['text.font.style.b'] ? 'bold' : 'normal';
                element.style.fontStyle = opt['text.font.style.i'] ? 'italic' : 'normal';
                element.style.textDecoration = opt['text.font.style.u'] ? 'underline' : 'none';
                element.innerHTML = opt['text.text'];
                element.dataset.var = opt['text.var'];
            },
            getCode: function (element) {
                var self = this;
                return actions.getPrepareCode(element) + render("$pdf->Text({x}, {y}, {text});", {
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    text: actions.getVariableCode(element, self.getText(element))
                });
            },
            getText: function (element) {
                return element.innerHTML;
            }
        },
        cell: {
            create: function (opt) {
                var element = document.createElement('div');
                element.className = 'item';
                element.dataset.type = 'cell';
                element.style.left = opt['cell.x'] + 'mm';
                element.style.top = opt['cell.y'] + 'mm';
                element.style.width = opt['cell.width'] + 'mm';
                element.style.height = opt['cell.height'] + 'mm';
                element.style.display = 'flex';
                element.style.justifyContent = alignMap[opt['cell.align'].substr(0, 1)];
                element.style.alignItems = alignMap[opt['cell.align'].substr(1, 1)];
                element.dataset.align = opt['cell.align'];
                element.style.fontSize = opt['cell.font.size'] + 'pt';
                element.innerHTML = lnToBr(opt['cell.text']);
                if (opt['cell.border.left']) {
                    element.style.borderLeft = '1px solid #000';
                }
                if (opt['cell.border.top']) {
                    element.style.borderTop = '1px solid #000';
                }
                if (opt['cell.border.right']) {
                    element.style.borderRight = '1px solid #000';
                }
                if (opt['cell.border.bottom']) {
                    element.style.borderBottom = '1px solid #000';
                }
                element.dataset.fit = opt['cell.fit'] ? '1' : '';
                element.style.fontFamily = fontFamily[opt['cell.font.family']] || '';
                element.dataset.fontFamily = opt['cell.font.family'] || '';
                element.style.fontWeight = opt['cell.font.style.b'] ? 'bold' : 'normal';
                element.style.fontStyle = opt['cell.font.style.i'] ? 'italic' : 'normal';
                element.style.textDecoration = opt['cell.font.style.u'] ? 'underline' : 'none';
                element.style.padding = opt['cell.padding'] + 'mm';
                element.style.background = opt['cell.background'];
                element.dataset.background = opt['cell.background'];
                return element;
            },
            loadConfig: function (element) {
                $('[value=cell').prop('checked', true).change();
                $('[name="cell.x"]').val(parseInt(element.style.left));
                $('[name="cell.y"]').val(parseInt(element.style.top));
                $('[name="cell.width"]').val(parseInt(element.style.width));
                $('[name="cell.height"]').val(parseInt(element.style.height));
                $('[name="cell.font.size"]').val(parseInt(element.style.fontSize));
                $('[name="cell.text"]').val(brToLn(element.innerHTML, true));
                $('[name="cell.border.left"]').prop('checked', !!element.style.borderLeft);
                $('[name="cell.border.top"]').prop('checked', !!element.style.borderTop);
                $('[name="cell.border.right"]').prop('checked', !!element.style.borderRight);
                $('[name="cell.border.bottom"]').prop('checked', !!element.style.borderBottom);
                $('[name="cell.align"]').filter('[value='+element.dataset.align+']').prop('checked', true);
                $('[name="cell.fit"]').prop('checked', !!element.dataset.fit);
                $('[name="cell.font.family"]').val(element.dataset.fontFamily || '');
                $('[name="cell.font.style.b"]').prop('checked', element.style.fontWeight === 'bold');
                $('[name="cell.font.style.i"]').prop('checked', element.style.fontStyle === 'italic');
                $('[name="cell.font.style.u"]').prop('checked', element.style.textDecoration === 'underline');
                $('[name="cell.padding"]').val(parseInt(element.style.padding) || 0);
                $('[name="cell.var"]').val(element.dataset.var);
                $('[name="cell.background"]').val(element.dataset.background);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['cell.x'] + 'mm';
                element.style.top = opt['cell.y'] + 'mm';
                element.style.width = opt['cell.width'] + 'mm';
                element.style.height = opt['cell.height'] + 'mm';
                element.style.fontSize = opt['cell.font.size'] + 'pt';
                element.style.justifyContent = alignMap[opt['cell.align'].substr(0, 1)];
                element.style.alignItems = alignMap[opt['cell.align'].substr(1, 1)];
                element.dataset.align = opt['cell.align'];
                element.innerHTML = lnToBr(opt['cell.text']);
                element.style.borderLeft = opt['cell.border.left'] ? '1px solid #000' : '';
                element.style.borderTop = opt['cell.border.top'] ? '1px solid #000' : '';
                element.style.borderRight = opt['cell.border.right'] ? '1px solid #000' : '';
                element.style.borderBottom = opt['cell.border.bottom'] ? '1px solid #000' : '';
                element.dataset.fit = opt['cell.fit'] ? '1' : '';
                element.style.fontFamily = fontFamily[opt['cell.font.family']] || '';
                element.dataset.fontFamily = opt['cell.font.family'] || '';
                element.style.fontWeight = opt['cell.font.style.b'] ? 'bold' : 'normal';
                element.style.fontStyle = opt['cell.font.style.i'] ? 'italic' : 'normal';
                element.style.textDecoration = opt['cell.font.style.u'] ? 'underline' : 'none';
                element.style.padding = opt['cell.padding'] + 'mm';
                element.dataset.var = opt['cell.var'];
                element.style.background = opt['cell.background'];
                element.dataset.background = opt['cell.background'];
            },
            getCode: function (element) {
                var self = this;
                var border = '';
                var align = 'C'
                var valign = 'M';
                border += element.style.borderLeft ? 'L' : '';
                border += element.style.borderTop ? 'T' : '';
                border += element.style.borderRight ? 'R' : '';
                border += element.style.borderBottom ? 'B' : '';
                align = element.dataset.align ? element.dataset.align.substr(0, 1) : align;
                valign = element.dataset.align ? element.dataset.align.substr(1, 1) : valign;
                return actions.getPrepareCode(element) + render("$pdf->MultiCell({width}, {height}, {text}, '{border}', '{align}', {fill}, 1, {x}, {y}, true, 0, false, true, {height}, '{valign}', {fit});", {
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.height),
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    border: border,
                    align: align,
                    valign: valign,
                    fill: element.dataset.background === '#ffffff' ? 'false' : 'true',
                    text: actions.getVariableCode(element, self.getText(element)),
                    fit: element.dataset.fit ? 'true' : 'false'
                });
            },
            getText: function (element) {
                return element.innerHTML;
            }
        },
        qrcode: {
            create: function (opt) {
                var element = document.createElement('div');
                element.className = 'item qrcode';
                element.dataset.type = 'qrcode';
                element.style.left = opt['qrcode.x'] + 'mm';
                element.style.top = opt['qrcode.y'] + 'mm';
                element.style.width = opt['qrcode.width'] + 'mm';
                element.style.height = opt['qrcode.width'] + 'mm';
                element.innerHTML = '二维码';
                element.dataset.text = opt['qrcode.text'];
                element.dataset.border = opt['qrcode.border'] ? '1' : '';
                return element;
            },
            loadConfig: function (element) {
                $('[value=qrcode').prop('checked', true).change();
                $('[name="qrcode.x"]').val(parseInt(element.style.left));
                $('[name="qrcode.y"]').val(parseInt(element.style.top));
                $('[name="qrcode.width"]').val(parseInt(element.style.width));
                $('[name="qrcode.height"]').val(parseInt(element.style.width));
                $('[name="qrcode.text"]').val(element.dataset.text);
                $('[name="qrcode.border"]').prop('checked', !!element.dataset.border);
                $('[name="qrcode.var"]').val(element.dataset.var);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['qrcode.x'] + 'mm';
                element.style.top = opt['qrcode.y'] + 'mm';
                element.style.width = opt['qrcode.width'] + 'mm';
                element.style.height = opt['qrcode.width'] + 'mm';
                element.dataset.text = opt['qrcode.text'];
                element.dataset.border = opt['qrcode.border'] ? '1' : '';
                element.dataset.var = opt['qrcode.var'];
            },
            getCode: function (element) {
                var self = this;
                return render("$pdf->write2DBarcode({text},'QRCODE', {x}, {y}, {width}, {height}, array('padding'=>'auto','border'=>{border}));", {
                    text: actions.getVariableCode(element, self.getText(element)),
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.width),
                    border: element.dataset.border ? 'true' : 'false'
                });
            },
            getText: function (element) {
                return element.dataset.text;
            }
        },
        barcode: {
            create: function (opt) {
                var element = document.createElement('div');
                element.className = 'item barcode';
                element.dataset.type = 'barcode';
                element.style.left = opt['barcode.x'] + 'mm';
                element.style.top = opt['barcode.y'] + 'mm';
                element.style.width = opt['barcode.text'].length * opt['barcode.xres'] * 19 + 'mm';
                element.style.height = opt['barcode.height'] + 'mm';
                element.innerHTML = '条形码';
                element.dataset.text = opt['barcode.text'];
                element.dataset.mode = opt['barcode.mode'];
                element.dataset.xres = opt['barcode.xres'];
                return element;
            },
            loadConfig: function (element) {
                $('[value=barcode').prop('checked', true).change();
                $('[name="barcode.x"]').val(parseInt(element.style.left));
                $('[name="barcode.y"]').val(parseInt(element.style.top));
                $('[name="barcode.height"]').val(parseInt(element.style.height));
                $('[name="barcode.text"]').val(element.dataset.text);
                $('[name="barcode.mode"]').val(element.dataset.mode);
                $('[name="barcode.xres"]').val(element.dataset.xres);
                $('[name="barcode.var"]').val(element.dataset.var);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['barcode.x'] + 'mm';
                element.style.top = opt['barcode.y'] + 'mm';
                element.style.width = opt['barcode.text'].length * opt['barcode.xres'] * 19 + 'mm';
                element.style.height = opt['barcode.height'] + 'mm';
                element.dataset.text = opt['barcode.text'];
                element.dataset.mode = opt['barcode.mode'];
                element.dataset.xres = opt['barcode.xres'];
                element.dataset.var = opt['barcode.var'];
            },
            getCode: function (element) {
                var self = this;
                return render("$pdf->write1DBarcode({text}, '{type}', {x}, {y}, '', {h}, {xres});", {
                    text: actions.getVariableCode(element, self.getText(element)),
                    type: element.dataset.mode,
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    h: parseInt(element.style.height),
                    xres: element.dataset.xres,
                });
            },
            getText: function (element) {
                return element.dataset.text;
            }
        },
        image: {
            create: function (opt) {
                var element = document.createElement('div');
                element.className = 'item image';
                element.dataset.type = 'image';
                element.style.left = opt['image.x'] + 'mm';
                element.style.top = opt['image.y'] + 'mm';
                element.style.width = opt['image.width'] + 'mm';
                element.style.height = opt['image.height'] + 'mm';
                element.innerHTML = '图片';
                element.dataset.url = opt['image.url'];
                return element;
            },
            loadConfig: function (element) {
                $('[value=image').prop('checked', true).change();
                $('[name="image.x"]').val(parseInt(element.style.left));
                $('[name="image.y"]').val(parseInt(element.style.top));
                $('[name="image.width"]').val(parseInt(element.style.width));
                $('[name="image.height"]').val(parseInt(element.style.height));
                $('[name="image.url"]').val(element.dataset.url);
                $('[name="image.var"]').val(element.dataset.var);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['image.x'] + 'mm';
                element.style.top = opt['image.y'] + 'mm';
                element.style.width = opt['image.width'] + 'mm';
                element.style.height = opt['image.height'] + 'mm';
                element.dataset.url = opt['image.url'];
                element.dataset.var = opt['image.var'];
            },
            getCode: function (element) {
                var self = this;
                return render("$pdf->Image({file}, {x}, {y}, {w}, {h});", {
                    file: actions.getVariableCode(element, self.getText(element)),
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    w: parseInt(element.style.width),
                    h: parseInt(element.style.height),
                });
            },
            getText: function (element) {
                return element.dataset.url;
            }
        },
        line: {
            create: function (opt) {
                var element = document.createElement('div');
                element.className = 'item';
                element.dataset.type = 'line';
                element.style.left = opt['line.x'] + 'mm';
                element.style.top = opt['line.y'] + 'mm';
                element.style.width = opt['line.width'] + 'mm';
                return element;
            },
            loadConfig: function (element) {
                $('[value=line').prop('checked', true).change();
                $('[name="line.x"]').val(parseInt(element.style.left));
                $('[name="line.y"]').val(parseInt(element.style.top));
                $('[name="line.width"]').val(parseInt(element.style.width));
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['line.x'] + 'mm';
                element.style.top = opt['line.y'] + 'mm';
                element.style.width = opt['line.width'] + 'mm';
            },
            getCode: function (element) {
                return render("$pdf->Line({x1}, {y1}, {x2}, {y2});", {
                    x1: parseInt(element.style.left),
                    y1: parseInt(element.style.top),
                    x2: parseInt(element.style.left) + parseInt(element.style.width),
                    y2: parseInt(element.style.top)
                });
            },
            getText: function (element) {
                return '';
            }
        },
        getPrepareCode: function (element) {
            var code = [];

            // 字体&样式
            var isB = element.style.fontWeight === 'bold';
            var isI = element.style.fontStyle === 'italic';
            var isU = element.style.textDecoration === 'underline';
            var family = element.dataset.fontFamily || global.fontFamily;
            var background = element.dataset.background || runtime.background;
            var style = (isB ? 'B' : '') + (isI ? 'I' : '') + (isU ? 'U' : '');
            if (
                family !== runtime.fontFamily
                || isB !== runtime.fontStyleB
                || isI !== runtime.fontStyleI
                || isU !== runtime.fontStyleU
            ) {
                code.push(render("$pdf->SetFont(\"{family}\", \"{style}\");", {
                    family: family,
                    style: style
                }));
                runtime.fontFamily = family;
                runtime.fontStyleB = isB;
                runtime.fontStyleI = isI;
                runtime.fontStyleU = isU;
            }

            // 字体大小
            var fontSize = parseInt(element.style.fontSize);
            if (fontSize !== runtime.fontSize) {
                runtime.fontSize = fontSize
                code.push(render('$pdf->SetFontSize({size});', { size: fontSize }));
            }

            // 内边距
            if (element.dataset.type === 'cell') {
                var cellPadding = parseInt(element.style.padding) || 0;
                if (cellPadding !== runtime.cellPadding) {
                    runtime.cellPadding = cellPadding
                    code.push(render('$pdf->setCellPadding({padding});', { padding: cellPadding }));
                }
            }

            // 背景颜色
            if (background !== runtime.background) {
                runtime.background = background;
                code.push(render('$pdf->SetFillColor({r}, {g}, {b});', {
                    r: parseInt(background.substr(1, 2), 16),
                    g: parseInt(background.substr(3, 2), 16),
                    b: parseInt(background.substr(5, 2), 16)
                }));
            }
            return code.join("\n") + (code.length ? "\n" : '');
        },
        getVariableCode: function(element, value) {
            var variable = $.trim(element.dataset.var);
            var page = actions.getElementPage(element);
            value = brToLn(value === undefined ? element.innerHTML : value)
            return variable
                ? "$data['page" + page + "']['" + variable + "']"
                : '\"' + value + '\"'
        },
        getElementPage:function (element) {
            return $(element).parent('.paper').index() + 1;
        },
    }

    // 禁止右键菜单
    document.body.oncontextmenu = function() {
        return false;
    };

    // 关闭窗口确认
    window.onbeforeunload = function() {
        return false;
    };

    // 切换组件类型
    $('input', $toolBarTitle).on('change', function() {
        var index = $(this).parents('li').index();
        type = this.value;
        $($('>li', $toolBarContent)[index]).show().siblings().hide();
    });

    // 画布点击,绘制组件,标记当前组件
    $container.on('mousedown', function(event) {
        if (event.button !== 0) return;
        var opt = getConfig();
        current = null;
        
        $('.active').removeClass('active');
        if ($(event.target).hasClass('item')) {
            $(event.target).addClass('active');
            current = event.target;
            loadConfig(current);
            return true;
        }
        if (type === 'global') {
            return true;
        }
        
        opt[type + '.x'] = parseInt(pxToMm(event.offsetX, 'x'));
        opt[type + '.y'] = parseInt(pxToMm(event.offsetY, 'y'));

        var div = actions[type].create(opt);
        $(div).addClass('active');
        current = div;
        loadConfig(current);
        $(event.target).append(div);
        build();
    });

    // 右键失去当前组件焦点
    $container.on('mousedown', function(event) {
        if (event.button === 2) {
            current = null;
            $('.active').removeClass('active');
        }
    });

    // 拖拽移动组件
    (function(){
        var x = 0;
        var y = 0;
        var l = 0;
        var t = 0;
        var isMouseDown = false;
        var element = null;
        var width = height = 0;

        var component = function() {
            var width, height, offsetX, offsetY, type;
            var getType = function(e) {
                width = parseInt(e.target.style.width);
                height = parseInt(e.target.style.height);
                offsetX = Math.ceil(pxToMm(e.offsetX + 5, 'x'));
                offsetY = Math.ceil(pxToMm(e.offsetY + 5, 'y'));
                if (offsetX >= width && offsetY >= height) {
                    return 'se-resize';
                } else if (offsetX >= width) {
                    return 'e-resize';
                } else if (offsetY >= height) {
                    return 's-resize';
                } else {
                    return 'move';
                }
            };
            return {
                setType: function(e, t) {
                    type = t || getType(e);
                },
                getType: function(e) {
                    return type;
                },
                applyCursor: function(e) {
                    var type = getType(e);
                    e.target.style.cursor = type === 'move' ? '' : type;
                },
            }
        }();

        $(document).on('mousedown', '.item,.droppable', function(e) {
            if ($(e.target).hasClass('item') || $(e.target).hasClass('title')) {
                isMouseDown = true;
                x = e.pageX;
                y = e.pageY;
                l = this.offsetLeft;
                t = this.offsetTop;
                width = parseInt(e.target.style.width);
                height = parseInt(e.target.style.height);
                component.setType(e, 'move');
                
                if (e.target.dataset.type === 'cell' || e.target.dataset.type === 'image') {
                    component.setType(e);
                }
                
                element = this;
            }
        });
        $(document).on('mousemove', function (e) {
            if (e.target.dataset.type === 'cell' || e.target.dataset.type === 'image') {
                component.applyCursor(e);
            }
            
            if (isMouseDown) {
                var nx = e.pageX;
                var ny = e.pageY;
                var nl = nx - (x - l);
                var nt = ny - (y - t);
                var type = component.getType(e);
                switch (type) {
                    case 'se-resize':
                        element.style.width = width + Math.ceil(pxToMm(nx - x, 'x')) + 'mm';
                        element.style.height = height + Math.ceil(pxToMm(ny - y, 'y')) + 'mm';
                        setConfig(e.target.dataset.type + '.width', parseInt(element.style.width));
                        setConfig(e.target.dataset.type + '.height', parseInt(element.style.height));
                        break;
                    case 'e-resize':
                        element.style.width = width + Math.ceil(pxToMm(nx - x, 'x')) + 'mm';
                        setConfig(e.target.dataset.type + '.width', parseInt(element.style.width));
                        break;
                    case 's-resize':
                        element.style.height = height + Math.ceil(pxToMm(ny - y, 'y')) + 'mm';
                        setConfig(e.target.dataset.type + '.height', parseInt(element.style.height));
                        break;
                    default:
                        element.style.left = Math.ceil(pxToMm(nl, 'x')) + 'mm';
                        element.style.top = Math.ceil(pxToMm(nt, 'y')) + 'mm';
                        setConfig(e.target.dataset.type + '.x', parseInt(element.style.left));
                        setConfig(e.target.dataset.type + '.y', parseInt(element.style.top));
                        break;
                }
            }
        });
        $(document).on('mouseup', function () {
            if (isMouseDown) {
                isMouseDown = false;
                build();
            }
        });
    }());
    
    // 键盘移动组件
    $(document).on('keydown', function(event) {
        if (event.target !== document.body) {
            return true;
        }
        if (!current) {
            return true;
        }
        var x = getConfig(type + '.x');
        var y = getConfig(type + '.y');
        if (event.keyCode === 37) {
            x--;
            setConfig(type + '.x', x);
        } else if (event.keyCode === 38) {
            y--;
            setConfig(type + '.y', y);
        } else if (event.keyCode === 39) {
            x++;
            setConfig(type + '.x', x);
        } else if (event.keyCode === 40) {
            y++;
            setConfig(type + '.y', y);
        } else if (event.keyCode === 46) {
            remove(current);
        }
        if ($.inArray(event.keyCode, [37, 38, 39, 40]) !== -1) {
            update(current);
            return false;
        }
        return true;
    });

    // 添加一页
    $('.fn-insert-paper').on('click', function () {
        var size = getPaperSize(global.paper);
        $container.append(render('<div class="paper" style="width: {width};height: {height};"></div>', {
            width: size.width + 'mm',
            height: size.height + 'mm'
        }));
        build();
    });

    // 修改配置,更新组件
    $form.on('input', 'input,textarea', function() {
        if (type === 'global') {
            switch (this.name) {
                case 'global.creator':
                case 'global.author':
                case 'global.title':
                    global[this.name.split('.')[1]] = this.value;
                    break;
            }
            build();
        } else if (current) {
            update(current);
        }
    });
    $form.on('change', 'select', function() {
        if (type === 'global') {
            switch (this.name) {
                case 'global.font.family':
                    global.fontFamily = this.value;
                    $container.css('font-family', this[this.selectedIndex].innerHTML);
                    break;
                case 'global.paper.size':
                    var size = getPaperSize(this.value);
                    global.paper = this.value;
                    $size.html(global.paper + '：' + size.width + '*' + size.height);
                    $container.css('width', size.width + 'mm');
                    $container.find('.paper').css({
                        width: size.width + 'mm',
                        height: size.height + 'mm'
                    });
                    break;
            }
            build();
        } else if (current) {
            update(current);
            if (this.name === 'text.font.family' || this.name === 'cell.font.family') {
                // 特定的字体才有加粗和斜体功能
                $(this).parent()
                    .find('[name*="font.style.b"],[name*="font.style.i"]')
                    .prop('checked', false)
                    .attr('disabled', this.value !== 'msungstdlight');
            }
        }
    });

    $html.on('change', function() {
        var html = $html.val();
        var items = getSnippet(html, 'items');
        try {
            global = JSON.parse(getSnippet(html, 'global'));
        } catch(err) {
        }
        if (items.indexOf('class="paper"') === -1) {
            items = '<div class="paper">' + items + '</div>';
        }
        $container.html(items);
        setConfig('global.title', global.title);
        setConfig('global.creator', global.creator);
        setConfig('global.author', global.author);
        setConfig('global.font.family', global.fontFamily);
        setConfig('global.paper.size', global.paper);
        $form.find('select').trigger('change');
        build();
    });

    function lnToBr(text) {
        return text.replace(/\r\n/g, '<br>');
    }

    function brToLn(text, real) {
        return text.replace(/<br>/g, real ? '\r\n' : '\\r\\n');
    }

    function getSnippet(string, flag) {
        return string.substring(string.indexOf(flag + '@start') + (flag + '@start').length, string.indexOf(flag + '@end'));
    }
    
    // px转mm, type:x|y
    var pxToMm = function () {
        // dpi
        var dpi = function () {
            var arrDPI = {};
            if (window.screen.deviceXDPI != undefined) {
                arrDPI.x = window.screen.deviceXDPI;
                arrDPI.y = window.screen.deviceYDPI;
            } else {
                var tmpNode = document.createElement("div");
                tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
                document.body.appendChild(tmpNode);
                arrDPI.x = parseInt(tmpNode.offsetWidth);
                arrDPI.y = parseInt(tmpNode.offsetHeight);
                tmpNode.parentNode.removeChild(tmpNode);
            }
            return arrDPI;
        }();
        return function(px, type) {
            return px * 25.3 / dpi[type];
        }
    }();

    // 根据组件加载配置
    function loadConfig(element) {
        var type = $(element).data('type');
        actions[type].loadConfig(element);
    }

    // 根据配置更新组件
    function update(element) {
        var type = $(element).data('type');
        actions[type].update(element);
        build();
    }

    // 删除组件
    function remove(element) {
        if (element) {
            $(element).remove();
            build();
        }
    }

    // 设置配置
    function setConfig(key, value) {
        $('[name="' + key + '"]').val(value);
    }

    function build() {
        $html.val(render('global@start{global}global@end items@start{items}items@end', {
            global: JSON.stringify(global),
            items: $container.html()
        }));
        $output.val(getPHPCode());
        runtime = $.extend({}, runtimeCopy);
    }

    function getPHPCode() {
        var code = [
            "$pdf->setPrintHeader(false);",
            "$pdf->setPrintFooter(false);",
            "$pdf->SetMargins(0, 0, 0);",
            "$pdf->setCellPaddings(0, 0, 0, 0);",
            "$pdf->setCellMargins(0, 0, 0, 0);",
            "$pdf->SetAutoPageBreak(false);",
        ];
        var paper = {
            orien: global.paper.substr(-1) == 'L' ? 'L' : 'P',
            size: global.paper.substr(-1) == 'L' ? global.paper.substring(0, global.paper.indexOf('L')) : global.paper,
        };
        var variables = [];
        var pushedKey = [];
        variables.push("$data = array(");
        code.unshift(render("$pdf = new TCPDF('{orien}', 'mm', '{size}', true, 'UTF-8', false);", paper));
        code.push(render("$pdf->SetCreator('{creator}');", { creator: global.creator }));
        code.push(render("$pdf->SetAuthor('{author}');", { author: global.author }));
        code.push(render("$pdf->SetTitle('{title}');", { title: global.title }));
        code.push(render("$pdf->SetFont('{font}');", { font: global.fontFamily }));

        $container.find('.paper').each(function(index) {
            var page = index + 1;
            // 按照top,left排序
            var data = $(this).find('.item').toArray().sort(function(a,b) {
                var x1 = parseInt(a.style.left);
                var x2 = parseInt(b.style.left);
                var y1 = parseInt(a.style.top);
                var y2 = parseInt(b.style.top);
                if (y1 < y2) {
                    return -1;
                } else if (y1 > y2) {
                    return 1;
                }
                if (x1 < x2) {
                    return -1
                } else if (x1 > x2) {
                    return 1;
                }
                return 0;
            });
            
            code.push("\n// page" + page);
            code.push(render("$pdf->AddPage('{orien}', '{size}');", paper));
            variables.push("    'page" + page + "' => array(");
            for (var i=0; i<data.length; i++) {
                var key = $.trim(data[i].dataset.var);
                if (key) {
                    var text = brToLn(actions[data[i].dataset.type].getText(data[i]));
                    if ($.inArray(page + key, pushedKey) === -1) {
                        pushedKey.push(page + key);
                        variables.push("        '" + key + "' => \"" + text + "\",");
                    }
                }
                code.push(actions[data[i].dataset.type].getCode(data[i]));
            }
            variables.push("    ),");
        });
        variables.push(");\n\n");
        
        code.push("\n$pdf->Output();");
        return variables.join("\n") + code.join("\n");
    }

    // 获取配置
    function getConfig(key, defaultValue) {
        defaultValue = defaultValue || '';
        var data = $form.serializeArray();
        var options = {};
        for (var i = 0; i < data.length; i++) {
            options[data[i].name] = data[i].value;
        }
        if (key) {
            if (key in options) {
                return options[key];
            }
            return defaultValue;
        }
        return options;
    }

    var getPaperSize = function () {
        var maps = {
            A3L: { width: 420, height: 297 },
            A3: { width: 297, height: 420 },
            A4L: { width: 297, height: 210 },
            A4: { width: 210, height: 297 },
            A5L: { width: 210, height: 148 },
            A5: { width: 148, height: 210 },
            B4L: { width: 353, height: 250 },
            B4: { width: 250, height: 353 },
            B5L: { width: 250, height: 176 },
            B5: { width: 176, height: 250 },
        };
        return function(paper) {
            return maps[paper];
        }
    }();
    
    /*
     * @param  string template
     * @param  object data 待替换的数据
     * @return string 替换的好字符串
     */
    function render(template, data) {
        var pattern = /\{(\w+)\}(?!})/g;
        return template.replace(pattern, function (match, key, value) {
            return key in data ? data[key] : '';
        });
    }

    // 自动加载/保存代码
    if (typeof localStorage === 'object') {
        var code = localStorage.getItem('html-cache');
        code && $html.val(code).trigger('change');
        (function save() {
            localStorage.setItem('html-cache', $html.val());
            setTimeout(save, 5000);
        })();
    }
}());
