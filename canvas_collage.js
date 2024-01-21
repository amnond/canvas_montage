// Amnon David
// This started by looking at an old answer on stackoverflow:
// https://stackoverflow.com/a/19101826/1477876
// The suggested code was redesigned to be object oriented and expanded to support dragging and
// resizing multiple images on top of a static background image.

function draggable_image(imngr, img_url, init_x, init_y) {

    var m_id = getFilename(img_url);
    var m_pi2 = Math.PI * 2;
    var m_resizerRadius = 8;
    var m_rr = m_resizerRadius * m_resizerRadius;
    var m_draggingResizer = -1;
    var m_draggingImage = null;
    var m_imgLoadState = "wait";
    var m_canvas = imngr.get_canvas();
    var m_mngr = imngr;
    var m_ctx = m_canvas.getContext("2d");
    var m_imageX = typeof(init_x) == 'number' ? parseInt(init_x) : 50;
    var m_imageY = typeof(init_x) == 'number' ? parseInt(init_y) : 50;
    var m_img_ar = 1.0;
    var m_width = 100;
    var m_height = 100;
    var m_right = 0;
    var m_bottom = 0;
    var m_img = new Image()    
    var m_startX = m_imageX;
    var m_startY = m_imageY;

    m_img.onload = function() {
        m_width = m_img.width;
        m_height = m_img.height;
        m_right = m_imageX + m_width;
        m_bottom = m_imageY + m_height;
        m_img_ar = m_width / m_height;
        
        m_ctx.drawImage(m_img, m_imageX, m_imageY);
        if (m_imgLoadState == 'wait') {
            m_img.src = img_url;
            m_imgLoadState = 'downloading';
        }
        m_mngr.redraw_canvas();
        
    }
    m_img.src = 'loader.svg';

    function getFilename(url) {
        let urlObject = new URL(url);
        let pathname = urlObject.pathname;
        let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        return filename;
    }
    
    function calc_width_height(width, height) {
        var minsize = 35
        if (width < minsize) {
            width = minsize;
        }
        if (height < minsize) {
            height = minsize;
        }

        var new_area = width * height;
        // Calculate the new width
        var new_width = parseInt(Math.sqrt(new_area * m_img_ar));

        // Calculate the new height
        var new_height = new_area / new_width;

        // Return the new dimensions
        retval = {'width':new_width, 'height':new_height};
        return retval;
    }

    var obj = {};

    //----------------------------------------------------------------------------------------------
    obj.get_id = function() {
        return m_id;
    }

    //----------------------------------------------------------------------------------------------
    obj.drawDragAnchors = function() {
        obj.drawDragAnchor(m_imageX, m_imageY);
        obj.drawDragAnchor(m_right, m_imageY);
        obj.drawDragAnchor(m_right, m_bottom);
        obj.drawDragAnchor(m_imageX, m_bottom);
    }

    //----------------------------------------------------------------------------------------------
    obj.drawDragAnchor = function(x, y) {
        m_ctx.beginPath();
        m_ctx.arc(x, y, m_resizerRadius, 0, m_pi2, false);
        m_ctx.closePath();
        m_ctx.fillStyle = 'yellow';
        m_ctx.fill();
    }

    //----------------------------------------------------------------------------------------------
    obj.anchorHitTest = function(x, y) {
        var dx, dy;
        //console.log(`anchorHitTest for ${m_id}`);

        // top-left
        dx = x - m_imageX;
        dy = y - m_imageY;
        if (dx * dx + dy * dy <= m_rr) {
            return (0);
        }
        // top-right
        dx = x - m_right;
        dy = y - m_imageY;
        if (dx * dx + dy * dy <= m_rr) {
            return (1);
        }
        // bottom-right
        dx = x - m_right;
        dy = y - m_bottom;
        if (dx * dx + dy * dy <= m_rr) {
            return (2);
        }
        // bottom-left
        dx = x - m_imageX;
        dy = y - m_bottom;
        if (dx * dx + dy * dy <= m_rr) {
            return (3);
        }
        return (-1);
    }

    //----------------------------------------------------------------------------------------------
    obj.hitImage = function(x, y) {
        return (x > m_imageX && x < m_imageX + m_width && y > m_imageY && y < m_imageY + m_height);
    }

    //----------------------------------------------------------------------------------------------
    obj.handleMouseDown = function(x,y) {
        m_startX = x;
        m_startY = y;
        m_draggingResizer = obj.anchorHitTest(x,y);
        m_draggingImage = m_draggingResizer < 0 && obj.hitImage(x,y);
        //console.log(`handleMouseDown: id=${m_id}`);
    }

    //----------------------------------------------------------------------------------------------
    obj.handleMouseUp = function() {
        m_draggingResizer = -1;
        m_draggingImage = false;
        //console.log(`handleMouseUp: id=${m_id}`);
    }

    //----------------------------------------------------------------------------------------------
    obj.draw = function(withAnchors, withBorders) {
        if (typeof(withAnchors) == 'undefined') {
            withAnchors = false;
        }
        if (typeof(withBorders) == 'undefined') {
            withBorders = false;
        }
        
        // draw the image in the new place
        m_ctx.drawImage(m_img, m_imageX, m_imageY, m_width, m_height);

        // optionally draw the draggable anchors
        if (withAnchors) {
            obj.drawDragAnchors()
        }

        // optionally draw the connecting anchor lines
        if (withBorders) {
            m_ctx.beginPath();
            m_ctx.moveTo(m_imageX, m_imageY);
            m_ctx.lineTo(m_right, m_imageY);
            m_ctx.lineTo(m_right, m_bottom);
            m_ctx.lineTo(m_imageX, m_bottom);
            m_ctx.closePath();
            m_ctx.strokeStyle = 'blue';
            m_ctx.stroke();
        }

    }
    //----------------------------------------------------------------------------------------------
    obj.handleMouseMove = function(mouseX, mouseY) {
        if (m_draggingResizer > -1) {
            // resize the image
            switch (m_draggingResizer) {
                case 0:
                    //top-left
                    var new_width = m_right - mouseX;
                    var new_height = m_bottom - mouseY;
                    var calc = calc_width_height(new_width, new_height);
                    m_width = calc.width;
                    m_height = calc.height;
                    m_imageX = mouseX;
                    m_imageY = mouseY;
                    break;
                case 1:
                    //top-right
                    var new_width = mouseX - m_imageX;
                    var new_height = m_bottom - mouseY;
                    var calc = calc_width_height(new_width, new_height);
                    m_width = calc.width;
                    m_height = calc.height;
                    m_imageX = mouseX - m_width;
                    m_imageY = mouseY;
                    break;

                case 2:
                    //bottom-right
                    var new_width = mouseX - m_imageX;
                    var new_height = mouseY - m_imageY;
                    var calc = calc_width_height(new_width, new_height);
                    m_width = calc.width;
                    m_height = calc.height;
                    m_imageX = mouseX - m_width;
                    m_imageY = mouseY - m_height;
                    break;
                case 3:
                    //bottom-left
                    var new_width = m_right - mouseX;
                    var new_height = mouseY - m_imageY;
                    var calc = calc_width_height(new_width, new_height);
                    m_width = calc.width;
                    m_height = calc.height;
                    m_imageX = mouseX;
                    m_imageY = mouseY - m_height;
                    break;
            }

            // set the image right and bottom
            m_right = m_imageX + m_width;
            m_bottom = m_imageY + m_height;


        } else if (m_draggingImage) {
            // move the image by the amount of the latest drag
            var dx = mouseX - m_startX;
            var dy = mouseY - m_startY;
            m_imageX += dx;
            m_imageY += dy;
            m_right += dx;
            m_bottom += dy;
            // reset the startXY for next time
            m_startX = mouseX;
            m_startY = mouseY;
        }
    }
    
    //----------------------------------------------------------------------------------------------
    return obj;
}

