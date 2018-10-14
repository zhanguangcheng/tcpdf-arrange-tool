(function() {
    // 当前类型
    var type = 'global';
    // 当前选中元素
    var current = null;
    var phpVariables = [];
    var global = {
        creator: 'Creator',
        author: 'Author',
        title: 'Title',
        fontFamily: 'simfang',
        paper: 'A4'
    };

    var $form = $('#form');
    var $html = $('#html');
    var $size = $('#size');
    var $output = $('#output');
    var $container = $('#container');
    var $toolBarTitle = $('#tool-bar-title');
    var $toolBarContent = $('#tool-bar-content');

    var actions = {
        text: {
            create: function (options) {
                var div = document.createElement('div');
                div.className = 'item';
                div.style.left = options['text.x'] + 'mm';
                div.style.top = options['text.y'] + 'mm';
                div.style.fontSize = options['text.font.size'] + 'pt';
                div.innerHTML = options['text.text'];
                div.dataset.type = 'text';
                return div;
            },
            loadConfig: function (element) {
                $('[value=text').prop('checked', true).change();
                $('[name="text.x"]').val(parseInt(element.style.left));
                $('[name="text.y"]').val(parseInt(element.style.top));
                $('[name="text.font.size"]').val(parseInt(element.style.fontSize));
                $('[name="text.text"]').val(element.innerHTML);
            },
            update: function (element) {
                var options = getConfig();
                element.style.left = options['text.x'] + 'mm';
                element.style.top = options['text.y'] + 'mm';
                element.style.fontSize = options['text.font.size'] + 'pt';
                element.innerHTML = options['text.text'];
            },
            getCode: function (element) {
                return render("$pdf->Text({x}, {y}, {text});", {
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    text: prepareText(element.innerHTML)
                });
            }
        },
        cell: {
            create: function (opt) {
                var div = document.createElement('div');
                div.className = 'item';
                div.style.left = opt['cell.x'] + 'mm';
                div.style.top = opt['cell.y'] + 'mm';
                div.style.width = opt['cell.width'] + 'mm';
                div.style.height = opt['cell.height'] + 'mm';
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.justifyContent = opt['cell.align'];
                div.style.fontSize = opt['cell.font.size'] + 'pt';
                div.style.textAlign = opt['cell.align'];
                div.innerHTML = lnToBr(opt['cell.text']);
                if (opt['cell.border.left']) {
                    div.style.borderLeft = '1px solid #000';
                }
                if (opt['cell.border.top']) {
                    div.style.borderTop = '1px solid #000';
                }
                if (opt['cell.border.right']) {
                    div.style.borderRight = '1px solid #000';
                }
                if (opt['cell.border.bottom']) {
                    div.style.borderBottom = '1px solid #000';
                }
                div.dataset.type = 'cell';
                return div;
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
                $($('[name="cell.align"]').get({'flex-start':0,'center':1,'flex-end':2}[element.style.justifyContent])).prop('checked', true);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['cell.x'] + 'mm';
                element.style.top = opt['cell.y'] + 'mm';
                element.style.width = opt['cell.width'] + 'mm';
                element.style.height = opt['cell.height'] + 'mm';
                element.style.fontSize = opt['cell.font.size'] + 'pt';
                element.style.justifyContent = opt['cell.align'];
                element.innerHTML = lnToBr(opt['cell.text']);
                element.style.borderLeft = opt['cell.border.left'] ? '1px solid #000' : '';
                element.style.borderTop = opt['cell.border.top'] ? '1px solid #000' : '';
                element.style.borderRight = opt['cell.border.right'] ? '1px solid #000' : '';
                element.style.borderBottom = opt['cell.border.bottom'] ? '1px solid #000' : '';
            },
            getCode: function (element) {
                var border = align = '';
                border += element.style.borderLeft ? 'L' : '';
                border += element.style.borderTop ? 'T' : '';
                border += element.style.borderRight ? 'R' : '';
                border += element.style.borderBottom ? 'B' : '';
                align = { 'flex-start': 'L', 'center': 'C', 'flex-end': 'R' }[element.style.justifyContent];
                return render("$pdf->MultiCell({width}, {height}, {text}, '{border}', '{align}', false, 1, {x}, {y}, true, 0, false, true, {height}, 'M');", {
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.height),
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    border: border,
                    align: align,
                    text: prepareText(brToLn(element.innerHTML))
                });
            }
        },
        qrcode: {
            create: function (opt) {
                var div = document.createElement('div');
                div.className = 'item qrcode';
                div.style.left = opt['qrcode.x'] + 'mm';
                div.style.top = opt['qrcode.y'] + 'mm';
                div.style.width = opt['qrcode.width'] + 'mm';
                div.style.height = opt['qrcode.width'] + 'mm';
                div.style.lineHeight = opt['qrcode.width'] + 'mm';
                div.style.textAlign = 'center';
                div.innerHTML = '二维码';
                div.dataset.type = 'qrcode';
                div.dataset.text = opt['qrcode.text'];
                div.dataset.border = opt['qrcode.border'] ? '1' : '';
                return div;
            },
            loadConfig: function (element) {
                $('[value=qrcode').prop('checked', true).change();
                $('[name="qrcode.x"]').val(parseInt(element.style.left));
                $('[name="qrcode.y"]').val(parseInt(element.style.top));
                $('[name="qrcode.width"]').val(parseInt(element.style.width));
                $('[name="qrcode.height"]').val(parseInt(element.style.width));
                $('[name="qrcode.text"]').val(element.dataset.text);
                $('[name="qrcode.border"]').prop('checked', !!element.dataset.border);
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['qrcode.x'] + 'mm';
                element.style.top = opt['qrcode.y'] + 'mm';
                element.style.width = opt['qrcode.width'] + 'mm';
                element.style.height = opt['qrcode.width'] + 'mm';
                element.style.lineHeight = opt['qrcode.width'] + 'mm';
                element.dataset.text = opt['qrcode.text'];
                element.dataset.border = opt['qrcode.border'] ? '1' : '';
            },
            getCode: function (element) {
                return render("$pdf->write2DBarcode({text},'QRCODE', {x}, {y}, {width}, {height}, array('padding'=>'auto','border'=>{border}));", {
                    text: prepareText(element.dataset.text),
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.width),
                    border: element.dataset.border ? 'true' : 'false'
                });
            }
        },
        underline: {
            create: function (opt) {
                var div = document.createElement('div');
                div.className = 'item';
                div.style.left = opt['underline.x'] + 'mm';
                div.style.top = opt['underline.y'] + 'mm';
                div.style.width = opt['underline.width'] + 'mm';
                div.style.borderTop = '2px solid #000';
                div.dataset.type = 'underline';
                return div;
            },
            loadConfig: function (element) {
                $('[value=underline').prop('checked', true).change();
                $('[name="underline.x"]').val(parseInt(element.style.left));
                $('[name="underline.y"]').val(parseInt(element.style.top));
                $('[name="underline.width"]').val(parseInt(element.style.width));
            },
            update: function (element) {
                var opt = getConfig();
                element.style.left = opt['underline.x'] + 'mm';
                element.style.top = opt['underline.y'] + 'mm';
                element.style.width = opt['underline.width'] + 'mm';
            },
            getCode: function (element) {
                return render("$pdf->Line({x1}, {y1}, {x2}, {y2});", {
                    x1: parseInt(element.style.left),
                    y1: parseInt(element.style.top),
                    x2: parseInt(element.style.left) + parseInt(element.style.width),
                    y2: parseInt(element.style.top)
                });
            }
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

    // 切换元素类型
    $('input', $toolBarTitle).on('change', function() {
        var index = $(this).parents('li').index();
        type = this.value;
        $($('>li', $toolBarContent)[index]).show().siblings().hide();
    });

    // 画布点击,绘制元素,标记当前元素
    $container.on('click', function(event) {
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
        $container.append(div);
        build();
    });

    // 右键失去当前元素焦点
    $container.on('mousedown', function(event) {
        if (event.button === 2) {
            current = null;
            $('.active').removeClass('active');
        }
    });

    // 拖拽移动元素
    (function(){
        var x = 0;
        var y = 0;
        var l = 0;
        var t = 0;
        var isMouseDown = false;
        var element = null;
        $container.on('mousedown', '.item', function(e) {
            isMouseDown = true;
            x = e.pageX;
            y = e.pageY;
            l = this.offsetLeft;
            t = this.offsetTop;
            element = this;
        });
        $(document).on('mousemove', function (e) {
            if (isMouseDown) {
                var nx = e.pageX;
                var ny = e.pageY;
                var nl = nx - (x - l);
                var nt = ny - (y - t);
                element.style.left = Math.ceil(pxToMm(nl, 'x')) + 'mm';
                element.style.top = Math.ceil(pxToMm(nt, 'y')) + 'mm';
            }
        });
        $(document).on('mouseup', function () {
            if (isMouseDown) {
                isMouseDown = false;
                build();
            }
        });
    }());
    
    // 键盘移动元素
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

    // 修改配置,更新元素
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
                    $size.html(size.width + '*' + size.height);
                    $container.css({
                        width: size.width + 'mm',
                        height: size.height + 'mm'
                    });
                    break;
            }
            build();
        } else if (current) {
            update(current);
        }
    });

    $html.on('change', function() {
        var html = $html.val();
        try {
            global = JSON.parse(getSnippet(html, 'global'));
        } catch {
        }
        $container.html(getSnippet(html, 'items'));
        $output.val(getPHPCode());
        setConfig('global.title', global.title);
        setConfig('global.creator', global.creator);
        setConfig('global.author', global.author);
        setConfig('global.font.family', global.fontFamily);
        setConfig('global.paper.size', global.paper);
        $form.find('select').trigger('change');
    });

    function lnToBr(text) {
        return text.replace(/\r\n/g, '<br>');
    }

    function brToLn(text, real) {
        return text.replace(/<br>/g, real ? '\r\n' : '\\r\\n');
    }

    function getSnippet(string, flag) {
        return string.substring(string.indexOf(flag + '@start')+(flag+'@start').length, string.indexOf(flag + '@end'));
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

    // 预处理一下文本,可能包含变量
    function prepareText(text) {
        if (text.substr(0, 1) === '$') {
            phpVariables.push(text.substr(1));
            return "$data['page1']['" + text.substr(1) + "']";
        }
        return '\"' + text + '\"';
    }

    // 根据元素加载配置
    function loadConfig(element) {
        var type = $(element).data('type');
        actions[type].loadConfig(element);
    }

    // 根据配置更新元素
    function update(element) {
        var type = $(element).data('type');
        actions[type].update(element);
        build();
    }

    // 删除元素
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
    }

    function getPHPCode() {
        // 按照top,left排序
        var data = $container.find('.item').toArray().sort(function(a,b) {
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
        var code = [
            "$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);",
            "$pdf->setPrintHeader(false);",
            "$pdf->setPrintFooter(false);",
            "$pdf->SetMargins(0, 0, 0);",
            "$pdf->setCellPaddings(0, 0, 0, 0);",
            "$pdf->setCellMargins(0, 0, 0, 0);",
            "$pdf->SetAutoPageBreak(false);",
        ];

        code.push(render("$pdf->SetCreator('{creator}');", { creator: global.creator}));
        code.push(render("$pdf->SetAuthor('{author}');", { author: global.author}));
        code.push(render("$pdf->SetTitle('{title}');", {title: global.title}));
        code.push(render("$pdf->SetFont('{font}');", {font: global.fontFamily}));
        code.push(render("$pdf->AddPage('', '{format}');", {format: global.paper}));

        var fontSize = '';
        var itemFontSize = null;
        for (var i=0; i<data.length; i++) {
            itemFontSize = parseInt(data[i].style.fontSize);
            if (itemFontSize && fontSize !== itemFontSize) {
                code.push(render('$pdf->SetFontSize({size});', {size: itemFontSize}));
                fontSize = itemFontSize;
            } 
            code.push(actions[data[i].dataset.type].getCode(data[i]));
        }

        code.push(render("$pdf->Output('{title}.pdf', 'I');", { title: global.title }));
        var variables = [];
        if (phpVariables.length) {
            variables.push("$data['page1'] = array(");
            for (var i = 0; i < phpVariables.length; i++) {
                variables.push("    '" + phpVariables[i] + "' => '',");
            }
            variables.push(");\n");
        }
        phpVariables = [];
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
            A3: { width: 297, height: 420 },
            A4: { width: 210, height: 297 },
            A5: { width: 148, height: 210 },
            B4: { width: 250, height: 353 },
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
}());
