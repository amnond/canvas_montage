# Canvas Collage
This is a simple, self-contained vanilla JavaScript object-oriented implementation (without using classes) of a collage maker 
that enables supplying a parameter for the url of a static background image and a parameter of the list of urls for the foreground images which can be dragged and resized.

# Self-contained example
Code is better than words:

```html
<!DOCTYPE html>
<html>
    <body onLoad='init()'>
    <head>
        <script type="text/javascript" src="./canvas_collage.js"></script>
    </head>

    <canvas style='border:black solid 1px;' id="canvas"></canvas>
    <script type="text/javascript">
    function init() {
        var background_url = "https://interfacelift.com/wallpaper/previews/03474_rollingplanes_large@1x.jpg";

        var foreground_urls = [
            "https://cdn.pixabay.com/photo/2014/04/14/20/11/pink-324175_640.jpg",
            "https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_640.jpg",
            "https://cdn.pixabay.com/photo/2013/10/02/23/03/mountains-190055_640.jpg",
            "https://cdn.pixabay.com/photo/2016/01/08/11/57/butterflies-1127666_640.jpg",
            "https://cdn.pixabay.com/photo/2015/11/16/16/28/bird-1045954_640.jpg"
        ];

        var imanager = image_manager('canvas', background_url, foreground_urls);
    }
    </script>

    </body>
<html>
```
# Demo
See the result of the above code  [here](https://fixpix.net/canvas_collage.html)