function image_manager(canvas_id, background_url, foreground_urls) {
    //---------------------------------------------------------------------------------
    // Private methods and variables
    var m_canvas = document.getElementById(canvas_id);
    var m_ctx = m_canvas.getContext("2d");
    var m_main_image = new Image();
    var m_main_image_state = 'none'
    var m_images = [];

    function draw_background_image() {
        m_ctx.canvas.width = m_main_image.width;
        m_ctx.canvas.height = m_main_image.height;
        m_ctx.drawImage(m_main_image, 0, 0, m_main_image.width, m_main_image.height);
    }
    
    function getCanvasOffset() {
        var rect = m_canvas.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
        };
    }    

    var obj = {};

    //---------------------------------------------------------------------------------
    // Public methods and variables

    obj.get_canvas = function() {
        return m_canvas;
    }

    obj.redraw_canvas = function() {
        draw_background_image();

        // Display all images
        var last = m_images.length-1
        for (var i=0; i<last; i++) {
            var img = m_images[i];
            img.draw();
        }
        // last image is the one in focus so draw borders and anchors
        m_images[last].draw(true, true);
    }

    m_main_image.onload = function() {
        draw_background_image();
        if (m_main_image_state == 'none') {
            // loader image has been displayed, request actual background image
            m_main_image.src = background_url;
            m_main_image_state = 'getting_background';
            return;
        }
        // Actual background image has been displayed, create foreground images
        for (var i=0; i<foreground_urls.length; i++) {
            var offset = (i+2)*30
            m_images.push(draggable_image(obj, foreground_urls[i], offset, offset));
        }
    }

    obj.handleMouseDown = function(e) {
        var canvasOffset = getCanvasOffset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;
        var x = parseInt(e.clientX - offsetX);
        var y = parseInt(e.clientY - offsetY);

        var last = m_images.length - 1;
        
        // Check if anchor clicked for image in focus
        focused_image = m_images[last];
        if (focused_image.anchorHitTest(x,y) > -1) {
            focused_image.handleMouseDown(x,y);
            //console.log(`anchor click for ${focused_image.get_id()}`);
            return;
        }

        // Check if focus has been changed
        var new_focused = last;
        for (var i=last; i>=0; i--) {
            var img = m_images[i];
            if (img.hitImage(x,y)) {
                new_focused = i;
                break;
            }
        }

        // Same image is in focus, nothing to do
        if (new_focused == last) {
            m_images[last].handleMouseDown(x,y);
            //console.log(`focus remains for ${m_images[last].get_id()}`);
            return;
        }

        // Switch focus to new image
        var img_new_focused = m_images[new_focused];
        //console.log(`focus changed to ${img_new_focused.get_id()}`);

        // lower all images above this image one level back
        for (var i=new_focused; i<last; i++) {
            m_images[i] = m_images[i+1];
        }
        // and bring this image to the top
        m_images[last] = img_new_focused;

        // Now draw the new focused image border and anchor
        img_new_focused.handleMouseDown(x,y);
        obj.redraw_canvas();
    }

    obj.handleMouseUp = function(e) {
        var last = m_images.length - 1;
        m_images[last].handleMouseUp();
    }

    obj.handleMouseMove = function(e) {
        var canvasOffset = getCanvasOffset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;

        var mouseX = parseInt(e.clientX - offsetX);
        var mouseY = parseInt(e.clientY - offsetY);

        var min = 20
        var max_x = m_main_image.width - min;
        var max_y = m_main_image.height - min;
        if (mouseX < min) {
            mouseX = min;
        }
        if (mouseY < min) {
            mouseY = min;
        }
        if (mouseX > max_x) {
            mouseX = max_x;
        }
        if (mouseY > max_y) {
            mouseY = max_y;
        }

        obj.redraw_canvas();

        var focused_image = m_images[m_images.length - 1];

        var grab_cursor = false;
        var cursor = focused_image.anchorHitTest(mouseX, mouseY);
        if (cursor > -1) {
            var dirs = ['nwse-resize', 'nesw-resize', 'nwse-resize', 'nesw-resize']
            m_canvas.style.cursor = dirs[cursor];
        }
        else {
            for (var i=m_images.length-1; i>=0; i--) {
                var img = m_images[i];
                
                if (img.hitImage(mouseX, mouseY)) {
                    grab_cursor = true;
                    break;
                }
            }
            if (grab_cursor) {
                m_canvas.style.cursor = 'grab';
            }
            else {
                m_canvas.style.cursor = 'default';
            }
        }

        focused_image.handleMouseMove(mouseX, mouseY);
        focused_image.draw(true, true) ;
    }

    function init() {
        m_main_image.src = "loader.svg"; // put a local loader image as the background image
        m_canvas.ontouchstart = function(e){
            e.preventDefault();
            var touch = e.touches[0]; // Get the first touch
            obj.handleMouseDown(touch);
        };

        m_canvas.ontouchmove = function(e){
            var touch = e.touches[0]; // Get the first touch
            e.stopPropagation();
            e.preventDefault();
            obj.handleMouseMove(touch);
        };

        m_canvas.ontouchend = function(e){
            var touch = e.touches[0]; // Get the first touch
            obj.handleMouseUp(touch);
        };

        m_canvas.ontouchcancel = function(e){
            var touch = e.touches[0]; // Get the first touch
            obj.handleMouseUp(touch);
        };


        m_canvas.onmousedown = function (e) {
            obj.handleMouseDown(e);
        };

        m_canvas.onmousemove = function (e) {
            obj.handleMouseMove(e);
        };


        m_canvas.onmouseup = function (e) {
            obj.handleMouseUp(e);
        };

        m_canvas.onmouseout =function (e) {
            obj.handleMouseUp(e);
        };
    }

    init();
    return obj;
}

